//! Theory Club desktop jam engine.
//!
//! Low-latency peer-to-peer audio for up to 8 players, with native sound card
//! access (ASIO / WASAPI / CoreAudio), a shared clock, timestamped audio and a
//! band rendered locally on every machine.

pub mod audio;
pub mod band;
pub mod clock;
pub mod codec;
pub mod net;
pub mod ring;

use arc_swap::{ArcSwap, ArcSwapOption};
use band::{LocalMix, Mode, Session};
use clock::{ns_to_48, Clock, SyncFilter};
use codec::{Codec, Dec, Enc};
use net::{read_header, write_header, Pt, HDR};
use parking_lot::Mutex;
use ring::{PeerRing, FRAME};
use serde::Serialize;
use std::collections::{HashMap, VecDeque};
use std::net::{SocketAddr, UdpSocket};
use std::sync::atomic::{AtomicBool, AtomicI64, AtomicU32, AtomicU64, Ordering};
use std::sync::mpsc::{self, Receiver, SyncSender};
use std::sync::Arc;
use std::time::{Duration, Instant};

pub const MAX_PEERS: usize = 7;

// ---- small atomics helpers

pub fn f32_load(a: &AtomicU32) -> f32 {
    f32::from_bits(a.load(Ordering::Relaxed))
}
pub fn f32_store(a: &AtomicU32, v: f32) {
    a.store(v.to_bits(), Ordering::Relaxed)
}
pub fn f64_load(a: &AtomicU64) -> f64 {
    f64::from_bits(a.load(Ordering::Relaxed))
}
pub fn f64_store(a: &AtomicU64, v: f64) {
    a.store(v.to_bits(), Ordering::Relaxed)
}

/// One remote player as seen by the audio callback (lock free).
pub struct Slot {
    pub active: AtomicBool,
    pub id: AtomicU32,
    pub ring: ArcSwapOption<PeerRing>,
    pub gain: AtomicU32,
    pub mute: AtomicBool,
    /// how far behind playback time to read this player, in 48 kHz samples
    pub delay48: AtomicU64,
    pub level: AtomicU32,
    /// codec delay to undo when reading, in samples
    pub offset48: AtomicU32,
}

impl Slot {
    fn new() -> Self {
        Slot {
            active: AtomicBool::new(false),
            id: AtomicU32::new(0),
            ring: ArcSwapOption::empty(),
            gain: AtomicU32::new(1.0f32.to_bits()),
            mute: AtomicBool::new(false),
            delay48: AtomicU64::new(f64::NAN.to_bits()),
            level: AtomicU32::new(0),
            offset48: AtomicU32::new(0),
        }
    }
}

#[derive(Clone, Copy)]
pub struct InFrame {
    pub ts: i64,
    pub data: [f32; FRAME],
}

