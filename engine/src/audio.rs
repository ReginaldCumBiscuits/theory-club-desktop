//! Sound card I/O through cpal: ASIO (Windows, when built with the `asio`
//! feature), WASAPI (Windows), CoreAudio (Mac), ALSA/JACK (Linux).
//!
//! The input callback stamps every 5 ms frame with its capture time on the
//! shared clock and hands it to the network thread. The output callback
//! renders the band and reads every remote player at "playback time minus
//! their delay", so what you hear lines up sample for sample.

use crate::band::Band;
use crate::clock::ns_to_48;
use crate::ring::FRAME;
use crate::{f32_load, f32_store, InFrame, Shared, MAX_PEERS};
use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use cpal::{FromSample, Sample, SampleFormat, SizedSample, StreamConfig, SupportedStreamConfigRange};
use serde::{Deserialize, Serialize};
use std::sync::atomic::Ordering;
use std::sync::mpsc;
use std::sync::Arc;
use std::time::Duration;

#[derive(Serialize, Clone, Debug)]
pub struct HostInfo {
    pub id: String,
    pub name: String,
}

#[derive(Serialize, Clone, Debug)]
pub struct DevInfo {
    pub id: String,
    pub name: String,
    pub channels: u16,
    pub min_rate: u32,
    pub max_rate: u32,
    pub min_buffer: u32,
    pub max_buffer: u32,
    pub default: bool,
}

#[derive(Serialize, Clone, Debug, Default)]
pub struct DevList {
    pub inputs: Vec<DevInfo>,
    pub outputs: Vec<DevInfo>,
}

#[derive(Deserialize, Clone, Debug, Default)]
pub struct AudioCfg {
    /// host name as listed by `hosts()`, e.g. "ASIO", "WASAPI", "CoreAudio"
    pub host: Option<String>,
    pub input: Option<String>,
    pub output: Option<String>,
    /// 0-based input channel, or -1 to mix all inputs
    #[serde(default)]
    pub input_channel: i32,
    /// frames per buffer; 0 = driver default
    #[serde(default)]
    pub buffer: u32,
    /// preferred sample rate; 0 = 48000 if supported
    #[serde(default)]
    pub rate: u32,
}

#[derive(Serialize, Clone, Debug, Default)]
pub struct AudioInfo {
    pub host: String,
    pub input: String,
    pub output: String,
    pub in_rate: u32,
    pub out_rate: u32,
    pub in_channels: u16,
    pub out_channels: u16,
    pub buffer: u32,
    pub format: String,
}

pub fn hosts() -> Vec<HostInfo> {
    cpal::available_hosts().into_iter().map(|h| HostInfo { id: h.name().to_string(), name: h.name().to_string() }).collect()
}

fn host_by_name(name: Option<&str>) -> Result<cpal::Host, String> {
    match name {
        None | Some("") => Ok(cpal::default_host()),
        Some(n) => {
            let id = cpal::available_hosts()
                .into_iter()
                .find(|h| h.name().eq_ignore_ascii_case(n))
                .ok_or_else(|| format!("{} isn't available on this computer", n))?;
            cpal::host_from_id(id).map_err(|e| e.to_string())
        }
    }
}

fn range_info(r: &[SupportedStreamConfigRange]) -> (u16, u32, u32, u32, u32) {
    let ch = r.iter().map(|c| c.channels()).max().unwrap_or(0);
    let lo = r.iter().map(|c| c.min_sample_rate()).min().unwrap_or(0);
    let hi = r.iter().map(|c| c.max_sample_rate()).max().unwrap_or(0);
    let (mut bmin, mut bmax) = (0, 0);
    for c in r {
        if let cpal::SupportedBufferSize::Range { min, max } = c.buffer_size() {
            bmin = if bmin == 0 { *min } else { bmin.min(*min) };
            bmax = bmax.max(*max);
        }
    }
    (ch, lo, hi, bmin, bmax)
}

