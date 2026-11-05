//! AI stem separation with SCNet (Sparse Compression Network, Tong et al. 2024; small model trained on MUSDB18
//! by ZFTurbo's Music-Source-Separation-Training). One pass gives all four parts at once: drums, bass,
//! everything else, and vocals. The model works on the short-time Fourier transform of an 11-second stereo
//! chunk; this file does the transforms and joins the chunks with crossfades.
use ort::{session::Session, value::Tensor};
use realfft::{num_complex::Complex32, RealFftPlanner};

pub const NF: usize = 4096;
pub const HOP: usize = 1024;
/// Samples in one chunk (11 s), the padding the model expects after it, and the frames that gives.
pub const CH: usize = 485_100;
const PAD: usize = 1_300;
pub const FRAMES: usize = (CH + PAD) / HOP + 1;
pub const BINS: usize = NF / 2 + 1;
/// The model's output order.
pub const SOURCES: [&str; 4] = ["drums", "bass", "other", "vocals"];
pub const PARTS: [&str; 4] = ["vocals", "bass", "drums", "other"];
const STEP: usize = CH / 2;
const FADE: usize = CH / 10;
const BORDER: usize = CH - STEP;

pub fn source_index(part: &str) -> Option<usize> {
    SOURCES.iter().position(|s| *s == part)
}

/// numpy-style "reflect" padding (the edge sample isn't repeated); zeros when the signal is too short.
fn reflect_pad(x: &[f32], p: usize) -> Vec<f32> {
    let n = x.len();
    let mut out = Vec::with_capacity(n + 2 * p);
    if n <= p {
        out.resize(p, 0.0);
        out.extend_from_slice(x);
        out.resize(n + 2 * p, 0.0);
        return out;
    }
    for i in (1..=p).rev() {
        out.push(x[i]);
    }
    out.extend_from_slice(x);
    for i in 0..p {
        out.push(x[n - 2 - i]);
    }
    out
}

/// Number of chunks a song of `n` samples is cut into (for progress).
pub fn chunks(n: usize) -> usize {
    (n + 2 * BORDER).div_ceil(STEP)
}

/// Separates a stereo mix at 44.1 kHz. Returns, for drums, bass, other and vocals, (left, right).
pub fn separate(
    session: &mut Session,
    l: &[f32],
    r: &[f32],
    mut progress: impl FnMut(),
) -> Result<Vec<(Vec<f32>, Vec<f32>)>, String> {
    let n = l.len();
    let xp = [reflect_pad(l, BORDER), reflect_pad(r, BORDER)];
    let total = xp[0].len();
    let mut res = vec![vec![0f32; total]; 8];
    let mut cnt = vec![0f32; total];
    let mut w = vec![1f32; CH];
    for k in 0..FADE {
        let a = k as f32 / (FADE - 1) as f32;
        w[k] = a;
        w[CH - 1 - k] = a;
    }
    let mut planner = RealFftPlanner::<f32>::new();
    let fwd = planner.plan_fft_forward(NF);
    let inv = planner.plan_fft_inverse(NF);
    let mut frame = fwd.make_input_vec();
    let mut spec = fwd.make_output_vec();
    let mut tbuf = inv.make_output_vec();
    let norm = (NF as f32).sqrt();
    let len = CH + PAD;
    let mut i = 0;
    while i < total {
        let ln = CH.min(total - i);
        let mut input = vec![0f32; 4 * BINS * FRAMES];
        for c in 0..2 {
            // the chunk, zero-padded to the model's length, then centre-padded by reflection like torch.stft
            let mut x = vec![0f32; len];
            x[..ln].copy_from_slice(&xp[c][i..i + ln]);
            let xc = reflect_pad(&x, NF / 2);
            for t in 0..FRAMES {
                frame.copy_from_slice(&xc[t * HOP..t * HOP + NF]);
                fwd.process(&mut frame, &mut spec)
                    .map_err(|e| e.to_string())?;
                for f in 0..BINS {
                    input[((2 * c) * BINS + f) * FRAMES + t] = spec[f].re / norm;
                    input[((2 * c + 1) * BINS + f) * FRAMES + t] = spec[f].im / norm;
                }
            }
        }
        let tensor = Tensor::from_array(([1usize, 4, BINS, FRAMES], input.into_boxed_slice()))
            .map_err(|e| e.to_string())?;
        let outputs = session
            .run(ort::inputs!["spec" => tensor])
            .map_err(|e| e.to_string())?;
        let (_, y) = outputs["out"]
            .try_extract_tensor::<f32>()
            .map_err(|e| e.to_string())?;
        let mut ww = w.clone();
        if i == 0 {
            ww[..FADE].fill(1.0);
        }
        if i + STEP >= total {
            ww[CH - FADE..].fill(1.0);
        }
        for s in 0..4 {
            for c in 0..2 {
                let re = (s * 4 + c * 2) * BINS * FRAMES;
                let im = (s * 4 + c * 2 + 1) * BINS * FRAMES;
                let mut acc = vec![0f32; (FRAMES - 1) * HOP + NF];
                let mut num = vec![0f32; acc.len()];
                for t in 0..FRAMES {
                    for f in 0..BINS {
                        spec[f] = Complex32::new(
                            y[re + f * FRAMES + t] * norm,
                            y[im + f * FRAMES + t] * norm,
                        );
                    }
                    spec[0].im = 0.0;
                    spec[BINS - 1].im = 0.0;
                    inv.process(&mut spec, &mut tbuf)
                        .map_err(|e| e.to_string())?;
                    let o = t * HOP;
                    for k in 0..NF {
                        acc[o + k] += tbuf[k] / NF as f32;
                        num[o + k] += 1.0;
                    }
                }
                let dst = &mut res[s * 2 + c];
                for k in 0..ln {
                    let j = k + NF / 2;
                    dst[i + k] += acc[j] / num[j].max(1e-8) * ww[k];
                }
            }
        }
        for k in 0..ln {
            cnt[i + k] += ww[k];
        }
        progress();
        i += STEP;
    }
    let mut out = Vec::with_capacity(4);
    for s in 0..4 {
        let get = |c: usize| -> Vec<f32> {
            (0..n)
                .map(|k| res[s * 2 + c][BORDER + k] / cnt[BORDER + k].max(1e-8))
                .collect()
        };
        out.push((get(0), get(1)));
    }
    Ok(out)
}

/// Halve the sample rate (44.1 kHz to 22.05 kHz) with a small smoothing filter.
pub fn half(x: &[f32]) -> Vec<f32> {
    let n = x.len() / 2;
    (0..n)
        .map(|i| {
            let a = if 2 * i > 0 { x[2 * i - 1] } else { x[0] };
            let c = if 2 * i + 1 < x.len() {
                x[2 * i + 1]
            } else {
                x[2 * i]
            };
            0.25 * a + 0.5 * x[2 * i] + 0.25 * c
        })
        .collect()
}
