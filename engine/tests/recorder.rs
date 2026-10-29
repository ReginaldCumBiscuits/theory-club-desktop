//! Two engines over real UDP. Both play a click on every beat; the host
//! records. Every click in every file must land on the beat grid of the
//! recording, and the remote player's clicks must be a whole number of bars
//! late (loop sync), exactly as they were heard.

use std::sync::Arc;
use std::time::{Duration, Instant};
use tc_engine::band::{Mode, Session};
use tc_engine::ring::FRAME;
use tc_engine::{Engine, InFrame};

fn lo(c: &[String]) -> Vec<String> {
    c.iter().filter(|x| x.starts_with("127.0.0.1")).cloned().collect()
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
fn read_wav(p: &str) -> Vec<f32> {
    let b = std::fs::read(p).unwrap();
    assert_eq!(&b[0..4], b"RIFF");
    let n = u32::from_le_bytes([b[40], b[41], b[42], b[43]]) as usize;
    assert_eq!(n + 44, b.len(), "data size in header");
    b[44..].chunks(2).map(|c| i16::from_le_bytes([c[0], c[1]]) as f32 / 32767.0).collect()
}
fn spikes(x: &[f32]) -> Vec<usize> {
    let mut out = vec![];
    let mut i = 0;
    while i < x.len() {
        if x[i] > 0.5 {
            out.push(i);
            i += 2000;
        } else {
            i += 1;
        }
    }
    out
}

/// Plays one frame per 5 ms in real time; a spike starts every beat.
fn player(e: Arc<Engine>, start48: i64, grid0: i64, beat48: i64, secs: f64) -> std::thread::JoinHandle<()> {
    std::thread::spawn(move || {
        let n = (secs * 200.0) as i64;
        let t = Instant::now();
        for k in 0..n {
            let ts = start48 + k * FRAME as i64;
            let mut d = [0f32; FRAME];
            if (ts - grid0).rem_euclid(beat48) == 0 {
                d[0] = 0.9;
                d[1] = 0.45;
            }
            e.inject(InFrame { ts, data: d });
            let due = Duration::from_micros(5000 * (k as u64 + 1));
            if let Some(w) = due.checked_sub(t.elapsed()) {
                std::thread::sleep(w);
            }
        }
    })
}

#[test]
fn recording_lines_up_on_the_beat() {
    let (hk, ak) = ("tcjam-recrd", "player-a");
    let h = Engine::new();
    std::thread::sleep(Duration::from_millis(40));
    let a = Engine::new();
    for e in [&h, &a] {
        e.set_codec(tc_engine::codec::Codec::Pcm, 0).unwrap();
    }
    let hi = h.net_open("RECRD", hk, hk, 0).unwrap();
    let ai = a.net_open("RECRD", ak, hk, 0).unwrap();
    h.net_peer(ak, "Alex", &lo(&ai.cands)).unwrap();
    a.net_peer(hk, "Host", &lo(&hi.cands)).unwrap();
    assert!(wait(|| a.stats()["synced"] == true, 5000), "clock never synced");
    std::thread::sleep(Duration::from_millis(800));

    // 120 BPM: a beat is 24 000 samples, a bar 96 000
    let beat48: i64 = 24_000;
    let t0_ms = ((h.shared_ms() / 5.0).floor() + 100.0) * 5.0;
    let s = Session { playing: true, t0_ms, bpm: 120.0, beats: 4, steps: 16, mode: Mode::Sync, sync_bars: 1, rows: vec![("kick".into(), "x...............".into())], ..Default::default() };
    h.set_session(s.clone());
    a.set_session(s);

    let dir = std::env::temp_dir().join(format!("tc-rec-test-{}", std::process::id()));
    let _ = std::fs::remove_dir_all(&dir);
    h.rec_start(&dir, "Host").unwrap();
    let start48 = ((h.shared_ms() * 48.0) as i64 / FRAME as i64) * FRAME as i64;
    let grid0 = (t0_ms * 48.0) as i64;
    let ph = player(h.clone(), start48, grid0, beat48, 6.0);
    let pa = player(a.clone(), start48, grid0, beat48, 6.0);
    ph.join().unwrap();
    pa.join().unwrap();
    std::thread::sleep(Duration::from_millis(1200));
    assert!(h.rec_seconds().unwrap() > 4.0, "recorder not advancing");
    let r = h.rec_stop().unwrap();
    println!("{:?}", r);
    assert_eq!(r.files.len(), 3, "backing, you, Alex");
    let get = |n: &str| read_wav(&r.files.iter().find(|f| f.name.contains(n)).unwrap().path);
    let (you, alex, band) = (get("(you)"), get("Alex"), get("Backing"));
    assert_eq!(you.len(), alex.len());
    assert_eq!(you.len(), band.len());

    // where beat 0 of the session falls in the files
    let d = h.peer_delay48(ak).unwrap();
    let bar48 = 4.0 * beat48 as f64;
    assert!((d / bar48 - (d / bar48).round()).abs() < 1e-9, "delay {d} is not whole bars");
    let sy = spikes(&you);
    let sa = spikes(&alex);
    assert!(sy.len() >= 8, "own clicks: {:?}", sy);
    assert!(sa.len() >= 4, "remote clicks: {:?}", sa);
    let phase = sy[0] as i64 % beat48;
    for &i in sy.iter().chain(sa.iter()) {
        let off = (i as i64 - phase).rem_euclid(beat48);
        let off = off.min(beat48 - off);
        assert!(off <= 1, "a click is {off} samples off the beat (you {:?}, alex {:?})", sy, sa);
    }
    // the backing's kick on beat 1 of each bar is on the same grid
    let kick = band.iter().position(|v| v.abs() > 0.05).unwrap();
    let off = (kick as i64 - phase).rem_euclid(beat48);
    assert!(off.min(beat48 - off) < 48, "backing kick {} samples off the beat", off.min(beat48 - off));
    println!("you {:?}\nalex {:?}\nkick at {kick}, delay {} bars", sy, sa, d / bar48);
    let _ = std::fs::remove_dir_all(&dir);
}