pub struct Shared {
    pub clock: Clock,
    pub sess: ArcSwap<Session>,
    pub mix: ArcSwap<LocalMix>,
    pub slots: Vec<Slot>,
    pub in_level: AtomicU32,
    pub out_level: AtomicU32,
    pub monitor: AtomicBool,
    pub monitor_gain: AtomicU32,
    pub input_gain: AtomicU32,
    pub in_lat_ns: AtomicI64,
    pub out_lat_ns: AtomicI64,
    pub in_buf: AtomicU32,
    pub out_buf: AtomicU32,
    pub rate_in: AtomicU32,
    pub rate_out: AtomicU32,
    pub xruns: AtomicU32,
    pub audio_on: AtomicBool,
    pub audio_err: Mutex<String>,
    pub frames_tx: SyncSender<InFrame>,
    pub sent: AtomicU64,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum PeerState {
    Punching,
    Direct,
    Relay,
    Lost,
    Left,
}

struct NetPeer {
    id: u32,
    key: String,
    name: String,
    slot: usize,
    cands: Vec<SocketAddr>,
    direct: Option<SocketAddr>,
    added: Instant,
    last_rx: Option<Instant>,
    last_direct: Option<Instant>,
    state: PeerState,
    dec: Dec,
    last_frame: Option<i64>,
    rtt_ms: Option<f32>,
    recv: u64,
    lost: u64,
    late: VecDeque<(Instant, f64)>,
    bars: u32,
    delay48: f64,
    codec: u8,
    last_ping: Instant,
    last_hello: Instant,
}

struct Net {
    sock: Arc<UdpSocket>,
    gen: u64,
    my_id: u32,
    host_id: u32,
    is_host: bool,
    token: u32,
    peers: HashMap<u32, NetPeer>,
    public: Option<SocketAddr>,
    local: Option<SocketAddr>,
    sync: SyncFilter,
    txn: [u8; 12],
    enc: Enc,
    seq: u32,
}

#[derive(Serialize, Clone, Debug)]
pub struct NetInfo {
    pub cands: Vec<String>,
    pub public: Option<String>,
    pub local: Option<String>,
    pub port: u16,
}

pub struct Engine {
    pub sh: Arc<Shared>,
    net: Arc<Mutex<Option<Net>>>,
    gen: Arc<AtomicU64>,
    audio: Mutex<Option<audio::Running>>,
    codec: Mutex<(Codec, i32)>,
}

impl Engine {
    pub fn new() -> Arc<Engine> {
        let (tx, rx) = mpsc::sync_channel::<InFrame>(512);
        let sh = Arc::new(Shared {
            clock: Clock::new(),
            sess: ArcSwap::from_pointee(Session::default()),
            mix: ArcSwap::from_pointee(LocalMix::default()),
            slots: (0..MAX_PEERS).map(|_| Slot::new()).collect(),
            in_level: AtomicU32::new(0),
            out_level: AtomicU32::new(0),
            monitor: AtomicBool::new(false),
            monitor_gain: AtomicU32::new(1.0f32.to_bits()),
            input_gain: AtomicU32::new(1.0f32.to_bits()),
            in_lat_ns: AtomicI64::new(0),
            out_lat_ns: AtomicI64::new(0),
            in_buf: AtomicU32::new(0),
            out_buf: AtomicU32::new(0),
            rate_in: AtomicU32::new(0),
            rate_out: AtomicU32::new(0),
            xruns: AtomicU32::new(0),
            audio_on: AtomicBool::new(false),
            audio_err: Mutex::new(String::new()),
            frames_tx: tx,
            sent: AtomicU64::new(0),
        });
        let e = Arc::new(Engine { sh, net: Arc::new(Mutex::new(None)), gen: Arc::new(AtomicU64::new(0)), audio: Mutex::new(None), codec: Mutex::new((Codec::Opus, 128_000)) });
        let (sh, net) = (e.sh.clone(), e.net.clone());
        std::thread::Builder::new().name("tc-send".into()).spawn(move || sender_loop(sh, net, rx)).expect("thread");
        e
    }

    // ---- audio

    pub fn hosts(&self) -> Vec<audio::HostInfo> {
        audio::hosts()
    }
    pub fn devices(&self, host: Option<&str>) -> Result<audio::DevList, String> {
        audio::devices(host)
    }
    pub fn start_audio(&self, cfg: audio::AudioCfg) -> Result<audio::AudioInfo, String> {
        self.stop_audio();
        let r = audio::start(self.sh.clone(), cfg)?;
        let info = r.info.clone();
        *self.audio.lock() = Some(r);
        Ok(info)
    }
    pub fn stop_audio(&self) {
        if let Some(r) = self.audio.lock().take() {
            r.stop();
        }
        std::thread::sleep(Duration::from_millis(50));
    }
    pub fn set_local(&self, monitor: Option<bool>, input_gain: Option<f32>, monitor_gain: Option<f32>) {
        if let Some(m) = monitor {
            self.sh.monitor.store(m, Ordering::Relaxed)
        }
        if let Some(g) = input_gain {
            f32_store(&self.sh.input_gain, g.clamp(0.0, 8.0))
        }
        if let Some(g) = monitor_gain {
            f32_store(&self.sh.monitor_gain, g.clamp(0.0, 2.0))
        }
    }
    pub fn set_mix(&self, m: LocalMix) {
        self.sh.mix.store(Arc::new(m))
    }
    pub fn set_session(&self, s: Session) {
        self.sh.sess.store(Arc::new(s));
        if let Some(n) = self.net.lock().as_mut() {
            update_delays(&self.sh, n);
        }
    }
    pub fn set_codec(&self, codec: Codec, bitrate: i32) -> Result<(), String> {
        *self.codec.lock() = (codec, bitrate);
        if let Some(n) = self.net.lock().as_mut() {
            n.enc = Enc::new(codec, bitrate)?;
        }
        Ok(())
    }
    pub fn shared_ms(&self) -> f64 {
        self.sh.clock.shared_ns() as f64 / 1e6
    }

