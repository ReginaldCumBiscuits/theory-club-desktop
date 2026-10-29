//! The shared band, rendered inside the audio callback so the click and
//! backing land on exactly the same sample on every machine.

use serde::{Deserialize, Serialize};

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize, Default)]
#[serde(rename_all = "lowercase")]
pub enum Mode {
    #[default]
    Sync,
    Live,
}

/// Set by the host and copied to everyone. Times are shared-clock milliseconds.
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Session {
    pub playing: bool,
    pub t0_ms: f64,
    pub bpm: f64,
    pub beats: u32,
    /// grid steps per bar (16 for straight sixteenths, 12 for triplet feels)
    pub steps: u32,
    /// drum rows: (piece, pattern) with 'x' = hit, 'o' = ghost, '.' = rest
    pub rows: Vec<(String, String)>,
    /// bass root MIDI note per bar of the loop, -1 = none
    pub bass: Vec<i32>,
    pub mode: Mode,
    /// loop sync: hear everyone this many bars late (whole multiples are added if the link is slower)
    pub sync_bars: u32,
}

impl Default for Session {
    fn default() -> Self {
        Session { playing: false, t0_ms: 0.0, bpm: 96.0, beats: 4, steps: 16, rows: vec![], bass: vec![], mode: Mode::Sync, sync_bars: 4 }
    }
}

impl Session {
    pub fn bar_48(&self) -> f64 {
        self.beats.max(1) as f64 * 60.0 / self.bpm.clamp(30.0, 300.0) * 48_000.0
    }
}

/// What this player wants in their own ears.
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct LocalMix {
    pub click: bool,
    pub drums: bool,
    pub bass: bool,
    pub click_vol: f32,
    pub band_vol: f32,
}

impl Default for LocalMix {
    fn default() -> Self {
        LocalMix { click: true, drums: true, bass: true, click_vol: 0.6, band_vol: 0.7 }
    }
}

#[derive(Clone, Copy, PartialEq)]
enum Kind {
    Off,
    Click(bool),
    Kick,
    Snare,
    Hat,
    Open,
    Rim,
    Ride,
    Bass(f32),
}

#[derive(Clone, Copy)]
struct Voice {
    kind: Kind,
    age: f32,
    vel: f32,
    phase: f32,
    dur: f32,
    hp: f32,
    lp: f32,
}

const OFF: Voice = Voice { kind: Kind::Off, age: 0.0, vel: 0.0, phase: 0.0, dur: 0.0, hp: 0.0, lp: 0.0 };

pub struct Band {
    voices: [Voice; 48],
    last_step: i64,
    last_t0: f64,
    sr: f32,
    rng: u32,
}

impl Band {
    pub fn new(sr: f32) -> Self {
        Band { voices: [OFF; 48], last_step: i64::MIN, last_t0: f64::NAN, sr, rng: 0x1234_5678 }
    }

    fn noise(&mut self) -> f32 {
        let mut x = self.rng;
        x ^= x << 13;
        x ^= x >> 17;
        x ^= x << 5;
        self.rng = x;
        (x as f32 / u32::MAX as f32) * 2.0 - 1.0
    }

    fn trigger(&mut self, kind: Kind, vel: f32, dur: f32) {
        let slot = self.voices.iter().position(|v| v.kind == Kind::Off).unwrap_or_else(|| {
            // steal the oldest
            let mut best = 0;
            for (i, v) in self.voices.iter().enumerate() {
                if v.age > self.voices[best].age {
                    best = i
                }
            }
            best
        });
        self.voices[slot] = Voice { kind, age: 0.0, vel, phase: 0.0, dur, hp: 0.0, lp: 0.0 };
    }

    fn step_events(&mut self, s: &Session, m: &LocalMix, step: i64) {
        let steps = s.steps.max(1) as i64;
        let per_beat = (steps / s.beats.max(1) as i64).max(1);
        let k = step.rem_euclid(steps);
        let bar = step.div_euclid(steps);
        if step < 0 {
            // count-in bar: clicks only
            if step >= -steps && k % per_beat == 0 {
                self.trigger(Kind::Click(k == 0), m.click_vol.max(0.4), 0.03);
            }
            return;
        }
        if m.click && k % per_beat == 0 {
            self.trigger(Kind::Click(k == 0), m.click_vol, 0.03);
        }
        if m.drums {
            for i in 0..s.rows.len() {
                let (piece, pat) = (&s.rows[i].0, &s.rows[i].1);
                let ch = pat.as_bytes().get(k as usize).copied().unwrap_or(b'.');
                if ch != b'x' && ch != b'o' {
                    continue;
                }
                let vel = if ch == b'x' { 1.0 } else { 0.35 } * m.band_vol;
                let kind = match piece.as_str() {
                    "kick" => Kind::Kick,
                    "snare" => Kind::Snare,
                    "open" => Kind::Open,
                    "rim" => Kind::Rim,
                    "ride" => Kind::Ride,
                    _ => Kind::Hat,
                };
                self.trigger(kind, vel, 0.0);
            }
        }
        if m.bass && !s.bass.is_empty() && (k == 0 || k == steps / 2) {
            let note = s.bass[(bar as usize) % s.bass.len()];
            if note >= 0 {
                let f = 440.0 * 2f32.powf((note as f32 - 69.0) / 12.0);
                let half_bar = (s.bar_48() / 48_000.0 / 2.0) as f32;
                self.trigger(Kind::Bass(f), 0.8 * m.band_vol, half_bar * 0.92);
            }
        }
    }

