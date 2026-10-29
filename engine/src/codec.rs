//! Audio codecs: Opus in its lowest-delay mode (5 ms frames), or raw 16-bit
//! PCM for fast local networks where every millisecond counts.

use crate::ring::FRAME;
use opus::{Application, Bitrate, Channels, Decoder, Encoder};

#[derive(Clone, Copy, Debug, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Codec {
    Opus,
    Pcm,
}

pub struct Enc {
    opus: Encoder,
    pub codec: Codec,
}

impl Enc {
    pub fn new(codec: Codec, bitrate: i32) -> Result<Self, String> {
        let mut opus = Encoder::new(48_000, Channels::Mono, Application::LowDelay).map_err(|e| e.to_string())?;
        opus.set_bitrate(Bitrate::Bits(bitrate.clamp(32_000, 256_000))).map_err(|e| e.to_string())?;
        let _ = opus.set_vbr(false);
        Ok(Enc { opus, codec })
    }
    /// Samples of codec delay: decoded audio is this much later than the input.
    pub fn lookahead(&mut self) -> u16 {
        match self.codec {
            Codec::Opus => self.opus.get_lookahead().unwrap_or(120).clamp(0, 2000) as u16,
            Codec::Pcm => 0,
        }
    }
    pub fn set_bitrate(&mut self, b: i32) {
        let _ = self.opus.set_bitrate(Bitrate::Bits(b.clamp(32_000, 256_000)));
    }
    /// Returns (codec byte, payload length) written to `out`.
    pub fn encode(&mut self, frame: &[f32], out: &mut [u8]) -> Result<(u8, usize), String> {
        match self.codec {
            Codec::Opus => {
                let n = self.opus.encode_float(&frame[..FRAME], out).map_err(|e| e.to_string())?;
                Ok((0, n))
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
    opus: Decoder,
}

impl Dec {
    pub fn new() -> Result<Self, String> {
        Ok(Dec { opus: Decoder::new(48_000, Channels::Mono).map_err(|e| e.to_string())? })
    }
    pub fn decode(&mut self, codec: u8, data: &[u8], out: &mut [f32]) -> bool {
        match codec {
            0 => matches!(self.opus.decode_float(data, &mut out[..FRAME], false), Ok(n) if n == FRAME),
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
        matches!(self.opus.decode_float(&[], &mut out[..FRAME], false), Ok(n) if n == FRAME)
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