pub fn devices(host: Option<&str>) -> Result<DevList, String> {
    let h = host_by_name(host)?;
    let din = h.default_input_device().and_then(|d| d.id().ok()).map(|i| i.to_string());
    let dout = h.default_output_device().and_then(|d| d.id().ok()).map(|i| i.to_string());
    let mut out = DevList::default();
    for d in h.devices().map_err(|e| e.to_string())? {
        let id = match d.id() {
            Ok(i) => i.to_string(),
            Err(_) => continue,
        };
        let name = d.description().map(|x| x.name().to_string()).unwrap_or_else(|_| id.clone());
        if let Ok(r) = d.supported_input_configs() {
            let r: Vec<_> = r.collect();
            if !r.is_empty() {
                let (ch, lo, hi, bmin, bmax) = range_info(&r);
                out.inputs.push(DevInfo { id: id.clone(), name: name.clone(), channels: ch, min_rate: lo, max_rate: hi, min_buffer: bmin, max_buffer: bmax, default: din.as_deref() == Some(&id) });
            }
        }
        if let Ok(r) = d.supported_output_configs() {
            let r: Vec<_> = r.collect();
            if !r.is_empty() {
                let (ch, lo, hi, bmin, bmax) = range_info(&r);
                let is_def = dout.as_deref() == Some(id.as_str());
                out.outputs.push(DevInfo { id, name, channels: ch, min_rate: lo, max_rate: hi, min_buffer: bmin, max_buffer: bmax, default: is_def });
            }
        }
    }
    Ok(out)
}

fn find_dev(h: &cpal::Host, id: Option<&str>, input: bool) -> Result<cpal::Device, String> {
    if let Some(s) = id.filter(|s| !s.is_empty()) {
        let did: cpal::DeviceId = s.parse().map_err(|e: cpal::Error| e.to_string())?;
        return h.device_by_id(&did).ok_or_else(|| "That audio device isn't connected any more".to_string());
    }
    if input { h.default_input_device() } else { h.default_output_device() }.ok_or_else(|| "No audio device found".to_string())
}

fn fmt_rank(f: SampleFormat) -> u8 {
    match f {
        SampleFormat::F32 => 0,
        SampleFormat::I32 => 1,
        SampleFormat::I16 => 2,
        SampleFormat::I24 => 3,
        SampleFormat::F64 => 4,
        _ => 9,
    }
}

/// Chooses a sample rate (48 kHz if possible) and the best sample format.
fn pick(r: Vec<SupportedStreamConfigRange>, want_rate: u32, min_ch: u16) -> Result<(StreamConfig, SampleFormat, u32, u32), String> {
    let mut best: Option<(u8, u32, SupportedStreamConfigRange)> = None;
    for c in r {
        if fmt_rank(c.sample_format()) > 4 || c.channels() < min_ch {
            continue;
        }
        let rates = [want_rate, 48_000, 44_100, 96_000, 88_200];
        let rate = rates.iter().copied().find(|&x| x > 0 && x >= c.min_sample_rate() && x <= c.max_sample_rate()).unwrap_or(c.max_sample_rate().min(48_000).max(c.min_sample_rate()));
        let score = fmt_rank(c.sample_format()) + if rate == 48_000 || rate == want_rate { 0 } else { 5 };
        if best.as_ref().map(|b| score < b.0).unwrap_or(true) {
            best = Some((score, rate, c));
        }
    }
    let (_, rate, c) = best.ok_or("No usable audio format on that device")?;
    let (bmin, bmax) = match c.buffer_size() {
        cpal::SupportedBufferSize::Range { min, max } => (*min, *max),
        _ => (0, 0),
    };
    let fmt = c.sample_format();
    let sc = c.with_sample_rate(rate);
    Ok((StreamConfig { channels: sc.channels(), sample_rate: rate, buffer_size: cpal::BufferSize::Default }, fmt, bmin, bmax))
}

