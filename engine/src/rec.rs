//! Jam recorder: one WAV file per player, sample-aligned on the shared clock.
//!
//! The recorder runs a little behind real time on its own thread. For every
//! sample position it reads your own input at its capture time, each remote
//! player at "position minus their delay" (exactly what the audio callback
//! plays), and renders the backing band at that position. So the files line
//! up with each other the way you heard the jam, and drop straight into a DAW.

use crate::band::{Band, LocalMix};
use crate::clock::ns_to_48;
use crate::{f64_load, Shared, MAX_PEERS};
use serde::Serialize;
use std::fs::File;
use std::io::{self, BufWriter, Seek, SeekFrom, Write};
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::sync::Arc;
use std::thread::JoinHandle;
use std::time::Duration;

/// How far behind real time the recorder reads, in 48 kHz samples (0.75 s).
const LAG: f64 = 36_000.0;
const RATE: u32 = 48_000;

#[derive(Serialize, Clone, Debug)]
pub struct RecFile {
    pub name: String,
    pub path: String,
}

#[derive(Serialize, Clone, Debug)]
pub struct RecResult {
    pub dir: String,
    pub files: Vec<RecFile>,
    pub seconds: f64,
}

/// 16-bit mono WAV writer; the sizes are filled in when it's finished.
struct Wav {
    w: BufWriter<File>,
    n: u64,
    path: PathBuf,
    name: String,
}

impl Wav {
    fn create(path: PathBuf, name: String) -> io::Result<Wav> {
        let mut w = BufWriter::with_capacity(1 << 16, File::create(&path)?);
        let byte_rate = RATE * 2;
        w.write_all(b"RIFF")?;
        w.write_all(&0u32.to_le_bytes())?;
        w.write_all(b"WAVEfmt ")?;
        w.write_all(&16u32.to_le_bytes())?;
        w.write_all(&1u16.to_le_bytes())?; // PCM
        w.write_all(&1u16.to_le_bytes())?; // mono
        w.write_all(&RATE.to_le_bytes())?;
        w.write_all(&byte_rate.to_le_bytes())?;
        w.write_all(&2u16.to_le_bytes())?;
        w.write_all(&16u16.to_le_bytes())?;
        w.write_all(b"data")?;
        w.write_all(&0u32.to_le_bytes())?;
        Ok(Wav { w, n: 0, path, name })
    }
    #[inline]
    fn push(&mut self, x: f32) -> io::Result<()> {
        let v = (x.clamp(-1.0, 1.0) * 32767.0).round() as i16;
        self.n += 1;
        self.w.write_all(&v.to_le_bytes())
    }
    fn silence(&mut self, n: u64) -> io::Result<()> {
        for _ in 0..n {
            self.push(0.0)?;
        }
        Ok(())
    }
    fn finish(mut self) -> io::Result<RecFile> {
        self.w.flush()?;
        let mut f = self.w.into_inner().map_err(|e| e.into_error())?;
        let data = (self.n * 2).min(u32::MAX as u64 - 36) as u32;
        f.seek(SeekFrom::Start(4))?;
        f.write_all(&(36 + data).to_le_bytes())?;
        f.seek(SeekFrom::Start(40))?;
        f.write_all(&data.to_le_bytes())?;
        f.sync_all()?;
        Ok(RecFile { name: self.name, path: self.path.to_string_lossy().into_owned() })
    }
}

/// Keeps file names safe on every OS.
fn clean(s: &str) -> String {
    let t: String = s.chars().map(|c| if c.is_alphanumeric() || c == ' ' || c == '-' || c == '_' { c } else { '_' }).collect();
    let t = t.trim().to_string();
    if t.is_empty() { "Player".into() } else { t.chars().take(40).collect() }
}

pub type Names = Box<dyn Fn() -> Vec<(usize, String)> + Send>;

pub struct Recorder {
    stop: Arc<AtomicBool>,
    pos: Arc<AtomicU64>,
    thread: Option<JoinHandle<Result<RecResult, String>>>,
}

