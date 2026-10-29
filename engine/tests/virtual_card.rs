//! End-to-end timing with virtual sound cards driven in real time.
//!
//! A guest "plays" a hit exactly on a beat (as they'd hear it through their
//! own output latency). The host listens in loop sync with a 1-bar delay.
//! The hit must come out of the host's speakers exactly one bar later, on top
//! of the host's own click, whatever the input/output latencies and codec.

use cpal::{InputCallbackInfo, InputStreamTimestamp, OutputCallbackInfo, OutputStreamTimestamp, StreamInstant};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use tc_engine::band::{LocalMix, Mode, Session};
use tc_engine::codec::Codec;
use tc_engine::{audio, Engine};

const RATE: f64 = 48_000.0;
const BUF: usize = 128;

struct Card {
    stop: Arc<AtomicBool>,
    out: Arc<Mutex<Vec<(f64, f32)>>>, // (true playback time in shared ms, sample)
}

/// Runs one engine's input and output callbacks like a sound card would.
/// `hits` = shared-clock ms at which the musician hits a note *as they hear the beat*.
fn virtual_card(e: Arc<Engine>, in_lat_ms: f64, out_lat_ms: f64, hits: Vec<f64>, record: bool) -> Card {
    let stop = Arc::new(AtomicBool::new(false));
    let out = Arc::new(Mutex::new(Vec::new()));
    let (s2, o2) = (stop.clone(), out.clone());
    std::thread::spawn(move || {
        let (prod, cons) = rtrb::RingBuffer::<f32>::new(4096);
        let mut icb = audio::input_cb::<f32>(e.sh.clone(), 1, RATE, 0, prod);
        let mut ocb = audio::output_cb::<f32>(e.sh.clone(), 1, RATE, cons, true);
        let base = Instant::now();
        let mut inb = vec![0f32; BUF];
        let mut outb = vec![0f32; BUF];
        let mut next = Instant::now();
        while !s2.load(Ordering::Relaxed) {
            next += Duration::from_secs_f64(BUF as f64 / RATE);
            let now = Instant::now();
            if next > now {
                std::thread::sleep(next - now);
            }
            let cb = base.elapsed().as_nanos() as u64 + 1_000_000_000;
            let shared_now = e.sh.clock.shared_ns() as f64 / 1e6;
            // input: sample j was captured at shared_now - in_lat + j/rate.
            // The engine plays the click at its *playback* time, so a musician who hits with
            // the click hits at shared time H physically; the card stamps that as captured at H.
            for (j, x) in inb.iter_mut().enumerate() {
                let t = shared_now - in_lat_ms + j as f64 * 1000.0 / RATE;
                *x = 0.0;
                for &h in &hits {
                    if t >= h && t < h + 3.0 {
                        *x = 0.9;
                    }
                }
            }
            let its = InputStreamTimestamp { callback: StreamInstant::from_nanos(cb), capture: StreamInstant::from_nanos(cb - (in_lat_ms * 1e6) as u64) };
            icb(&inb, &InputCallbackInfo::new(its));
            let ots = OutputStreamTimestamp { callback: StreamInstant::from_nanos(cb), playback: StreamInstant::from_nanos(cb + (out_lat_ms * 1e6) as u64) };
            ocb(&mut outb, &OutputCallbackInfo::new(ots));
            if record {
                let mut o = o2.lock().unwrap();
                for (i, y) in outb.iter().enumerate() {
                    o.push((shared_now + out_lat_ms + i as f64 * 1000.0 / RATE, *y));
                }
            }
        }
    });
    Card { stop, out }
}

fn onsets(v: &[(f64, f32)], thr: f32) -> Vec<f64> {
    let mut r = vec![];
    let mut last = -1e9;
    for &(t, y) in v {
        if y.abs() > thr && t - last > 50.0 {
            r.push(t);
            last = t;
        }
        if y.abs() > thr {
            last = t;
        }
    }
    r
}

