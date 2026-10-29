//! Audio codecs: Opus in its lowest-delay mode (5 ms frames), or raw 16-bit
//! PCM for fast local networks where every millisecond counts.
//!
//! Opus comes from `unsafe-libopus`, libopus 1.3.1 translated to Rust, so the
//! build needs no C compiler or CMake on any platform.

use crate::ring::FRAME;
use unsafe_libopus as op;
use unsafe_libopus::opus_encoder_ctl;

#[derive(Clone, Copy, Debug, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Codec {
    Opus,
    Pcm,
}

struct OpusEnc(*mut op::OpusEncoder);
// The encoder is only ever used behind the engine's mutex.
unsafe impl Send for OpusEnc {}
impl Drop for OpusEnc {
    fn drop(&mut self) {
        unsafe { op::opus_encoder_destroy(self.0) }
    }
}

struct OpusDec(*mut op::OpusDecoder);
unsafe impl Send for OpusDec {}
impl Drop for OpusDec {
    fn drop(&mut self) {
        unsafe { op::opus_decoder_destroy(self.0) }
    }
}

pub struct Enc {
    opus: OpusEnc,
    pub codec: Codec,
}

impl Enc {
    pub fn new(codec: Codec, bitrate: i32) -> Result<Self, String> {
        let mut err = 0i32;
        let st = unsafe { op::opus_encoder_create(48_000, 1, op::OPUS_APPLICATION_RESTRICTED_LOWDELAY, &mut err) };
        if st.is_null() || err != op::OPUS_OK {
            return Err(format!("Opus encoder error {}", err));
        }
        let mut e = Enc { opus: OpusEnc(st), codec };
        e.set_bitrate(bitrate);
        unsafe {
            opus_encoder_ctl!(st, op::OPUS_SET_VBR_REQUEST, 0i32);
            opus_encoder_ctl!(st, op::OPUS_SET_COMPLEXITY_REQUEST, 8i32);
        }
        Ok(e)
    }
    /// Samples of codec delay: decoded audio is this much later than the input.
    pub fn lookahead(&mut self) -> u16 {
        match self.codec {
            Codec::Opus => {
                let mut v = 120i32;
                unsafe { opus_encoder_ctl!(self.opus.0, op::OPUS_GET_LOOKAHEAD_REQUEST, &mut v) };
                v.clamp(0, 2000) as u16
            }
            Codec::Pcm => 0,
        }
    }
    pub fn set_bitrate(&mut self, b: i32) {
        unsafe { opus_encoder_ctl!(self.opus.0, op::OPUS_SET_BITRATE_REQUEST, b.clamp(32_000, 256_000)) };
    }
    /// Returns (codec byte, payload length) written to `out`.
    pub fn encode(&mut self, frame: &[f32], out: &mut [u8]) -> Result<(u8, usize), String> {
        match self.codec {
            Codec::Opus => {
                let n = unsafe { op::opus_encode_float(self.opus.0, frame.as_ptr(), FRAME as i32, out.as_mut_ptr(), out.len().min(1275) as i32) };
                if n < 0 {
                    return Err(format!("Opus encode error {}", n));
                }
                Ok((0, n as usize))
            }
            Codec::Pcm => {
                for (i, s) in frame[..FRAME].iter().enumerate() {
                    let v = (s.clamp(-1.0, 1.0) * 32767.0) as i16;
                    out[i * 2..i * 2 + 2].copy_from_slice(&v.to_le_bytes());
                }
                Ok((1, FRAME * 2))
            }
        }
    }
}

pub struct Dec {
    opus: OpusDec,
}

impl Dec {
    pub fn new() -> Result<Self, String> {
        let mut err = 0i32;
        let st = unsafe { op::opus_decoder_create(48_000, 1, &mut err) };
        if st.is_null() || err != op::OPUS_OK {
            return Err(format!("Opus decoder error {}", err));
        }
        Ok(Dec { opus: OpusDec(st) })
    }
    pub fn decode(&mut self, codec: u8, data: &[u8], out: &mut [f32]) -> bool {
        match codec {
            0 if !data.is_empty() => {
                let n = unsafe { op::opus_decode_float(self.opus.0, data.as_ptr(), data.len() as i32, out.as_mut_ptr(), FRAME as i32, 0) };
                n == FRAME as i32
            }
            1 if data.len() >= FRAME * 2 => {
                for (i, o) in out[..FRAME].iter_mut().enumerate() {
                    *o = i16::from_le_bytes([data[i * 2], data[i * 2 + 1]]) as f32 / 32768.0;
                }
                true
            }
            _ => false,
        }
    }
    /// Packet loss concealment for one missing frame.
    pub fn conceal(&mut self, out: &mut [f32]) -> bool {
        let n = unsafe { op::opus_decode_float(self.opus.0, std::ptr::null(), 0, out.as_mut_ptr(), FRAME as i32, 0) };
        n == FRAME as i32
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn opus_round_trip() {
        let mut e = Enc::new(Codec::Opus, 128_000).unwrap();
        let mut d = Dec::new().unwrap();
        let mut buf = [0u8; 1500];
        let mut out = [0f32; FRAME];
        let mut energy_in = 0.0;
        let mut energy_out = 0.0;
        for k in 0..40 {
            let f: Vec<f32> = (0..FRAME).map(|i| (((k * FRAME + i) as f32) * 440.0 * std::f32::consts::TAU / 48_000.0).sin() * 0.5).collect();
            let (c, n) = e.encode(&f, &mut buf).unwrap();
            assert!(n > 10 && n < 200, "opus frame {} bytes", n);
            assert!(d.decode(c, &buf[..n], &mut out));
            if k > 5 {
                energy_in += f.iter().map(|x| x * x).sum::<f32>();
                energy_out += out.iter().map(|x| x * x).sum::<f32>();
            }
        }
        assert!((energy_out / energy_in - 1.0).abs() < 0.2);
    }
    #[test]
    fn pcm_round_trip() {
        let mut e = Enc::new(Codec::Pcm, 128_000).unwrap();
        let mut d = Dec::new().unwrap();
        let f: Vec<f32> = (0..FRAME).map(|i| i as f32 / FRAME as f32 - 0.5).collect();
        let mut buf = [0u8; 1500];
        let mut out = [0f32; FRAME];
        let (c, n) = e.encode(&f, &mut buf).unwrap();
        assert!(d.decode(c, &buf[..n], &mut out));
        assert!((out[100] - f[100]).abs() < 1e-3);
    }
}
