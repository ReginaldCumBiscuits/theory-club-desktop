//! Shared clock. Every player locks to the host's clock so the click, the
//! backing band and every timestamp in an audio packet mean the same moment
//! on every machine.

use std::collections::VecDeque;
use std::sync::atomic::{AtomicBool, AtomicI64, Ordering};
use std::time::Instant;

pub const SR: f64 = 48_000.0;

pub struct Clock {
    base: Instant,
    off_ns: AtomicI64,
    pub synced: AtomicBool,
}

impl Clock {
    pub fn new() -> Self {
        Clock { base: Instant::now(), off_ns: AtomicI64::new(0), synced: AtomicBool::new(false) }
    }
    /// Nanoseconds since this engine started (monotonic).
    pub fn local_ns(&self) -> i64 {
        self.base.elapsed().as_nanos() as i64
    }
    pub fn local_ns_at(&self, t: Instant) -> i64 {
        t.saturating_duration_since(self.base).as_nanos() as i64
    }
    pub fn offset_ns(&self) -> i64 {
        self.off_ns.load(Ordering::Relaxed)
    }
    pub fn set_offset_ns(&self, v: i64) {
        self.off_ns.store(v, Ordering::Relaxed)
    }
    /// Shared (host) time in nanoseconds.
    pub fn shared_ns(&self) -> i64 {
        self.local_ns() + self.offset_ns()
    }
    /// Shared time in 48 kHz samples.
    pub fn shared_48(&self) -> f64 {
        ns_to_48(self.shared_ns())
    }
}

impl Default for Clock {
    fn default() -> Self {
        Self::new()
    }
}

pub fn ns_to_48(ns: i64) -> f64 {
    ns as f64 * SR / 1e9
}
pub fn s48_to_ns(s: f64) -> i64 {
    (s * 1e9 / SR) as i64
}

/// NTP-style filter: keeps recent (rtt, offset) samples and trusts the ones
/// with the shortest round trip, which have the least queueing error.
pub struct SyncFilter {
    samples: VecDeque<(i64, i64)>,
    est: Option<f64>,
}

impl SyncFilter {
    pub fn new() -> Self {
        SyncFilter { samples: VecDeque::with_capacity(64), est: None }
    }
    /// t1 = our local send time, t2 = host shared time when it answered,
    /// t3 = our local receive time. Returns the new offset estimate.
    pub fn add(&mut self, t1: i64, t2: i64, t3: i64) -> Option<i64> {
        let rtt = t3 - t1;
        if !(0..2_000_000_000).contains(&rtt) {
            return self.est.map(|e| e as i64);
        }
        let off = t2 + rtt / 2 - t3;
        self.samples.push_back((rtt, off));
        if self.samples.len() > 48 {
            self.samples.pop_front();
        }
        let mut v: Vec<(i64, i64)> = self.samples.iter().copied().collect();
        v.sort_by_key(|x| x.0);
        let n = (v.len() / 4).max(3).min(v.len());
        let mean = v[..n].iter().map(|x| x.1 as f64).sum::<f64>() / n as f64;
        self.est = Some(match self.est {
            // slew gently once locked so timestamps never jump
            Some(e) if self.samples.len() > 8 && (mean - e).abs() < 5e6 => e + (mean - e) * 0.2,
            _ => mean,
        });
        self.est.map(|e| e as i64)
    }
    pub fn count(&self) -> usize {
        self.samples.len()
    }
    pub fn best_rtt_ns(&self) -> Option<i64> {
        self.samples.iter().map(|x| x.0).min()
    }
}

impl Default for SyncFilter {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn filter_prefers_fast_round_trips() {
        let mut f = SyncFilter::new();
        let true_off = 5_000_000_000i64;
        let mut est = 0;
        for i in 0..40 {
            let t1 = i * 100_000_000;
            // asymmetric queueing on slow samples
            let (up, down) = if i % 3 == 0 { (2_000_000, 2_000_000) } else { (30_000_000, 3_000_000) };
            let t2 = t1 + up + true_off;
            let t3 = t1 + up + down;
            est = f.add(t1, t2, t3).unwrap();
        }
        assert!((est - true_off).abs() < 1_000_000, "est {} vs {}", est, true_off);
    }
}