    // ---- network

    /// Opens the UDP socket and learns our public address. `room` and the
    /// player ids are the strings the app's room system already uses.
    pub fn net_open(&self, room: &str, my_key: &str, host_key: &str, port: u16) -> Result<NetInfo, String> {
        self.net_close();
        let sock = UdpSocket::bind(("0.0.0.0", port)).or_else(|_| UdpSocket::bind(("0.0.0.0", 0))).map_err(|e| format!("Couldn't open a network port: {}", e))?;
        sock.set_read_timeout(Some(Duration::from_millis(100))).ok();
        let lport = sock.local_addr().map_err(|e| e.to_string())?.port();
        let sock = Arc::new(sock);
        let my_id = net::hash32(my_key);
        let host_id = net::hash32(host_key);
        let is_host = my_id == host_id;
        let mut txn = [0u8; 12];
        let seed = self.sh.clock.local_ns() as u64 ^ (my_id as u64) << 17;
        for (i, b) in txn.iter_mut().enumerate() {
            *b = (seed.rotate_left(i as u32 * 5) >> 7) as u8 ^ i as u8;
        }
        let (codec, br) = *self.codec.lock();
        let local = net::lan_ip().map(|ip| SocketAddr::new(ip, lport));
        let gen = self.gen.fetch_add(1, Ordering::SeqCst) + 1;
        *self.net.lock() = Some(Net {
            sock: sock.clone(),
            gen,
            my_id,
            host_id,
            is_host,
            token: net::hash32(&room.to_ascii_lowercase()),
            peers: HashMap::new(),
            public: None,
            local,
            sync: SyncFilter::new(),
            txn,
            enc: Enc::new(codec, br)?,
            seq: 0,
        });
        if is_host {
            self.sh.clock.set_offset_ns(0);
            self.sh.clock.synced.store(true, Ordering::Relaxed);
        } else {
            self.sh.clock.synced.store(false, Ordering::Relaxed);
        }
        // network threads
        {
            let (sh, net, g, sock) = (self.sh.clone(), self.net.clone(), self.gen.clone(), sock.clone());
            std::thread::Builder::new().name("tc-recv".into()).spawn(move || recv_loop(sh, net, g, gen, sock)).map_err(|e| e.to_string())?;
            let (sh, net, g) = (self.sh.clone(), self.net.clone(), self.gen.clone());
            std::thread::Builder::new().name("tc-tick".into()).spawn(move || tick_loop(sh, net, g, gen)).map_err(|e| e.to_string())?;
        }
        // ask STUN servers for our public address (UDP, same socket)
        let req = net::stun_request(txn);
        for s in net::STUN_SERVERS {
            if let Some(a) = net::resolve(s) {
                let _ = sock.send_to(&req, a);
            }
        }
        let t = Instant::now();
        while t.elapsed() < Duration::from_millis(1500) {
            if self.net.lock().as_ref().map(|n| n.public.is_some()).unwrap_or(false) {
                break;
            }
            std::thread::sleep(Duration::from_millis(20));
        }
        Ok(self.net_info().unwrap_or(NetInfo { cands: vec![], public: None, local: None, port: lport }))
    }

