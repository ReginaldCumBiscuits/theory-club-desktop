//! Peer-to-peer UDP transport.
//!
//! * Every player opens one UDP socket and learns its public address from a
//!   STUN server. Addresses are swapped through the room's signalling (the
//!   app's existing room code system).
//! * Players then "punch" towards each other's addresses. When a direct path
//!   opens, audio flows player to player with nothing in between.
//! * If two players can't reach each other directly but both reach the host,
//!   the host forwards their packets (a relay, a few ms slower).
//! * Guests ping the host 4x a second to lock their clock to it.

use std::net::{Ipv4Addr, SocketAddr, ToSocketAddrs, UdpSocket};

pub const MAGIC: [u8; 2] = *b"TC";
pub const VER: u8 = 1;
pub const HDR: usize = 16;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
#[repr(u8)]
pub enum Pt {
    Hello = 1,
    Audio = 3,
    Ping = 4,
    Pong = 5,
    Bye = 6,
}

impl Pt {
    pub fn from(b: u8) -> Option<Pt> {
        Some(match b {
            1 => Pt::Hello,
            3 => Pt::Audio,
            4 => Pt::Ping,
            5 => Pt::Pong,
            6 => Pt::Bye,
            _ => return None,
        })
    }
}

pub struct Header {
    pub pt: Pt,
    pub token: u32,
    pub src: u32,
    pub dst: u32,
}

pub fn write_header(buf: &mut [u8], pt: Pt, token: u32, src: u32, dst: u32) {
    buf[0..2].copy_from_slice(&MAGIC);
    buf[2] = VER;
    buf[3] = pt as u8;
    buf[4..8].copy_from_slice(&token.to_le_bytes());
    buf[8..12].copy_from_slice(&src.to_le_bytes());
    buf[12..16].copy_from_slice(&dst.to_le_bytes());
}

pub fn read_header(buf: &[u8]) -> Option<Header> {
    if buf.len() < HDR || buf[0..2] != MAGIC || buf[2] != VER {
        return None;
    }
    Some(Header {
        pt: Pt::from(buf[3])?,
        token: u32::from_le_bytes(buf[4..8].try_into().ok()?),
        src: u32::from_le_bytes(buf[8..12].try_into().ok()?),
        dst: u32::from_le_bytes(buf[12..16].try_into().ok()?),
    })
}

/// Stable 32-bit id from a string (room code, player id). FNV-1a.
pub fn hash32(s: &str) -> u32 {
    let mut h: u32 = 0x811c_9dc5;
    for b in s.bytes() {
        h ^= b as u32;
        h = h.wrapping_mul(0x0100_0193);
    }
    if h == 0 {
        1
    } else {
        h
    }
}

// ---- STUN (RFC 5389 binding request, just enough to learn our public address)

pub const STUN_SERVERS: [&str; 3] = ["stun.l.google.com:19302", "stun1.l.google.com:19302", "stun.cloudflare.com:3478"];
const STUN_MAGIC: u32 = 0x2112_A442;

pub fn stun_request(txn: [u8; 12]) -> [u8; 20] {
    let mut b = [0u8; 20];
    b[0..2].copy_from_slice(&0x0001u16.to_be_bytes());
    b[2..4].copy_from_slice(&0u16.to_be_bytes());
    b[4..8].copy_from_slice(&STUN_MAGIC.to_be_bytes());
    b[8..20].copy_from_slice(&txn);
    b
}

pub fn is_stun(b: &[u8]) -> bool {
    b.len() >= 20 && b[0] & 0xC0 == 0 && u32::from_be_bytes([b[4], b[5], b[6], b[7]]) == STUN_MAGIC
}

/// Parses a binding success response and returns the mapped address.
pub fn stun_parse(b: &[u8], txn: &[u8; 12]) -> Option<SocketAddr> {
    if !is_stun(b) || u16::from_be_bytes([b[0], b[1]]) != 0x0101 || &b[8..20] != txn {
        return None;
    }
    let len = u16::from_be_bytes([b[2], b[3]]) as usize;
    let mut i = 20;
    let end = (20 + len).min(b.len());
    let mut plain = None;
    while i + 4 <= end {
        let t = u16::from_be_bytes([b[i], b[i + 1]]);
        let l = u16::from_be_bytes([b[i + 2], b[i + 3]]) as usize;
        let v = &b[i + 4..(i + 4 + l).min(end)];
        if v.len() >= 8 && v[1] == 1 {
            let port = u16::from_be_bytes([v[2], v[3]]);
            let ip = [v[4], v[5], v[6], v[7]];
            if t == 0x0020 {
                let xp = port ^ (STUN_MAGIC >> 16) as u16;
                let m = STUN_MAGIC.to_be_bytes();
                let xip = Ipv4Addr::new(ip[0] ^ m[0], ip[1] ^ m[1], ip[2] ^ m[2], ip[3] ^ m[3]);
                return Some(SocketAddr::new(xip.into(), xp));
            } else if t == 0x0001 {
                plain = Some(SocketAddr::new(Ipv4Addr::new(ip[0], ip[1], ip[2], ip[3]).into(), port));
            }
        }
        i += 4 + ((l + 3) & !3);
    }
    plain
}

/// This machine's address on the local network (no packets are sent).
pub fn lan_ip() -> Option<std::net::IpAddr> {
    let s = UdpSocket::bind("0.0.0.0:0").ok()?;
    s.connect("8.8.8.8:80").ok()?;
    s.local_addr().ok().map(|a| a.ip())
}

pub fn resolve(s: &str) -> Option<SocketAddr> {
    s.to_socket_addrs().ok()?.find(|a| a.is_ipv4())
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn header_round_trip() {
        let mut b = [0u8; 32];
        write_header(&mut b, Pt::Audio, 7, 99, 42);
        let h = read_header(&b).unwrap();
        assert_eq!((h.pt, h.token, h.src, h.dst), (Pt::Audio, 7, 99, 42));
    }
    #[test]
    fn parses_xor_mapped_address() {
        let txn = [1u8; 12];
        let mut b = vec![0u8; 32];
        b[0..2].copy_from_slice(&0x0101u16.to_be_bytes());
        b[2..4].copy_from_slice(&12u16.to_be_bytes());
        b[4..8].copy_from_slice(&STUN_MAGIC.to_be_bytes());
        b[8..20].copy_from_slice(&txn);
        b[20..22].copy_from_slice(&0x0020u16.to_be_bytes());
        b[22..24].copy_from_slice(&8u16.to_be_bytes());
        b[25] = 1;
        let port: u16 = 54321;
        b[26..28].copy_from_slice(&(port ^ 0x2112).to_be_bytes());
        let ip = [203u8, 0, 113, 9];
        let m = STUN_MAGIC.to_be_bytes();
        for k in 0..4 {
            b[28 + k] = ip[k] ^ m[k];
        }
        assert_eq!(stun_parse(&b, &txn), Some("203.0.113.9:54321".parse().unwrap()));
    }
}
