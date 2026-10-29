use tc_engine::audio::AudioCfg;
use tc_engine::band::{LocalMix, Session};
use tc_engine::Engine;
fn main() {
    let e = Engine::new();
    let dl = e.devices(None).unwrap();
    let i = dl.inputs.iter().find(|d| d.id.contains("null")).unwrap().id.clone();
    let o = dl.outputs.iter().find(|d| d.id.contains("null")).unwrap().id.clone();
    let info = e.start_audio(AudioCfg { host: None, input: Some(i), output: Some(o), input_channel: 0, buffer: 128, rate: 0 }).unwrap();
    println!("{:?}", info);
    e.set_mix(LocalMix::default());
    e.set_session(Session { playing: true, t0_ms: e.shared_ms() + 200.0, bpm: 120.0, beats: 4, steps: 16, rows: vec![("hat".into(), "x.x.x.x.x.x.x.x.".into())], ..Default::default() });
    for _ in 0..10 {
        std::thread::sleep(std::time::Duration::from_millis(100));
        let s = e.stats();
        println!("shared {:.0} out {:.3} buf {} out_ms {:.2} in_ms {:.2}", s["shared_ms"].as_f64().unwrap(), s["out_level"].as_f64().unwrap(), s["buffer"], s["out_ms"].as_f64().unwrap(), s["in_ms"].as_f64().unwrap());
    }
}
