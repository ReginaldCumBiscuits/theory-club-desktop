//! Desktop shell: the Theory Club web app plus the native jam engine,
//! exposed to the page as Tauri commands.

use std::sync::{Arc, Mutex};
use tauri::State;
use tc_engine::audio::{AudioCfg, AudioInfo, DevList, HostInfo};
use tc_engine::band::{LocalMix, Session};
use tc_engine::codec::Codec;
use tc_engine::{Engine, NetInfo};

struct Eng(Arc<Engine>);

/// An update that has been downloaded and verified, waiting for a restart.
#[derive(Default)]
struct Pending(Mutex<Option<(tauri_plugin_updater::Update, Vec<u8>)>>);

#[derive(serde::Serialize)]
struct UpdateInfo {
    current: String,
    version: String,
    notes: Option<String>,
}

/// Checks for a newer version and downloads it in the background.
/// Returns the new version once it's ready to install, or None if up to date.
#[tauri::command]
async fn update_check(app: tauri::AppHandle, pending: State<'_, Pending>) -> Result<Option<UpdateInfo>, String> {
    use tauri_plugin_updater::UpdaterExt;
    if let Some((u, _)) = pending.0.lock().unwrap().as_ref() {
        return Ok(Some(UpdateInfo { current: u.current_version.clone(), version: u.version.clone(), notes: u.body.clone() }));
    }
    #[allow(unused_mut)]
    let mut b = app.updater_builder();
    #[cfg(debug_assertions)]
    if let Ok(u) = std::env::var("TC_UPDATE_URL") {
        b = b.endpoints(vec![u.parse().map_err(|e: url::ParseError| e.to_string())?]).map_err(|e| e.to_string())?;
    }
    let up = b.build().map_err(|e| e.to_string())?;
    let Some(u) = up.check().await.map_err(|e| e.to_string())? else { return Ok(None) };
    // download (the signature is verified here; a tampered file is rejected)
    let bytes = u.download(|_, _| {}, || {}).await.map_err(|e| e.to_string())?;
    let info = UpdateInfo { current: u.current_version.clone(), version: u.version.clone(), notes: u.body.clone() };
    *pending.0.lock().unwrap() = Some((u, bytes));
    Ok(Some(info))
}

/// Installs the downloaded update and restarts the app.
#[tauri::command]
fn update_install(app: tauri::AppHandle, pending: State<'_, Pending>, eng: State<'_, Eng>) -> Result<(), String> {
    let Some((u, bytes)) = pending.0.lock().unwrap().take() else { return Err("No update is ready".into()) };
    eng.0.net_close();
    eng.0.stop_audio();
    u.install(bytes).map_err(|e| e.to_string())?;
    app.restart();
}

#[tauri::command]
fn app_version(app: tauri::AppHandle) -> String {
    app.package_info().version.to_string()
}

#[tauri::command]
fn engine_hosts(e: State<Eng>) -> Vec<HostInfo> {
    e.0.hosts()
}

#[tauri::command]
async fn engine_devices(e: State<'_, Eng>, host: Option<String>) -> Result<DevList, String> {
    let eng = e.0.clone();
    tauri::async_runtime::spawn_blocking(move || eng.devices(host.as_deref())).await.map_err(|x| x.to_string())?
}

#[tauri::command]
async fn engine_start(e: State<'_, Eng>, cfg: AudioCfg) -> Result<AudioInfo, String> {
    let eng = e.0.clone();
    tauri::async_runtime::spawn_blocking(move || eng.start_audio(cfg)).await.map_err(|x| x.to_string())?
}

#[tauri::command]
fn engine_stop(e: State<Eng>) {
    e.0.stop_audio()
}

#[tauri::command]
fn engine_set_local(e: State<Eng>, monitor: Option<bool>, input_gain: Option<f32>, monitor_gain: Option<f32>) {
    e.0.set_local(monitor, input_gain, monitor_gain)
}

#[tauri::command]
fn engine_set_mix(e: State<Eng>, mix: LocalMix) {
    e.0.set_mix(mix)
}

#[tauri::command]
fn engine_set_session(e: State<Eng>, sess: Session) {
    e.0.set_session(sess)
}

#[tauri::command]
fn engine_set_codec(e: State<Eng>, codec: Codec, bitrate: Option<i32>) -> Result<(), String> {
    e.0.set_codec(codec, bitrate.unwrap_or(128_000))
}

#[tauri::command]
fn engine_set_peer(e: State<Eng>, key: String, gain: Option<f32>, mute: Option<bool>) {
    e.0.set_peer(&key, gain, mute)
}

