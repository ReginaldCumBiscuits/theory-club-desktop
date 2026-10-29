# Theory Club desktop

The Theory Club app for Windows and Mac, with a native audio engine for
online jamming:

* **Pro audio drivers.** ASIO and WASAPI on Windows, CoreAudio on Mac. Pick
  your interface, input channel and buffer size (down to 32 samples).
* **Direct peer-to-peer audio.** Each player's sound goes straight to the
  others over UDP. There's no media server. If two players can't reach each
  other, the host relays between them automatically.
* **Shared clock.** Every player locks to the host's clock (to within a
  fraction of a millisecond on a normal connection). The click and backing
  band are rendered inside the audio callback on every machine at the same
  moment.
* **Timestamped audio.** Every 5 ms packet carries the moment it was
  captured. In loop sync, a player's note is played exactly a whole number of
  bars after they played it, so it lands on your beat at any distance. The
  delay is measured continuously from real packet arrival times and never
  needs calibration beeps.
* **Live mode** for nearby players. You hear them as soon as the network
  allows, with an adaptive buffer that grows on jitter and shrinks back
  smoothly.
* **Codecs.** Opus in low-delay mode at 128 kbit/s, or uncompressed 16-bit
  for fast or local networks.

The interface is the same Theory Club web app (`web/index.html`). When it runs
inside the desktop app, Jam online switches to the native engine. Everything
else in the app works as it does on the website.

## Download

Every push of a version tag (`v1.0.0` and so on), or a manual run of the
**Build desktop apps** workflow, builds:

| File | For |
| --- | --- |
| `Theory Club_x.y.z_x64_en-US.msi` / `..._x64-setup.exe` | Windows 10/11, with ASIO |
| `Theory Club_x.y.z_aarch64.dmg` | Macs with Apple silicon |
| `Theory Club_x.y.z_x64.dmg` | Intel Macs |

Get them from the run's **Artifacts**, or from the release when you push a tag.

**First launch on a Mac:** the app is ad-hoc signed, not notarised. Right-click
the app in Applications, choose **Open**, then **Open** again. If macOS says the
app is damaged, run `xattr -cr "/Applications/Theory Club.app"` once.

**First launch on Windows:** SmartScreen may warn about an unknown publisher.
Choose **More info → Run anyway**. When you first join a room, allow Theory
Club through Windows Firewall (private and public networks), or players can't
reach you directly.

## Build it yourself

You need Rust (stable), Node 20 and CMake.

* **Windows:** also LLVM, for the ASIO bindings. Set `LIBCLANG_PATH` to its
  `bin` folder. The ASIO SDK downloads automatically during the build.
* **Mac:** also the Xcode command line tools.
* **Linux:** also `libwebkit2gtk-4.1-dev`, `libasound2-dev` and
  `librsvg2-dev`.

```sh
npm install -g @tauri-apps/cli@2
tauri dev                          # run with live reload
tauri build                        # Mac and Linux
tauri build --features asio        # Windows with ASIO
```

To update the app's pages from a newer Theory Club web build:

```sh
scripts/sync-web.sh path/to/theory-club.html
```

### Tests

```sh
cargo test -p tc-engine --release
```

* `tests/loopback.rs` runs three engines over real UDP. It checks hole
  punching, clock lock, timestamped delivery and the host relay.
* `tests/virtual_card.rs` drives virtual sound cards in real time with
  different input and output latencies. It checks that a note played on the
  beat comes out exactly one bar later on the other side. It typically lands
  within 0.2 ms with both codecs.

To check the whole app, run `TC_SELFTEST=1` with the built app. It calls every
engine command from the page and exits with a pass/fail summary. On Linux CI,
add `xvfb-run` and a null sound card.

## How a jam connects

1. The host starts a room in Jam online. The 5-letter code and invite link
   work as they do on the website, using the app's existing room system.
2. Every player's engine opens a UDP port and asks a STUN server for its
   public address. Players swap addresses through the room.
3. Each pair sends packets towards each other ("hole punching"). Most home
   routers let this through within a second.
4. If a pair can't connect directly after 4 seconds, their audio goes through
   the host instead.
5. Guests ping the host four times a second. The clock offset comes from the
   fastest round trips, so it stays accurate when the network is busy.

Desktop rooms are for desktop players: up to 8 per room. Website players use
browser rooms, which hold up to 4.

### Strict networks

Some networks block direct UDP: some university, work and mobile hotspots, and
"symmetric" NATs. Players there connect through the host. If the host is
behind one too, forward a UDP port on the host's router and set it under
**Jam online → Advanced**.

## Plugins

The app takes audio from your interface. To play through amp plugins:

* **Mac:** run the plugins in your DAW or a standalone amp sim and send its
  output to BlackHole 2ch. Pick BlackHole as the input in Theory Club. Several
  apps can share one interface on a Mac.
* **Windows:** ASIO drivers usually allow one program at a time. Either host
  the plugins in Voicemeeter and pick its ASIO driver in Theory Club, or send
  your plugin host to VB-Cable and pick WASAPI → CABLE Output (a few ms
  slower).

## ASIO licensing

ASIO is a Steinberg technology. The SDK is free, but anyone who *distributes*
an ASIO-enabled build must accept Steinberg's ASIO licence agreement
(<https://www.steinberg.net/developers/>). Builds for your own use don't need
anything extra.

## Layout

```
engine/       Rust jam engine (no UI): audio I/O, codec, network, clock, band
  src/audio.rs   cpal streams, timestamping, playback-time mixing, monitoring
  src/net.rs     packet format, STUN, helpers
  src/lib.rs     Engine API, hole punching, relay, clock sync, delay control
  src/ring.rs    lock-free timestamped receive buffer
  src/band.rs    click, drums and bass synthesised in the audio callback
src-tauri/    desktop shell (Tauri 2) exposing the engine to the page
web/          the Theory Club web app
```
