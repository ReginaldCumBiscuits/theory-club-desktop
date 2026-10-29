//! Timestamped receive buffer for one remote player.
//!
//! Audio is stored at its *capture time* on the shared clock (48 kHz sample
//! index), not in arrival order. The output side asks for "what did this
//! player play at time t", so loop sync is just reading t - K bars, and live
//! mode is reading t - (network delay + safety).
//!
//! Lock free: the network thread writes whole 5 ms frames and publishes each
//! with a tag; the audio callback only reads frames whose tag matches.

use std::sync::atomic::{AtomicI64, AtomicU32, Ordering};

pub const FRAME: usize = 240; // 5 ms at 48 kHz
pub const RING_FRAMES: usize = 1 << 14; // about 82 seconds

pub struct PeerRing {
    samples: Box<[AtomicU32]>,
    tags: Box<[AtomicI64]>,
}

impl PeerRing {
    pub fn new() -> Self {
        let samples = (0..RING_FRAMES * FRAME).map(|_| AtomicU32::new(0)).collect::<Vec<_>>().into_boxed_slice();
        let tags = (0..RING_FRAMES).map(|_| AtomicI64::new(i64::MIN)).collect::<Vec<_>>().into_boxed_slice();
        PeerRing { samples, tags }
    }

    /// `frame` = capture timestamp / FRAME.
    pub fn write(&self, frame: i64, data: &[f32]) {
        let slot = frame.rem_euclid(RING_FRAMES as i64) as usize;
        self.tags[slot].store(i64::MIN, Ordering::Release);
        let base = slot * FRAME;
        for (i, s) in data.iter().take(FRAME).enumerate() {
            self.samples[base + i].store(s.to_bits(), Ordering::Relaxed);
        }
        self.tags[slot].store(frame, Ordering::Release);
    }

    pub fn has(&self, frame: i64) -> bool {
        let slot = frame.rem_euclid(RING_FRAMES as i64) as usize;
        self.tags[slot].load(Ordering::Acquire) == frame
    }

    /// One sample at integer timestamp `t`, or None if that frame is missing.
    #[inline]
    pub fn sample(&self, t: i64) -> Option<f32> {
        let frame = t.div_euclid(FRAME as i64);
        let slot = frame.rem_euclid(RING_FRAMES as i64) as usize;
        if self.tags[slot].load(Ordering::Acquire) != frame {
            return None;
        }
        let v = f32::from_bits(self.samples[slot * FRAME + t.rem_euclid(FRAME as i64) as usize].load(Ordering::Relaxed));
        // the writer may have replaced the frame while we read
        if self.tags[slot].load(Ordering::Acquire) != frame {
            return None;
        }
        Some(v)
    }

    /// Linear interpolation at fractional timestamp. Missing audio reads as silence.
    #[inline]
    pub fn read(&self, t: f64) -> (f32, bool) {
        let i = t.floor();
        let fr = (t - i) as f32;
        let i = i as i64;
        match (self.sample(i), self.sample(i + 1)) {
            (Some(a), Some(b)) => (a + (b - a) * fr, true),
            (Some(a), None) => (a, true),
            (None, Some(b)) => (b, true),
            _ => (0.0, false),
        }
    }
}

impl Default for PeerRing {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn stores_by_timestamp() {
        let r = PeerRing::new();
        let f: Vec<f32> = (0..FRAME).map(|i| i as f32).collect();
        r.write(1000, &f);
        assert_eq!(r.sample(1000 * FRAME as i64 + 7), Some(7.0));
        assert_eq!(r.sample(1001 * FRAME as i64), None);
        let (v, ok) = r.read(1000.0 * FRAME as f64 + 2.5);
        assert!(ok && (v - 2.5).abs() < 1e-6);
        // wraps around without confusing an old frame for a new one
        r.write(1000 + RING_FRAMES as i64, &f);
        assert_eq!(r.sample(1000 * FRAME as i64 + 7), None);
    }
}