#[tauri::command]
async fn net_open(e: State<'_, Eng>, room: String, me: String, host: String, port: Option<u16>) -> Result<NetInfo, String> {
    let eng = e.0.clone();
    tauri::async_runtime::spawn_blocking(move || eng.net_open(&room, &me, &host, port.unwrap_or(0))).await.map_err(|x| x.to_string())?
}

#[tauri::command]
fn net_peer(e: State<Eng>, key: String, name: String, cands: Vec<String>) -> Result<(), String> {
    e.0.net_peer(&key, &name, &cands)
}

#[tauri::command]
fn net_drop(e: State<Eng>, key: String) {
    e.0.net_drop(&key)
}

#[tauri::command]
fn net_close(e: State<Eng>) {
    e.0.net_close()
}

/// Starts recording the jam: one WAV per player in Music/Theory Club jams/<folder>.
#[tauri::command]
fn rec_start(app: tauri::AppHandle, e: State<Eng>, folder: String, me: String) -> Result<String, String> {
    use tauri::Manager;
    let base = app.path().audio_dir().or_else(|_| app.path().document_dir()).or_else(|_| app.path().home_dir()).map_err(|x| x.to_string())?;
    let safe: String = folder.chars().map(|c| if c.is_alphanumeric() || " -_".contains(c) { c } else { '-' }).collect();
    let dir = base.join("Theory Club jams").join(if safe.trim().is_empty() { "Jam".to_string() } else { safe.trim().to_string() });
    e.0.rec_start(&dir, &me)?;
    Ok(dir.to_string_lossy().into_owned())
}

#[tauri::command]
fn rec_stop(e: State<Eng>) -> Result<tc_engine::rec::RecResult, String> {
    e.0.rec_stop()
}

/// Shows a recording folder in Finder / Explorer.
#[tauri::command]
fn rec_open(path: String) -> Result<(), String> {
    let p = std::path::PathBuf::from(&path);
    if !p.exists() || !p.to_string_lossy().contains("Theory Club jams") {
        return Err("That folder isn't there any more".into());
    }
    #[cfg(target_os = "macos")]
    let r = std::process::Command::new("open").arg(&p).spawn();
    #[cfg(target_os = "windows")]
    let r = std::process::Command::new("explorer").arg(&p).spawn();
    #[cfg(all(not(target_os = "macos"), not(target_os = "windows")))]
    let r = std::process::Command::new("xdg-open").arg(&p).spawn();
    r.map(|_| ()).map_err(|x| x.to_string())
}

#[tauri::command]
fn shared_ms(e: State<Eng>) -> f64 {
    e.0.shared_ms()
}

#[tauri::command]
fn stats(e: State<Eng>) -> serde_json::Value {
    e.0.stats()
}

/// Development self-test: `TC_SELFTEST=1` runs every command from the page once and exits.
#[tauri::command]
fn selftest_report(text: String) {
    println!("SELFTEST {}", text);
    std::process::exit(if text.contains("\"fail\":0") { 0 } else { 1 });
}

#[tauri::command]
fn selftest_log(text: String) {
    eprintln!("selftest: {}", text);
}