/// Linear resampler with a tiny speed trim, used as a PLL to keep sound
/// card time and shared-clock time together.
struct Rs {
    step: f64,
    t: f64,
    prev: f32,
}

impl Rs {
    fn new(step: f64) -> Self {
        Rs { step, t: 1.0, prev: 0.0 }
    }
    #[inline]
    fn push(&mut self, x: f32, trim: f64, mut emit: impl FnMut(f32)) {
        while self.t < 1.0 {
            emit(self.prev + (x - self.prev) * self.t as f32);
            self.t += self.step * trim;
        }
        self.t -= 1.0;
        self.prev = x;
    }
}

/// Smallest error over the last 32 callbacks (scheduling delays only ever add).
struct ErrWin {
    v: [f64; 32],
    i: usize,
    n: usize,
}

impl ErrWin {
    fn new() -> Self {
        ErrWin { v: [0.0; 32], i: 0, n: 0 }
    }
    fn clear(&mut self) {
        self.n = 0;
    }
    fn push(&mut self, e: f64) -> f64 {
        self.v[self.i] = e;
        self.i = (self.i + 1) % 32;
        self.n = (self.n + 1).min(32);
        // a jump bigger than 10 ms is real (clock change, dropout): report it straight away
        if e.abs() > 480.0 && self.n < 4 {
            return e;
        }
        self.v[..self.n].iter().copied().fold(f64::INFINITY, f64::min)
    }
}

pub struct Running {
    stop: mpsc::Sender<()>,
    pub info: AudioInfo,
}

impl Running {
    pub fn stop(self) {
        let _ = self.stop.send(());
    }
}

pub fn start(sh: Arc<Shared>, cfg: AudioCfg) -> Result<Running, String> {
    let (tx_info, rx_info) = mpsc::channel::<Result<AudioInfo, String>>();
    let (tx_stop, rx_stop) = mpsc::channel::<()>();
    std::thread::Builder::new()
        .name("tc-audio".into())
        .spawn(move || {
            // streams must live on one thread on some platforms
            match open(sh.clone(), &cfg) {
                Ok((info, a, b)) => {
                    let _ = tx_info.send(Ok(info));
                    let _ = rx_stop.recv();
                    drop(a);
                    drop(b);
                    sh.audio_on.store(false, Ordering::Relaxed);
                }
                Err(e) => {
                    let _ = tx_info.send(Err(e));
                }
            }
        })
        .map_err(|e| e.to_string())?;
    let info = rx_info.recv_timeout(Duration::from_secs(15)).map_err(|_| "The audio driver didn't answer".to_string())??;
    Ok(Running { stop: tx_stop, info })
}

