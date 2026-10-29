//! Three engines on this machine, talking over real UDP sockets:
//! clock lock, hole punching, timestamped audio, delay maths and host relay.

use std::sync::Arc;
use std::time::{Duration, Instant};
use tc_engine::band::{Mode, Session};
use tc_engine::ring::FRAME;
use tc_engine::{Engine, InFrame};

fn lo(cands: &[String]) -> Vec<String> {
    // keep only the loopback candidate so the test doesn't depend on the LAN
    cands.iter().filter(|c| c.starts_with("127.0.0.1")).cloned().collect()
}

fn wait(mut f: impl FnMut() -> bool, ms: u64) -> bool {
    let t = Instant::now();
    while t.elapsed() < Duration::from_millis(ms) {
        if f() {
            return true;
        }
        std::thread::sleep(Duration::from_millis(20));
    }
    false
}

fn send_marker(e: &Arc<Engine>, ts: i64, val: f32) {
    let mut d = [0f32; FRAME];
    for (i, x) in d.iter_mut().enumerate() {
        *x = val * (1.0 - i as f32 / FRAME as f32);
    }
    e.inject(InFrame { ts, data: d });
}

#[test]
fn three_players_lock_together() {
    let room = "ABCDE";
    let (hk, ak, bk) = ("tcjam-abcde", "player-a", "player-b");
    let h = Engine::new();
    std::thread::sleep(Duration::from_millis(30)); // different clock bases
    let a = Engine::new();
    std::thread::sleep(Duration::from_millis(70));
    let b = Engine::new();
    for e in [&h, &a, &b] {
        e.set_codec(tc_engine::codec::Codec::Pcm, 0).unwrap();
    }
    let hi = h.net_open(room, hk, hk, 0).unwrap();
    let ai = a.net_open(room, ak, hk, 0).unwrap();
    let bi = b.net_open(room, bk, hk, 0).unwrap();
    // signalling: everyone learns everyone's candidates
    h.net_peer(ak, "A", &lo(&ai.cands)).unwrap();
    h.net_peer(bk, "B", &lo(&bi.cands)).unwrap();
    a.net_peer(hk, "H", &lo(&hi.cands)).unwrap();
    a.net_peer(bk, "B", &lo(&bi.cands)).unwrap();
    b.net_peer(hk, "H", &lo(&hi.cands)).unwrap();
    b.net_peer(ak, "A", &lo(&ai.cands)).unwrap();

    let direct = |e: &Arc<Engine>| e.stats()["peers"].as_array().unwrap().iter().all(|p| p["state"] == "direct");
    assert!(wait(|| direct(&h) && direct(&a) && direct(&b), 3000), "punching failed: {}", a.stats());
    assert!(wait(|| a.stats()["synced"] == true && b.stats()["synced"] == true, 4000), "clock never synced");
    std::thread::sleep(Duration::from_millis(1500));
    let (sh, sa, sb) = (h.shared_ms(), a.shared_ms(), b.shared_ms());
    assert!((sa - sh).abs() < 2.0 && (sb - sh).abs() < 2.0, "clocks differ: host {sh} a {sa} b {sb}");

    // A plays frames stamped on the shared clock; H and B must file them under the same time
    let now48 = (a.shared_ms() * 48.0) as i64;
    let t0 = (now48 / FRAME as i64 + 10) * FRAME as i64;
    for k in 0..20 {
        send_marker(&a, t0 + k * FRAME as i64, 0.1 + k as f32 * 0.01);
        std::thread::sleep(Duration::from_millis(5));
    }
    std::thread::sleep(Duration::from_millis(200));
    for (who, e) in [("host", &h), ("b", &b)] {
        for k in [0i64, 7, 19] {
            let v = e.peer_sample(ak, t0 + k * FRAME as i64).unwrap_or(-1.0);
            assert!((v - (0.1 + k as f32 * 0.01)).abs() < 1e-3, "{who} frame {k}: {v}");
        }
    }

    // loop sync: delay is a whole number of bars
    let s = Session { playing: true, t0_ms: h.shared_ms() + 500.0, bpm: 120.0, beats: 4, steps: 16, mode: Mode::Sync, sync_bars: 1, ..Default::default() };
    for e in [&h, &a, &b] {
        e.set_session(s.clone());
    }
    std::thread::sleep(Duration::from_millis(100));
    let d = b.peer_delay48(ak).unwrap();
    let bar = 2.0 * 48_000.0;
    assert!((d / bar - (d / bar).round()).abs() < 1e-9 && d >= bar, "sync delay {d}");
    // live: small
    let live = Session { mode: Mode::Live, ..s.clone() };
    b.set_session(live);
    std::thread::sleep(Duration::from_millis(60));
    let d = b.peer_delay48(ak).unwrap();
    assert!(d > 0.0 && d < 48.0 * 40.0, "live delay {} ms", d / 48.0);
    println!("stats b: {}", b.stats());
}

#[test]
fn host_relays_when_players_cannot_reach_each_other() {
    let room = "RELAY";
    let (hk, ck, dk) = ("tcjam-relay", "player-c", "player-d");
    let h = Engine::new();
    let c = Engine::new();
    let d = Engine::new();
    for e in [&h, &c, &d] {
        e.set_codec(tc_engine::codec::Codec::Pcm, 0).unwrap();
    }
    let hi = h.net_open(room, hk, hk, 0).unwrap();
    let ci = c.net_open(room, ck, hk, 0).unwrap();
    let di = d.net_open(room, dk, hk, 0).unwrap();
    let dead = vec!["127.0.0.1:9".to_string()]; // nothing listens there
    h.net_peer(ck, "C", &lo(&ci.cands)).unwrap();
    h.net_peer(dk, "D", &lo(&di.cands)).unwrap();
    c.net_peer(hk, "H", &lo(&hi.cands)).unwrap();
    c.net_peer(dk, "D", &dead).unwrap();
    d.net_peer(hk, "H", &lo(&hi.cands)).unwrap();
    d.net_peer(ck, "C", &dead).unwrap();
    let state = |e: &Arc<Engine>, k: &str| e.stats()["peers"].as_array().unwrap().iter().find(|p| p["key"] == k).map(|p| p["state"].as_str().unwrap().to_string());
    assert!(wait(|| state(&c, dk).as_deref() == Some("relay") && state(&d, ck).as_deref() == Some("relay"), 7000), "no relay: {}", c.stats());
    assert!(wait(|| c.stats()["synced"] == true, 3000));
    let t0 = ((c.shared_ms() * 48.0) as i64 / FRAME as i64 + 5) * FRAME as i64;
    for k in 0..10 {
        send_marker(&c, t0 + k * FRAME as i64, 0.5);
        std::thread::sleep(Duration::from_millis(5));
    }
    std::thread::sleep(Duration::from_millis(200));
    let v = d.peer_sample(ck, t0 + 3 * FRAME as i64).unwrap_or(-1.0);
    assert!((v - 0.5).abs() < 1e-3, "relayed audio missing: {v}");
}