const SELFTEST_JS: &str = r#"
window.onerror = (m) => window.__TAURI__ && window.__TAURI__.core.invoke('selftest_log', {text: 'error ' + m});
(async () => { try {
  const I = window.__TAURI__.core.invoke, out = {pass: 0, fail: 0, notes: []};
  const t = async (name, cmd, args, expectErr) => {
    try { const r = await I(cmd, args || {}); if (expectErr) { out.fail++; out.notes.push(name + ': expected an error'); } else { out.pass++; out.notes.push(name + ': ok ' + JSON.stringify(r).slice(0, 120)); } return r; }
    catch (e) { if (expectErr) { out.pass++; out.notes.push(name + ': error as expected (' + String(e).slice(0, 80) + ')'); } else { out.fail++; out.notes.push(name + ': ' + e); } }
  };
  await new Promise(r => setTimeout(r, 1500));
  const tc = window.__tc;
  await t('hosts', 'engine_hosts');
  await t('devices', 'engine_devices', {host: null});
  await t('local', 'engine_set_local', {monitor: false, inputGain: 1.2, monitorGain: 1});
  await t('mix', 'engine_set_mix', {mix: {click: true, drums: true, bass: false, click_vol: .6, band_vol: .7}});
  const sess = tc.natSess({mode: 'sync', bars: 'cycle', bpm: 100, beats: 4, style: 'rock', key: 'A', playing: true, t0: 5000});
  out.notes.push('sess ' + JSON.stringify(sess).slice(0, 160));
  await t('session', 'engine_set_session', {sess});
  await t('codec', 'engine_set_codec', {codec: 'pcm', bitrate: 128000});
  const ni = await t('net_open', 'net_open', {room: 'TEST1', me: 'tcjam-test1', host: 'tcjam-test1', port: 0});
  if (!ni || !ni.cands || !ni.cands.length) { out.fail++; out.notes.push('no candidates'); }
  await t('net_peer', 'net_peer', {key: 'guest-x', name: 'X', cands: ['127.0.0.1:9']});
  await t('set_peer', 'engine_set_peer', {key: 'guest-x', gain: .5, mute: true});
  const st = await t('stats', 'stats');
  if (!st || !Array.isArray(st.peers) || st.peers.length !== 1) { out.fail++; out.notes.push('stats peers wrong'); }
  await t('shared_ms', 'shared_ms');
  await t('net_drop', 'net_drop', {key: 'guest-x'});
  await t('net_close', 'net_close');
  const dl = await I('engine_devices', {host: null});
  const nin = dl.inputs.find(d => /null/.test(d.id)), nout = dl.outputs.find(d => /null/.test(d.id));
  if (nin && nout) {
    const info = await t('start (virtual null card)', 'engine_start', {cfg: {host: null, input: nin.id, output: nout.id, input_channel: 0, buffer: 128, rate: 0}});
    out.notes.push('audio ' + JSON.stringify(info));
    await I('engine_set_session', {sess: tc.natSess({mode: 'sync', bars: 1, bpm: 120, beats: 4, style: 'rock', key: 'A', playing: true, t0: (await I('shared_ms')) + 300})});
    await new Promise(r => setTimeout(r, 1500));
    const recDir = await t('rec_start', 'rec_start', {folder: 'selftest', me: 'Me'});
    await new Promise(r => setTimeout(r, 1500));
    const rr = await t('rec_stop', 'rec_stop');
    if (!rr || !rr.files || rr.files.length < 2 || !(rr.seconds > 0.3)) { out.fail++; out.notes.push('recording empty ' + JSON.stringify(rr)); } else out.notes.push('recorded ' + rr.seconds.toFixed(2) + ' s into ' + rr.dir);
    const s2 = await I('stats');
    if (!s2.audio || !(s2.out_level > 0.01)) { out.fail++; out.notes.push('audio not running ' + JSON.stringify(s2).slice(0, 200)); } else { out.pass++; out.notes.push('band playing, out level ' + s2.out_level.toFixed(2) + ', buffer ' + s2.buffer + ' @ ' + s2.rate); }
  }
  await t('stop', 'engine_stop');
  if (window.__updExpect) {
    const u = await t('update_check', 'update_check', {}, window.__updExpect === 'error');
    if (window.__updExpect !== 'error') { if (!u || u.version !== window.__updExpect) { out.fail++; out.notes.push('update not offered: ' + JSON.stringify(u)); } else out.notes.push('update ready ' + u.current + ' -> ' + u.version); }
  }
  await t('app_version', 'app_version');
  const page = !!(document.querySelector('#main') && window.__tc && window.__tc.JO);
  if (!page) { out.fail++; out.notes.push('page did not load'); } else out.pass++;
  await I('selftest_report', {text: JSON.stringify(out)});
} catch (e) { window.__TAURI__.core.invoke('selftest_log', {text: 'crash ' + e + ' ' + (e && e.stack)}); } })();
"#;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let engine = Engine::new();
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .manage(Eng(engine))
        .manage(Pending::default())
        .invoke_handler(tauri::generate_handler![
            engine_hosts,
            engine_devices,
            engine_start,
            engine_stop,
            engine_set_local,
            engine_set_mix,
            engine_set_session,
            engine_set_codec,
            engine_set_peer,
            net_open,
            net_peer,
            net_drop,
            net_close,
            shared_ms,
            stats,
            rec_start,
            rec_stop,
            rec_open,
            update_check,
            update_install,
            app_version,
            selftest_report,
            selftest_log
        ])
        .setup(|app| {
            if std::env::var("TC_SELFTEST").is_ok() {
                use tauri::Manager;
                if let Some(w) = app.get_webview_window("main") {
                    std::thread::spawn(move || {
                        std::thread::sleep(std::time::Duration::from_secs(3));
                        if let Ok(x) = std::env::var("TC_SELFTEST_UPDATE") {
                            let _ = w.eval(format!("window.__updExpect = {:?};", x));
                        }
                        let r = w.eval(SELFTEST_JS);
                        eprintln!("selftest: started ({})", r.is_ok());
                    });
                }
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running Theory Club");
}
