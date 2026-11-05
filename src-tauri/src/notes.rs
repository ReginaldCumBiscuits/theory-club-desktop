//! Note finding for the song transcriber with the Basic Pitch note model (Spotify, Apache 2.0).
//!
//! The model is 230 KB, so it is built into the app. It takes 2-second windows of mono audio at 22,050 Hz
//! and gives, for each of the 88 piano keys and each 11.6 ms frame, how likely a note is sounding ("note")
//! and starting ("onset"). Turning those into notes happens in the page, the same way as on the website.
use ort::{session::Session, value::Tensor};

pub const MODEL: &[u8] = include_bytes!("../models/nmp.onnx");
pub const SR: usize = 22_050;
pub const NS: usize = 43_844; // samples in one window
const OVERLAP_FRAMES: usize = 30;
const FFT_HOP: usize = 256;
const OL: usize = OVERLAP_FRAMES * FFT_HOP;
const HOP: usize = NS - OL;
const FRAMES: usize = 172; // frames out of one window
pub const KEYS: usize = 88;

pub fn session() -> Result<Session, String> {
    let threads = std::thread::available_parallelism()
        .map(|x| x.get())
        .unwrap_or(4);
    Session::builder()
        .map_err(|e| e.to_string())?
        .with_intra_threads(threads)
        .map_err(|e| e.to_string())?
        .commit_from_memory(MODEL)
        .map_err(|e| e.to_string())
}

/// Number of output frames for `n` samples (as Basic Pitch counts them).
pub fn frames_for(n: usize) -> usize {
    (n as f64 * (SR / FFT_HOP) as f64 / SR as f64).floor() as usize
}

/// Note and onset activations for mono audio at 22,050 Hz: two arrays of frames × 88.
pub fn infer(
    s: &mut Session,
    x: &[f32],
    mut on_window: impl FnMut(usize, usize),
) -> Result<(Vec<f32>, Vec<f32>), String> {
    let mut a = vec![0f32; OL / 2];
    a.extend_from_slice(x);
    let starts: Vec<usize> = (0..a.len()).step_by(HOP).collect();
    let total = starts.len();
    let half = OVERLAP_FRAMES / 2;
    let keep = FRAMES - OVERLAP_FRAMES;
    let (mut note, mut onset) = (
        Vec::with_capacity(total * keep * KEYS),
        Vec::with_capacity(total * keep * KEYS),
    );
    const BATCH: usize = 8;
    for (bi, group) in starts.chunks(BATCH).enumerate() {
        let b = group.len();
        let mut buf = vec![0f32; b * NS];
        for (k, &st) in group.iter().enumerate() {
            let end = (st + NS).min(a.len());
            buf[k * NS..k * NS + (end - st)].copy_from_slice(&a[st..end]);
        }
        let t =
            Tensor::from_array(([b, NS, 1], buf.into_boxed_slice())).map_err(|e| e.to_string())?;
        let out = s
            .run(ort::inputs!["serving_default_input_2:0" => t])
            .map_err(|e| e.to_string())?;
        let (_, nv) = out["StatefulPartitionedCall:1"]
            .try_extract_tensor::<f32>()
            .map_err(|e| e.to_string())?;
        let (_, ov) = out["StatefulPartitionedCall:2"]
            .try_extract_tensor::<f32>()
            .map_err(|e| e.to_string())?;
        for k in 0..b {
            let base = k * FRAMES * KEYS;
            note.extend_from_slice(&nv[base + half * KEYS..base + (half + keep) * KEYS]);
            onset.extend_from_slice(&ov[base + half * KEYS..base + (half + keep) * KEYS]);
        }
        on_window(((bi + 1) * BATCH).min(total), total);
    }
    let nf = frames_for(x.len()).min(note.len() / KEYS);
    note.truncate(nf * KEYS);
    onset.truncate(nf * KEYS);
    Ok((note, onset))
}
