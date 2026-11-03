//! AI stem separation (MDX-Net, KUIELab "A" models from the Music Demixing Challenge 2021).
//! Each model takes a short-time Fourier transform of a stereo chunk (about 24 seconds) and returns the
//! transform of one part: vocals, bass, drums or everything else.
use ort::{session::Session, value::Tensor};
use realfft::{num_complex::Complex32, RealFftPlanner};

pub const HOP: usize = 1024;
pub const DIM_F: usize = 2048;
pub const DIM_T: usize = 512;
pub const PARTS: [&str; 4] = ["vocals", "bass", "drums", "other"];

/// FFT size for each part's model.
pub fn n_fft(part: &str) -> usize {
    match part {
        "vocals" => 6144,
        "bass" => 16384,
        "drums" => 4096,
        _ => 8192,
    }
}

fn hann(n: usize) -> Vec<f32> {
    (0..n).map(|i| (0.5 - 0.5 * (2.0 * std::f64::consts::PI * i as f64 / n as f64).cos()) as f32).collect()
}

fn reflect(x: &[f32], i: isize) -> f32 {
    let n = x.len() as isize;
    let mut j = i;
    if j < 0 { j = -j; }
    if j >= n { j = 2 * (n - 1) - j; }
    x[j.clamp(0, n - 1) as usize]
}

/// Number of chunks a song of `n` samples is cut into for one part (for progress).
pub fn chunks(n: usize, part: &str) -> usize {
    let nf = n_fft(part);
    let chunk = HOP * (DIM_T - 1);
    let gen = chunk - nf;
    let pad = gen - n % gen;
    (n + pad) / gen
}

/// Separate one part from a stereo mix at 44.1 kHz. Returns (left, right).
pub fn separate(
    session: &mut Session,
    part: &str,
    l: &[f32],
    r: &[f32],
    mut progress: impl FnMut(),
) -> Result<(Vec<f32>, Vec<f32>), String> {
    let nf = n_fft(part);
    let nb = nf / 2 + 1;
    let chunk = HOP * (DIM_T - 1);
    let trim = nf / 2;
    let gen = chunk - 2 * trim;
    let n = l.len();
    let pad = gen - n % gen;
    let total = trim + n + pad + trim;
    let get = |x: &[f32], i: usize| -> f32 { if i >= trim && i < trim + n { x[i - trim] } else { 0.0 } };
    let win = hann(nf);
    let mut planner = RealFftPlanner::<f32>::new();
    let fwd = planner.plan_fft_forward(nf);
    let inv = planner.plan_fft_inverse(nf);
    let mut out_l = Vec::with_capacity(n + pad);
    let mut out_r = Vec::with_capacity(n + pad);
    let mut frame = fwd.make_input_vec();
    let mut spec = fwd.make_output_vec();
    let mut tbuf = inv.make_output_vec();
    let mut i = 0;
    while i < n + pad {
        // this chunk of the padded mix
        let cl: Vec<f32> = (0..chunk).map(|k| if i + k < total { get(l, i + k) } else { 0.0 }).collect();
        let cr: Vec<f32> = (0..chunk).map(|k| if i + k < total { get(r, i + k) } else { 0.0 }).collect();
        // forward transform: centred frames with reflect padding, like torch.stft(center=True)
        let mut input = vec![0f32; 4 * DIM_F * DIM_T];
        for (c, x) in [&cl, &cr].iter().enumerate() {
            for t in 0..DIM_T {
                let s = (t * HOP) as isize - trim as isize;
                for k in 0..nf { frame[k] = reflect(x, s + k as isize) * win[k]; }
                fwd.process(&mut frame, &mut spec).map_err(|e| e.to_string())?;
                for f in 0..DIM_F {
                    input[((2 * c) * DIM_F + f) * DIM_T + t] = spec[f].re;
                    input[((2 * c + 1) * DIM_F + f) * DIM_T + t] = spec[f].im;
                }
            }
        }
        let tensor = Tensor::from_array(([1usize, 4, DIM_F, DIM_T], input.into_boxed_slice())).map_err(|e| e.to_string())?;
        let outputs = session.run(ort::inputs!["input" => tensor]).map_err(|e| e.to_string())?;
        let (_, y) = outputs["output"].try_extract_tensor::<f32>().map_err(|e| e.to_string())?;
        // inverse transform with overlap-add
        let len = nf + HOP * (DIM_T - 1);
        for c in 0..2 {
            let mut acc = vec![0f32; len];
            let mut wsum = vec![0f32; len];
            for t in 0..DIM_T {
                for f in 0..nb {
                    spec[f] = if f < DIM_F {
                        Complex32::new(y[((2 * c) * DIM_F + f) * DIM_T + t], y[((2 * c + 1) * DIM_F + f) * DIM_T + t])
                    } else { Complex32::new(0.0, 0.0) };
                }
                spec[0].im = 0.0;
                spec[nb - 1].im = 0.0;
                inv.process(&mut spec, &mut tbuf).map_err(|e| e.to_string())?;
                let o = t * HOP;
                for k in 0..nf {
                    acc[o + k] += tbuf[k] / nf as f32 * win[k];
                    wsum[o + k] += win[k] * win[k];
                }
            }
            // drop the centre padding, then the chunk's own edges
            let dst = if c == 0 { &mut out_l } else { &mut out_r };
            for k in trim..chunk - trim {
                let j = k + trim;
                dst.push(acc[j] / wsum[j].max(1e-8));
            }
        }
        progress();
        i += gen;
    }
    out_l.truncate(n);
    out_r.truncate(n);
    Ok((out_l, out_r))
}

/// Halve the sample rate (44.1 kHz to 22.05 kHz) with a small smoothing filter.
pub fn half(x: &[f32]) -> Vec<f32> {
    let n = x.len() / 2;
    (0..n)
        .map(|i| {
            let a = if 2 * i > 0 { x[2 * i - 1] } else { x[0] };
            let c = if 2 * i + 1 < x.len() { x[2 * i + 1] } else { x[2 * i] };
            0.25 * a + 0.5 * x[2 * i] + 0.25 * c
        })
        .collect()
}