fn run(codec: Codec) {
    let room = "VCARD";
    let (hk, gk) = ("tcjam-vcard", "guest");
    let h = Engine::new();
    std::thread::sleep(Duration::from_millis(40));
    let g = Engine::new();
    for e in [&h, &g] {
        e.set_codec(codec, 128_000).unwrap();
        e.set_local(Some(false), Some(1.0), None);
    }
    let hi = h.net_open(room, hk, hk, 0).unwrap();
    let gi = g.net_open(room, gk, hk, 0).unwrap();
    let lo = |c: &[String]| c.iter().filter(|x| x.starts_with("127.")).cloned().collect::<Vec<_>>();
    h.net_peer(gk, "G", &lo(&gi.cands)).unwrap();
    g.net_peer(hk, "H", &lo(&hi.cands)).unwrap();
    let t = Instant::now();
    while g.stats()["synced"] != true && t.elapsed() < Duration::from_secs(5) {
        std::thread::sleep(Duration::from_millis(20));
    }
    std::thread::sleep(Duration::from_millis(1500));
    // 120 BPM, 4/4: a bar is 2000 ms. Session starts 1.5 s from now.
    let t0 = h.shared_ms() + 1500.0;
    let s = Session { playing: true, t0_ms: t0, bpm: 120.0, beats: 4, steps: 4, mode: Mode::Sync, sync_bars: 1, rows: vec![], bass: vec![], ..Default::default() };
    h.set_session(s.clone());
    g.set_session(s);
    // host hears its own click only on beat 1, guest hears nothing of the band
    h.set_mix(LocalMix { click: false, drums: false, bass: false, click_vol: 0.0, band_vol: 0.0 });
    g.set_mix(LocalMix { click: false, drums: false, bass: false, click_vol: 0.0, band_vol: 0.0 });
    // guest hits on beat 1 of bars 2..5 (and on a "beat 3" in bar 3)
    let hits = vec![t0 + 2000.0, t0 + 4000.0, t0 + 5000.0, t0 + 6000.0, t0 + 8000.0];
    let hc = virtual_card(h.clone(), 4.0, 6.0, vec![], true);
    let gc = virtual_card(g.clone(), 7.0, 9.0, hits.clone(), false);
    std::thread::sleep(Duration::from_millis(11_500));
    hc.stop.store(true, Ordering::Relaxed);
    gc.stop.store(true, Ordering::Relaxed);
    std::thread::sleep(Duration::from_millis(50));
    println!("H stats {}", h.stats());
    println!("G stats {}", g.stats());
    let out = hc.out.lock().unwrap().clone();
    let on = onsets(&out, 0.5);
    println!("max out {:?}", out.iter().map(|x| x.1.abs()).fold(0f32, f32::max));
    println!("{:?} delay {:?} ms, onsets(rel t0): {:?}", codec, h.peer_delay48(gk).map(|d| d / 48.0), on.iter().map(|x| x - t0).collect::<Vec<_>>());
    let bar = 2000.0;
    for hit in &hits {
        let k = (h.peer_delay48(gk).unwrap() / 48.0 / bar).round();
        let want = hit + k * bar;
        if want > out.last().unwrap().0 - 50.0 {
            continue;
        }
        let got = on.iter().copied().min_by(|a, b| (a - want).abs().partial_cmp(&(b - want).abs()).unwrap()).unwrap();
        println!("  hit at {:.1} -> heard at {:.2} ms (error {:+.2} ms)", hit - t0, got - t0, got - want);
        assert!((got - want).abs() < 2.0, "{:?}: heard {:.2} ms off", codec, got - want);
    }
}

#[test]
fn loop_sync_lands_on_the_beat_pcm() {
    run(Codec::Pcm);
}

#[test]
fn loop_sync_lands_on_the_beat_opus() {
    run(Codec::Opus);
}