impl Recorder {
    /// Starts recording into `dir` (created if needed). `names` lists the
    /// remote players currently in the room as (slot, name).
    pub fn start(sh: Arc<Shared>, dir: &Path, me: &str, names: Names) -> Result<Recorder, String> {
        std::fs::create_dir_all(dir).map_err(|e| format!("Couldn't create the recording folder: {}", e))?;
        sh.self_ring.store(Some(Arc::new(crate::ring::PeerRing::new())));
        let stop = Arc::new(AtomicBool::new(false));
        let pos = Arc::new(AtomicU64::new(0));
        let (stop2, pos2, dir2, me2) = (stop.clone(), pos.clone(), dir.to_path_buf(), clean(me));
        let thread = std::thread::Builder::new()
            .name("tc-rec".into())
            .spawn(move || run(sh, dir2, me2, names, stop2, pos2))
            .map_err(|e| e.to_string())?;
        Ok(Recorder { stop, pos, thread: Some(thread) })
    }
    pub fn seconds(&self) -> f64 {
        self.pos.load(Ordering::Relaxed) as f64 / RATE as f64
    }
    pub fn stop(mut self) -> Result<RecResult, String> {
        self.stop.store(true, Ordering::SeqCst);
        match self.thread.take() {
            Some(t) => t.join().map_err(|_| "The recorder stopped unexpectedly".to_string())?,
            None => Err("Not recording".into()),
        }
    }
}

fn run(sh: Arc<Shared>, dir: PathBuf, me: String, names: Names, stop: Arc<AtomicBool>, pos: Arc<AtomicU64>) -> Result<RecResult, String> {
    let io = |e: io::Error| format!("Couldn't write the recording: {}", e);
    let now48 = || ns_to_48(sh.clock.shared_ns());
    let q0 = (now48() - LAG).floor() as i64;
    let mut q = q0;
    let mut you = Wav::create(dir.join(format!("01 {} (you).wav", me)), format!("{} (you)", me)).map_err(io)?;
    let mut band_w = Wav::create(dir.join("00 Backing.wav"), "Backing".into()).map_err(io)?;
    let mut band = Band::new(RATE as f32);
    let mut peers: [Option<Wav>; MAX_PEERS] = std::array::from_fn(|_| None);
    let mut next_file = 2;
    let mut last_names = std::time::Instant::now() - Duration::from_secs(5);
    let full_mix = |m: &LocalMix| LocalMix { click: false, drums: true, bass: true, click_vol: m.click_vol, band_vol: 0.8 };
    loop {
        let stopping = stop.load(Ordering::SeqCst);
        if last_names.elapsed() > Duration::from_millis(500) {
            last_names = std::time::Instant::now();
            for (slot, name) in names() {
                if slot < MAX_PEERS && peers[slot].is_none() {
                    let mut w = Wav::create(dir.join(format!("{:02} {}.wav", next_file, clean(&name))), name.clone()).map_err(io)?;
                    next_file += 1;
                    // a player who joins part way through starts with silence, so every file lines up from 0
                    w.silence((q - q0).max(0) as u64).map_err(io)?;
                    peers[slot] = Some(w);
                }
            }
        }
        // when stopping, catch up to almost now (your own input only needs a moment to arrive)
        let target = (now48() - if stopping { 4_800.0 } else { LAG }).floor() as i64;
        let sess = sh.sess.load_full();
        let mix = full_mix(&sh.mix.load());
        let me_ring = sh.self_ring.load_full();
        let rings: [Option<Arc<crate::ring::PeerRing>>; MAX_PEERS] = std::array::from_fn(|i| if sh.slots[i].active.load(Ordering::Relaxed) { sh.slots[i].ring.load_full() } else { None });
        let delays: [f64; MAX_PEERS] = std::array::from_fn(|i| f64_load(&sh.slots[i].delay48));
        let offs: [f64; MAX_PEERS] = std::array::from_fn(|i| sh.slots[i].offset48.load(Ordering::Relaxed) as f64);
        while q < target {
            let p = q as f64;
            band_w.push(band.tick(&sess, &mix, p)).map_err(io)?;
            you.push(me_ring.as_ref().map(|r| r.read(p).0).unwrap_or(0.0)).map_err(io)?;
            for i in 0..MAX_PEERS {
                if let Some(w) = peers[i].as_mut() {
                    let v = match &rings[i] {
                        Some(r) if delays[i].is_finite() => r.read(p - delays[i] + offs[i]).0,
                        _ => 0.0,
                    };
                    w.push(v).map_err(io)?;
                }
            }
            q += 1;
        }
        pos.store((q - q0).max(0) as u64, Ordering::Relaxed);
        if stopping {
            break;
        }
        std::thread::sleep(Duration::from_millis(30));
    }
    sh.self_ring.store(None);
    let mut files = vec![band_w.finish().map_err(io)?, you.finish().map_err(io)?];
    for w in peers.iter_mut() {
        if let Some(w) = w.take() {
            files.push(w.finish().map_err(io)?);
        }
    }
    Ok(RecResult { dir: dir.to_string_lossy().into_owned(), files, seconds: (q - q0) as f64 / RATE as f64 })
}