    pub fn net_info(&self) -> Option<NetInfo> {
        let g = self.net.lock();
        let n = g.as_ref()?;
        let port = n.sock.local_addr().ok()?.port();
        let mut cands = vec![];
        if let Some(l) = n.local {
            cands.push(l.to_string());
        }
        if let Some(p) = n.public {
            if Some(p) != n.local {
                cands.push(p.to_string());
            }
        }
        cands.push(format!("127.0.0.1:{}", port));
        Some(NetInfo { cands, public: n.public.map(|a| a.to_string()), local: n.local.map(|a| a.to_string()), port })
    }

    /// A player joined (their candidates came through the room's signalling).
    pub fn net_peer(&self, key: &str, name: &str, cands: &[String]) -> Result<(), String> {
        let mut g = self.net.lock();
        let n = g.as_mut().ok_or("Not in a room")?;
        let id = net::hash32(key);
        if id == n.my_id {
            return Ok(());
        }
        let parsed: Vec<SocketAddr> = cands.iter().filter_map(|c| c.parse().ok()).collect();
        if let Some(p) = n.peers.get_mut(&id) {
            p.name = name.to_string();
            for c in parsed {
                if !p.cands.contains(&c) {
                    p.cands.push(c);
                }
            }
            if p.state == PeerState::Left {
                p.state = PeerState::Punching;
                p.added = Instant::now();
            }
            return Ok(());
        }
        let used: Vec<usize> = n.peers.values().map(|p| p.slot).collect();
        let slot = (0..MAX_PEERS).find(|i| !used.contains(i)).ok_or("The room is full")?;
        let s = &self.sh.slots[slot];
        s.ring.store(Some(Arc::new(PeerRing::new())));
        s.id.store(id, Ordering::Relaxed);
        f64_store(&s.delay48, f64::NAN);
        f32_store(&s.gain, 1.0);
        s.mute.store(false, Ordering::Relaxed);
        s.active.store(true, Ordering::Release);
        let now = Instant::now();
        n.peers.insert(
            id,
            NetPeer {
                id,
                key: key.to_string(),
                name: name.to_string(),
                slot,
                cands: parsed,
                direct: None,
                added: now,
                last_rx: None,
                last_direct: None,
                state: PeerState::Punching,
                dec: Dec::new()?,
                last_frame: None,
                rtt_ms: None,
                recv: 0,
                lost: 0,
                late: VecDeque::with_capacity(1024),
                bars: 0,
                delay48: f64::NAN,
                codec: 0,
                last_ping: now - Duration::from_secs(5),
                last_hello: now - Duration::from_secs(5),
            },
        );
        Ok(())
    }

    pub fn net_drop(&self, key: &str) {
        let mut g = self.net.lock();
        if let Some(n) = g.as_mut() {
            if let Some(p) = n.peers.remove(&net::hash32(key)) {
                free_slot(&self.sh, p.slot);
            }
        }
    }

    pub fn net_close(&self) {
        let mut g = self.net.lock();
        if let Some(n) = g.as_mut() {
            let mut b = [0u8; HDR];
            for p in n.peers.values() {
                write_header(&mut b, Pt::Bye, n.token, n.my_id, p.id);
                if let Some(a) = p.direct {
                    let _ = n.sock.send_to(&b, a);
                }
                free_slot(&self.sh, p.slot);
            }
        }
        *g = None;
        self.gen.fetch_add(1, Ordering::SeqCst);
    }

    pub fn set_peer(&self, key: &str, gain: Option<f32>, mute: Option<bool>) {
        let g = self.net.lock();
        if let Some(n) = g.as_ref() {
            if let Some(p) = n.peers.get(&net::hash32(key)) {
                let s = &self.sh.slots[p.slot];
                if let Some(v) = gain {
                    f32_store(&s.gain, v.clamp(0.0, 4.0))
                }
                if let Some(m) = mute {
                    s.mute.store(m, Ordering::Relaxed)
                }
            }
        }
    }