fn open(sh: Arc<Shared>, cfg: &AudioCfg) -> Result<(AudioInfo, cpal::Stream, cpal::Stream), String> {
    let host = host_by_name(cfg.host.as_deref())?;
    let idev = find_dev(&host, cfg.input.as_deref(), true)?;
    let odev = find_dev(&host, cfg.output.as_deref(), false)?;
    let need_ch = if cfg.input_channel >= 0 { cfg.input_channel as u16 + 1 } else { 1 };
    let (mut icfg, ifmt, ibmin, ibmax) = pick(idev.supported_input_configs().map_err(|e| e.to_string())?.collect(), cfg.rate, need_ch)?;
    let (mut ocfg, ofmt, obmin, obmax) = pick(odev.supported_output_configs().map_err(|e| e.to_string())?.collect(), cfg.rate.max(icfg.sample_rate), 1)?;
    if cfg.buffer > 0 {
        let fit = |b: u32, lo: u32, hi: u32| if lo == 0 && hi == 0 { b } else { b.clamp(lo.max(16), hi.max(lo.max(16))) };
        icfg.buffer_size = cpal::BufferSize::Fixed(fit(cfg.buffer, ibmin, ibmax));
        ocfg.buffer_size = cpal::BufferSize::Fixed(fit(cfg.buffer, obmin, obmax));
    }
    let info = AudioInfo {
        host: host.id().name().to_string(),
        input: idev.description().map(|d| d.name().to_string()).unwrap_or_default(),
        output: odev.description().map(|d| d.name().to_string()).unwrap_or_default(),
        in_rate: icfg.sample_rate,
        out_rate: ocfg.sample_rate,
        in_channels: icfg.channels,
        out_channels: ocfg.channels,
        buffer: cfg.buffer,
        format: format!("{:?}/{:?}", ifmt, ofmt),
    };
    sh.rate_in.store(icfg.sample_rate, Ordering::Relaxed);
    sh.rate_out.store(ocfg.sample_rate, Ordering::Relaxed);
    let mon = rtrb::RingBuffer::<f32>::new(16_384);
    let same_rate = icfg.sample_rate == ocfg.sample_rate;
    let ch_sel = cfg.input_channel;
    let ist = match ifmt {
        SampleFormat::F32 => build_in::<f32>(&idev, &icfg, sh.clone(), ch_sel, mon.0),
        SampleFormat::I32 => build_in::<i32>(&idev, &icfg, sh.clone(), ch_sel, mon.0),
        SampleFormat::I16 => build_in::<i16>(&idev, &icfg, sh.clone(), ch_sel, mon.0),
        SampleFormat::I24 => build_in::<cpal::I24>(&idev, &icfg, sh.clone(), ch_sel, mon.0),
        SampleFormat::F64 => build_in::<f64>(&idev, &icfg, sh.clone(), ch_sel, mon.0),
        f => Err(format!("Unsupported input format {:?}", f)),
    }?;
    let ost = match ofmt {
        SampleFormat::F32 => build_out::<f32>(&odev, &ocfg, sh.clone(), mon.1, same_rate),
        SampleFormat::I32 => build_out::<i32>(&odev, &ocfg, sh.clone(), mon.1, same_rate),
        SampleFormat::I16 => build_out::<i16>(&odev, &ocfg, sh.clone(), mon.1, same_rate),
        SampleFormat::I24 => build_out::<cpal::I24>(&odev, &ocfg, sh.clone(), mon.1, same_rate),
        SampleFormat::F64 => build_out::<f64>(&odev, &ocfg, sh.clone(), mon.1, same_rate),
        f => Err(format!("Unsupported output format {:?}", f)),
    }?;
    ist.play().map_err(|e| e.to_string())?;
    ost.play().map_err(|e| e.to_string())?;
    sh.audio_on.store(true, Ordering::Relaxed);
    *sh.audio_err.lock() = String::new();
    Ok((info, ist, ost))
}