    /// Advance to shared time `p48` (48 kHz sample index) and return one output sample.
    #[inline]
    pub fn tick(&mut self, s: &Session, m: &LocalMix, p48: f64) -> f32 {
        if s.playing {
            let t0 = s.t0_ms * 48.0;
            if t0 != self.last_t0 {
                self.last_t0 = t0;
                self.last_step = i64::MIN;
            }
            let step48 = s.bar_48() / s.steps.max(1) as f64;
            let step = ((p48 - t0) / step48).floor() as i64;
            if step != self.last_step && step >= -(s.steps as i64) {
                if self.last_step == i64::MIN || step == self.last_step + 1 || step < self.last_step {
                    self.step_events(s, m, step);
                }
                self.last_step = step;
            }
        } else {
            self.last_step = i64::MIN;
        }
        self.render()
    }

    fn render(&mut self) -> f32 {
        let dt = 1.0 / self.sr;
        let tau = std::f32::consts::TAU;
        let mut out = 0.0;
        for i in 0..self.voices.len() {
            let v = self.voices[i];
            if v.kind == Kind::Off {
                continue;
            }
            let n = if matches!(v.kind, Kind::Snare | Kind::Hat | Kind::Open | Kind::Ride) { self.noise() } else { 0.0 };
            let mut v = v;
            let a = v.age;
            let (y, done) = match v.kind {
                Kind::Click(hi) => {
                    v.phase += (if hi { 1500.0 } else { 1000.0 }) * dt;
                    ((v.phase * tau).sin() * (-a / 0.012).exp() * v.vel * 0.9, a > 0.05)
                }
                Kind::Kick => {
                    let f = 48.0 + 110.0 * (-a / 0.035).exp();
                    v.phase += f * dt;
                    ((v.phase * tau).sin() * (-a / 0.22).exp() * v.vel * 0.95, a > 0.6)
                }
                Kind::Snare => {
                    v.phase += 185.0 * dt;
                    v.hp = n - v.lp;
                    v.lp += (n - v.lp) * 0.3;
                    (((v.phase * tau).sin() * 0.35 * (-a / 0.05).exp() + v.hp * 0.55 * (-a / 0.12).exp()) * v.vel, a > 0.4)
                }
                Kind::Hat | Kind::Open | Kind::Ride => {
                    v.lp += (n - v.lp) * 0.5;
                    let hp = n - v.lp;
                    let decay = match v.kind {
                        Kind::Hat => 0.035,
                        Kind::Open => 0.22,
                        _ => 0.45,
                    };
                    let ring = if v.kind == Kind::Ride {
                        v.phase += 3100.0 * dt;
                        (v.phase * tau).sin() * 0.12
                    } else {
                        0.0
                    };
                    ((hp * 0.32 + ring) * (-a / decay).exp() * v.vel, a > decay * 7.0)
                }
                Kind::Rim => {
                    v.phase += 820.0 * dt;
                    ((v.phase * tau).sin() * (-a / 0.012).exp() * v.vel * 0.6, a > 0.08)
                }
                Kind::Bass(f) => {
                    v.phase = (v.phase + f * dt).fract();
                    // rounded triangle with a soft attack and release
                    let tri = 1.0 - 4.0 * (v.phase - 0.5).abs();
                    let att = (a / 0.004).min(1.0);
                    let rel = if a > v.dur { (-(a - v.dur) / 0.03).exp() } else { 1.0 };
                    v.lp += (tri - v.lp) * 0.25;
                    (v.lp * att * rel * (-a / 1.6).exp() * v.vel * 0.7, a > v.dur + 0.2)
                }
                Kind::Off => (0.0, true),
            };
            v.age += dt;
            if done {
                v.kind = Kind::Off;
            }
            self.voices[i] = v;
            out += y;
        }
        out
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn click_lands_on_the_beat() {
        let s = Session { playing: true, t0_ms: 1000.0, bpm: 120.0, beats: 4, steps: 16, ..Default::default() };
        let m = LocalMix { drums: false, bass: false, ..Default::default() };
        let mut b = Band::new(48_000.0);
        // beat 2 starts at 1000 ms + 500 ms = sample 72000
        let mut first = None;
        for i in 71_000..73_000 {
            let y = b.tick(&s, &m, i as f64);
            if i > 71_500 && y.abs() > 0.01 && first.is_none() {
                first = Some(i);
            }
        }
        let f = first.unwrap();
        assert!((72_000..72_010).contains(&f), "first click sample {}", f);
    }
}