    /// Feed a frame as if it came from the sound card (tests, file playback).
    pub fn inject(&self, f: InFrame) {
        let _ = self.sh.frames_tx.try_send(f);
    }
    /// What we'd hear from a player at shared time `t48`, ignoring delay (tests).
    pub fn peer_sample(&self, key: &str, t48: i64) -> Option<f32> {
        let g = self.net.lock();
        let p = g.as_ref()?.peers.get(&net::hash32(key))?;
        self.sh.slots[p.slot].ring.load_full()?.sample(t48)
    }
    pub fn peer_delay48(&self, key: &str) -> Option<f64> {
        let g = self.net.lock();
        let p = g.as_ref()?.peers.get(&net::hash32(key))?;
        Some(f64_load(&self.sh.slots[p.slot].delay48))
    }

    pub fn stats(&self) -> serde_json::Value {
        let sh = &self.sh;
        let g = self.net.lock();
        let rate_out = sh.rate_out.load(Ordering::Relaxed).max(1) as f64;
        let rate_in = sh.rate_in.load(Ordering::Relaxed).max(1) as f64;
        let peers: Vec<serde_json::Value> = g
            .as_ref()
            .map(|n| {
                n.peers
                    .values()
                    .map(|p| {
                        let late = p.late.iter().map(|x| x.1).fold(f64::NAN, f64::max);
                        let total = p.recv + p.lost;
                        serde_json::json!({
                            "key": p.key, "name": p.name, "state": p.state,
                            "rtt_ms": p.rtt_ms, "net_ms": if late.is_finite() { Some(late / 48.0) } else { None },
                            "loss": if total > 0 { p.lost as f64 / total as f64 } else { 0.0 },
                            "delay_ms": if p.delay48.is_finite() { Some(p.delay48 / 48.0) } else { None },
                            "bars": p.bars, "level": f32_load(&sh.slots[p.slot].level),
                            "codec": if p.codec == 1 { "pcm" } else { "opus" },
                            "via": p.direct.map(|a| a.to_string()),
                        })
                    })
                    .collect()
            })
            .unwrap_or_default();
        serde_json::json!({
            "shared_ms": sh.clock.shared_ns() as f64 / 1e6,
            "synced": sh.clock.synced.load(Ordering::Relaxed),
            "clock_rtt_ms": g.as_ref().and_then(|n| n.sync.best_rtt_ns()).map(|x| x as f64 / 1e6),
            "audio": sh.audio_on.load(Ordering::Relaxed),
            "audio_error": sh.audio_err.lock().clone(),
            "in_level": f32_load(&sh.in_level), "out_level": f32_load(&sh.out_level),
            "in_ms": sh.in_lat_ns.load(Ordering::Relaxed) as f64 / 1e6 + sh.in_buf.load(Ordering::Relaxed) as f64 / rate_in * 1000.0,
            "out_ms": sh.out_lat_ns.load(Ordering::Relaxed) as f64 / 1e6,
            "buffer": sh.out_buf.load(Ordering::Relaxed),
            "rate": sh.rate_out.load(Ordering::Relaxed),
            "buffer_ms": sh.out_buf.load(Ordering::Relaxed) as f64 / rate_out * 1000.0,
            "xruns": sh.xruns.load(Ordering::Relaxed),
            "sent": sh.sent.load(Ordering::Relaxed),
            "public": g.as_ref().and_then(|n| n.public.map(|a| a.to_string())),
            "peers": peers,
        })
    }
}

fn free_slot(sh: &Shared, slot: usize) {
    let s = &sh.slots[slot];
    s.active.store(false, Ordering::Release);
    f64_store(&s.delay48, f64::NAN);
    s.ring.store(None);
}

/// Where to send a packet for this peer: straight to them, or via the host.
fn route(n: &Net, p: &NetPeer) -> Option<SocketAddr> {
    if let Some(a) = p.direct {
        if p.state == PeerState::Direct {
            return Some(a);
        }
    }
    if !n.is_host && p.state == PeerState::Relay {
        return n.peers.get(&n.host_id).and_then(|h| h.direct);
    }
    None
}

fn sender_loop(sh: Arc<Shared>, net: Arc<Mutex<Option<Net>>>, rx: Receiver<InFrame>) {
    let mut buf = [0u8; 1600];
    let mut payload = [0u8; 1400];
    while let Ok(f) = rx.recv() {
        let mut g = net.lock();
        let n = match g.as_mut() {
            Some(n) => n,
            None => continue,
        };
        if n.peers.is_empty() {
            continue;
        }
        let (codec, len) = match n.enc.encode(&f.data, &mut payload) {
            Ok(x) => x,
            Err(_) => continue,
        };
        n.seq = n.seq.wrapping_add(1);
        let la = n.enc.lookahead();
        let body = HDR + 4 + 8 + 1 + 2 + 2;
        buf[HDR..HDR + 4].copy_from_slice(&n.seq.to_le_bytes());
        buf[HDR + 4..HDR + 12].copy_from_slice(&f.ts.to_le_bytes());
        buf[HDR + 12] = codec;
        buf[HDR + 13..HDR + 15].copy_from_slice(&(FRAME as u16).to_le_bytes());
        buf[HDR + 15..HDR + 17].copy_from_slice(&la.to_le_bytes());
        buf[body..body + len].copy_from_slice(&payload[..len]);
        for p in n.peers.values() {
            if let Some(a) = route(n, p) {
                write_header(&mut buf, Pt::Audio, n.token, n.my_id, p.id);
                let _ = n.sock.send_to(&buf[..body + len], a);
            }
        }
        sh.sent.fetch_add(1, Ordering::Relaxed);
    }
}

fn recv_loop(sh: Arc<Shared>, net: Arc<Mutex<Option<Net>>>, g_gen: Arc<AtomicU64>, gen: u64, sock: Arc<UdpSocket>) {
    let mut buf = [0u8; 2048];
    let mut pcm = [0f32; FRAME];
    loop {
        if g_gen.load(Ordering::SeqCst) != gen {
            return;
        }
        let (len, from) = match sock.recv_from(&mut buf) {
            Ok(x) => x,
            Err(_) => continue,
        };
        let pkt = &buf[..len];
        let now = Instant::now();
        let mut g = net.lock();
        let n = match g.as_mut() {
            Some(n) if n.gen == gen => n,
            _ => return,
        };
        if net::is_stun(pkt) {
            if let Some(a) = net::stun_parse(pkt, &n.txn) {
                n.public = Some(a);
            }
            continue;
        }
        let h = match read_header(pkt) {
            Some(h) if h.token == n.token && h.src != n.my_id => h,
            _ => continue,
        };
        // host relays packets meant for someone else
        if h.dst != 0 && h.dst != n.my_id {
            if n.is_host {
                if let Some(a) = n.peers.get(&h.dst).and_then(|p| p.direct) {
                    let _ = n.sock.send_to(pkt, a);
                }
            }
            continue;
        }
        let host_addr = n.peers.get(&n.host_id).and_then(|p| p.direct);
        let relayed = !n.is_host && h.src != n.host_id && Some(from) == host_addr && n.peers.get(&h.src).map(|p| p.direct != Some(from)).unwrap_or(true);
        let my_id = n.my_id;
        let token = n.token;
        let is_host_src = h.src == n.host_id;
        let p = match n.peers.get_mut(&h.src) {
            Some(p) => p,
            None => continue,
        };
        p.last_rx = Some(now);
        if !relayed {
            if p.direct != Some(from) {
                p.direct = Some(from);
            }
            p.last_direct = Some(now);
            if p.state != PeerState::Direct {
                p.state = PeerState::Direct;
            }
        } else if p.state != PeerState::Direct {
            p.state = PeerState::Relay;
        }
        match h.pt {
            Pt::Hello => {}
            Pt::Bye => {
                p.state = PeerState::Left;
                p.direct = None;
            }
            Pt::Ping if len >= HDR + 8 => {
                let mut out = [0u8; HDR + 16];
                write_header(&mut out, Pt::Pong, token, my_id, h.src);
                out[HDR..HDR + 8].copy_from_slice(&pkt[HDR..HDR + 8]);
                out[HDR + 8..HDR + 16].copy_from_slice(&sh.clock.shared_ns().to_le_bytes());
                let _ = sock.send_to(&out, from);
            }
            Pt::Pong if len >= HDR + 16 => {
                let t1 = i64::from_le_bytes(pkt[HDR..HDR + 8].try_into().unwrap());
                let t2 = i64::from_le_bytes(pkt[HDR + 8..HDR + 16].try_into().unwrap());
                let t3 = sh.clock.local_ns();
                let rtt = (t3 - t1) as f32 / 1e6;
                p.rtt_ms = Some(p.rtt_ms.map(|r| r + (rtt - r) * 0.3).unwrap_or(rtt));
                if is_host_src && !n.is_host {
                    if let Some(off) = n.sync.add(t1, t2, t3) {
                        sh.clock.set_offset_ns(off);
                        if n.sync.count() >= 5 {
                            sh.clock.synced.store(true, Ordering::Relaxed);
                        }
                    }
                }
            }
            Pt::Audio if len >= HDR + 17 => {
                let ts = i64::from_le_bytes(pkt[HDR + 4..HDR + 12].try_into().unwrap());
                let codec = pkt[HDR + 12];
                let la = u16::from_le_bytes([pkt[HDR + 15], pkt[HDR + 16]]) as u32;
                sh.slots[p.slot].offset48.store(la, Ordering::Relaxed);
                let data = &pkt[HDR + 17..];
                let frame = ts.div_euclid(FRAME as i64);
                let ring = match sh.slots[p.slot].ring.load_full() {
                    Some(r) => r,
                    None => continue,
                };
                p.codec = codec;
                if let Some(l) = p.last_frame {
                    if frame <= l {
                        continue; // late or duplicate: the decoder has moved on
                    }
                    let gap = frame - l - 1;
                    if gap > 0 && gap <= 4 && codec == 0 {
                        for k in 1..=gap {
                            if p.dec.conceal(&mut pcm) {
                                ring.write(l + k, &pcm);
                            }
                        }
                    }
                    if gap > 0 && gap < 200 {
                        p.lost += gap as u64;
                    }
                }
                if p.dec.decode(codec, data, &mut pcm) {
                    ring.write(frame, &pcm);
                }
                p.last_frame = Some(frame);
                p.recv += 1;
                // how long after the end of the frame it arrived (48 kHz samples)
                let late = ns_to_48(sh.clock.shared_ns()) - (ts + FRAME as i64) as f64 + la as f64;
                p.late.push_back((now, late));
                while p.late.front().map(|x| now.duration_since(x.0) > Duration::from_secs(3)).unwrap_or(false) {
                    p.late.pop_front();
                }
            }
            _ => {}
        }
    }
}

/// Works out how far behind to play each player.
///  * live: just enough to cover the network, its jitter and our output buffer
///  * loop sync: exactly K bars, so their beat lands on ours
fn update_delays(sh: &Shared, n: &mut Net) {
    let sess = sh.sess.load();
    let out_lat = ns_to_48(sh.out_lat_ns.load(Ordering::Relaxed));
    let rate = sh.rate_out.load(Ordering::Relaxed).max(1) as f64;
    let buf48 = sh.out_buf.load(Ordering::Relaxed) as f64 * 48_000.0 / rate;
    for p in n.peers.values_mut() {
        let late = p.late.iter().map(|x| x.1).fold(f64::NAN, f64::max);
        if !late.is_finite() {
            continue;
        }
        let need = late.max(0.0) + out_lat + buf48 + 96.0;
        let d = match sess.mode {
            Mode::Live => {
                p.bars = 0;
                need
            }
            Mode::Sync => {
                let bar = sess.bar_48();
                let unit = sess.sync_bars.max(1);
                let mut k = unit;
                while (k as f64) * bar < need && k < 64 {
                    k += unit;
                }
                // don't flip between K values on small jitter: keep the current K if it still works
                if p.bars >= unit && p.bars % unit == 0 && (p.bars as f64) * bar >= need && p.bars < k + unit {
                    k = p.bars;
                }
                p.bars = k;
                k as f64 * bar
            }
        };
        p.delay48 = d;
        f64_store(&sh.slots[p.slot].delay48, d);
    }
}

fn tick_loop(sh: Arc<Shared>, net: Arc<Mutex<Option<Net>>>, g_gen: Arc<AtomicU64>, gen: u64) {
    let mut last_stun = Instant::now();
    loop {
        std::thread::sleep(Duration::from_millis(20));
        if g_gen.load(Ordering::SeqCst) != gen {
            return;
        }
        let mut g = net.lock();
        let n = match g.as_mut() {
            Some(n) if n.gen == gen => n,
            _ => return,
        };
        let now = Instant::now();
        if n.public.is_none() && now.duration_since(last_stun) > Duration::from_secs(3) {
            last_stun = now;
            let req = net::stun_request(n.txn);
            for s in net::STUN_SERVERS {
                if let Some(a) = net::resolve(s) {
                    let _ = n.sock.send_to(&req, a);
                }
            }
        }
        let host_direct = n.peers.get(&n.host_id).map(|h| h.state == PeerState::Direct).unwrap_or(false);
        let mut hb = [0u8; HDR];
        let mut pb = [0u8; HDR + 8];
        let ids: Vec<u32> = n.peers.keys().copied().collect();
        for id in ids {
            let (is_host, my_id, token, host_id) = (n.is_host, n.my_id, n.token, n.host_id);
            let host_addr = n.peers.get(&host_id).and_then(|h| h.direct);
            let p = n.peers.get_mut(&id).unwrap();
            if p.state == PeerState::Left {
                continue;
            }
            // direct path quiet for 3 s: fall back
            if p.state == PeerState::Direct && p.last_direct.map(|t| now.duration_since(t) > Duration::from_secs(3)).unwrap_or(true) {
                p.state = PeerState::Punching;
                p.added = now;
            }
            let punching = p.state != PeerState::Direct;
            let age = now.duration_since(p.added);
            if punching && age > Duration::from_secs(4) {
                p.state = if !is_host && host_direct && id != host_id { PeerState::Relay } else { PeerState::Lost };
            }
            // hello: fast while punching, keepalive once a second after
            let every = if punching && age < Duration::from_secs(15) { 50 } else if punching { 500 } else { 1000 };
            if now.duration_since(p.last_hello) >= Duration::from_millis(every) {
                p.last_hello = now;
                write_header(&mut hb, Pt::Hello, token, my_id, id);
                if let Some(a) = p.direct.filter(|_| !punching) {
                    let _ = n.sock.send_to(&hb, a);
                } else {
                    for a in &p.cands {
                        let _ = n.sock.send_to(&hb, a);
                    }
                }
            }
            // ping: clock sync with the host 4x a second, round trip to others once a second
            let pe = if id == host_id && !is_host { 250 } else { 1000 };
            if now.duration_since(p.last_ping) >= Duration::from_millis(pe) {
                p.last_ping = now;
                write_header(&mut pb, Pt::Ping, token, my_id, id);
                pb[HDR..HDR + 8].copy_from_slice(&sh.clock.local_ns().to_le_bytes());
                let to = if p.state == PeerState::Direct { p.direct } else if p.state == PeerState::Relay { host_addr } else { None };
                if let Some(a) = to {
                    let _ = n.sock.send_to(&pb, a);
                }
            }
        }
        update_delays(&sh, n);
    }
}