pub fn input_cb<T>(sh: Arc<Shared>, chans: usize, rate: f64, ch_sel: i32, mut mon: rtrb::Producer<f32>) -> impl FnMut(&[T], &cpal::InputCallbackInfo) + Send + 'static
where
    T: SizedSample + Sample,
    f32: FromSample<T>,
{
    let mut rs = Rs::new(rate / 48_000.0);
    let mut frame = InFrame { ts: 0, data: [0.0; FRAME] };
    let mut n = 0usize;
    let mut next_ts: i64 = 0;
    let mut inited = false;
    let mut skip: i64 = 0;
    let mut peak = 0.0f32;
    let mut errs = ErrWin::new();
    let tx = sh.frames_tx.clone();
    move |data: &[T], info: &cpal::InputCallbackInfo| {
            let ts = info.timestamp();
            let lat = ts.callback.duration_since(ts.capture).as_nanos() as i64;
            sh.in_lat_ns.store(lat, Ordering::Relaxed);
            let frames = data.len() / chans.max(1);
            sh.in_buf.store(frames as u32, Ordering::Relaxed);
            sh.rate_in.store(rate as u32, Ordering::Relaxed);
            // capture time of the first sample, on the shared clock (48 kHz units)
            let measured = ns_to_48(sh.clock.shared_ns() - lat);
            let pos = (next_ts + n as i64 - skip) as f64;
            // a callback that runs late only ever makes `measured` later, so trust the smallest recent error
            let err = errs.push(measured - pos);
            let trim = if !inited || err.abs() > 480.0 {
                errs.clear();
                // (re)anchor so frames start on 5 ms boundaries
                next_ts = ((measured / FRAME as f64).ceil() as i64) * FRAME as i64;
                skip = next_ts - measured.round() as i64;
                n = 0;
                inited = true;
                1.0
            } else {
                // emit slightly more or fewer samples to drift back into line over ~2 s
                (1.0 - (err / 96_000.0)).clamp(0.997, 1.003)
            };
            let gain = f32_load(&sh.input_gain);
            let monitor = sh.monitor.load(Ordering::Relaxed);
            for f in 0..frames {
                let x = if ch_sel >= 0 && (ch_sel as usize) < chans {
                    f32::from_sample(data[f * chans + ch_sel as usize])
                } else {
                    let mut s = 0.0;
                    for c in 0..chans {
                        s += f32::from_sample(data[f * chans + c]);
                    }
                    s / chans as f32
                } * gain;
                peak = peak.max(x.abs());
                if monitor {
                    let _ = mon.push(x);
                }
                rs.push(x, trim, |y| {
                    if skip > 0 {
                        skip -= 1;
                        return;
                    }
                    frame.data[n] = y;
                    n += 1;
                    if n == FRAME {
                        frame.ts = next_ts;
                        let _ = tx.try_send(frame);
                        next_ts += FRAME as i64;
                        n = 0;
                    }
                });
            }
            // meters fall about 20 dB per second
            let fall = (-(frames as f32) / rate as f32 / 0.4).exp();
            let old = f32_load(&sh.in_level);
            f32_store(&sh.in_level, peak.max(old * fall));
            peak = 0.0;
        }
}

fn build_in<T>(dev: &cpal::Device, cfg: &StreamConfig, sh: Arc<Shared>, ch_sel: i32, mon: rtrb::Producer<f32>) -> Result<cpal::Stream, String>
where
    T: SizedSample + Sample,
    f32: FromSample<T>,
{
    let sh2 = sh.clone();
    let cb = input_cb::<T>(sh, cfg.channels as usize, cfg.sample_rate as f64, ch_sel, mon);
    dev.build_input_stream::<T, _, _>(
        cfg.clone(),
        cb,
        move |e| {
            *sh2.audio_err.lock() = e.to_string();
        },
        None,
    )
    .map_err(|e| e.to_string())
}

pub fn output_cb<T>(sh: Arc<Shared>, chans: usize, rate: f64, mut mon: rtrb::Consumer<f32>, mon_ok: bool) -> impl FnMut(&mut [T], &cpal::OutputCallbackInfo) + Send + 'static
where
    T: SizedSample + Sample + FromSample<f32>,
{
    let step = 48_000.0 / rate;
    let mut band = Band::new(rate as f32);
    let mut opos = 0.0f64;
    let mut inited = false;
    let mut dcur = [f64::NAN; MAX_PEERS];
    let mut ppk = [0.0f32; MAX_PEERS];
    let mut errs = ErrWin::new();
    move |out: &mut [T], info: &cpal::OutputCallbackInfo| {
            let ts = info.timestamp();
            let lat = ts.playback.duration_since(ts.callback).as_nanos() as i64;
            sh.out_lat_ns.store(lat, Ordering::Relaxed);
            let frames = out.len() / chans.max(1);
            sh.out_buf.store(frames as u32, Ordering::Relaxed);
            sh.rate_out.store(rate as u32, Ordering::Relaxed);
            let measured = ns_to_48(sh.clock.shared_ns() + lat);
            let err = errs.push(measured - opos);
            let trim = if !inited || err.abs() > 480.0 {
                errs.clear();
                opos = measured;
                inited = true;
                1.0
            } else {
                (1.0 + err / 96_000.0).clamp(0.997, 1.003)
            };
            let sess = sh.sess.load();
            let mix = sh.mix.load();
            let targets: [f64; MAX_PEERS] = std::array::from_fn(|i| crate::f64_load(&sh.slots[i].delay48));
            let rings: [Option<Arc<crate::ring::PeerRing>>; MAX_PEERS] = std::array::from_fn(|i| if sh.slots[i].active.load(Ordering::Relaxed) { sh.slots[i].ring.load_full() } else { None });
            let offs: [f64; MAX_PEERS] = std::array::from_fn(|i| sh.slots[i].offset48.load(Ordering::Relaxed) as f64);
            let gains: [f32; MAX_PEERS] = std::array::from_fn(|i| if sh.slots[i].mute.load(Ordering::Relaxed) { 0.0 } else { f32_load(&sh.slots[i].gain) });
            let mon_gain = if mon_ok && sh.monitor.load(Ordering::Relaxed) { f32_load(&sh.monitor_gain) } else { 0.0 };
            // keep the monitor path short: drop anything beyond two buffers
            if mon_ok {
                while mon.slots() > frames * 2 + 64 {
                    let _ = mon.pop();
                }
            }
            let mut opk = 0.0f32;
            for f in 0..frames {
                let p = opos;
                let mut y = band.tick(&sess, &mix, p);
                for i in 0..MAX_PEERS {
                    if let Some(r) = &rings[i] {
                        let tgt = targets[i];
                        if !tgt.is_finite() {
                            continue;
                        }
                        let d = &mut dcur[i];
                        if !d.is_finite() || (tgt - *d).abs() > 1200.0 {
                            *d = tgt;
                        } else {
                            // slide the delay very gently (≤0.2% speed change) so it never clicks
                            *d += (tgt - *d).clamp(-0.002, 0.002);
                        }
                        let (v, _) = r.read(p - *d + offs[i]);
                        let v = v * gains[i];
                        ppk[i] = ppk[i].max(v.abs());
                        y += v;
                    }
                }
                if mon_ok {
                    if let Ok(m) = mon.pop() {
                        y += m * mon_gain;
                    }
                }
                // soft limit
                let y = if y.abs() > 0.9 { y.signum() * (0.9 + (y.abs() - 0.9).tanh() * 0.1) } else { y };
                opk = opk.max(y.abs());
                let s = T::from_sample(y);
                for c in 0..chans {
                    out[f * chans + c] = if c < 2 { s } else { T::from_sample(0.0f32) };
                }
                opos += step * trim;
            }
            let fall = (-(frames as f32) / rate as f32 / 0.4).exp();
            for i in 0..MAX_PEERS {
                let old = f32_load(&sh.slots[i].level);
                f32_store(&sh.slots[i].level, ppk[i].max(old * fall));
                ppk[i] = 0.0;
                if rings[i].is_none() {
                    dcur[i] = f64::NAN;
                }
            }
            let old = f32_load(&sh.out_level);
            f32_store(&sh.out_level, opk.max(old * fall));
        }
}

fn build_out<T>(dev: &cpal::Device, cfg: &StreamConfig, sh: Arc<Shared>, mon: rtrb::Consumer<f32>, mon_ok: bool) -> Result<cpal::Stream, String>
where
    T: SizedSample + Sample + FromSample<f32>,
{
    let sh2 = sh.clone();
    let cb = output_cb::<T>(sh, cfg.channels as usize, cfg.sample_rate as f64, mon, mon_ok);
    dev.build_output_stream::<T, _, _>(
        cfg.clone(),
        cb,
        move |e| {
            sh2.xruns.fetch_add(1, Ordering::Relaxed);
            *sh2.audio_err.lock() = e.to_string();
        },
        None,
    )
    .map_err(|e| e.to_string())
}
