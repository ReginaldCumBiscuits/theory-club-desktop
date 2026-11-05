//! AI stem separation for the song transcriber (desktop app only).
//!
//! The separation models (MDX-Net, KUIELab, MIT licence) are about 119 MB, so they are downloaded the first
//! time someone turns the feature on, checked against known SHA-256 hashes and kept in the app's data folder.
//! ONNX Runtime ships inside the app (see scripts/fetch-onnxruntime.sh) and is loaded on first use.
use crate::{notes, sepcore};
use sha2::{Digest, Sha256};
use std::io::{Read, Write};
use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::OnceLock;
use tauri::ipc::{InvokeBody, Request, Response};
use tauri::{AppHandle, Emitter, Manager, State};

/// SCNet (small), exported to ONNX for this app and published with its releases. One model gives all four parts.
const BASE: &str =
    "https://github.com/ReginaldCumBiscuits/theory-club-desktop/releases/download/ai-models-1/";
const MODEL_FILE: &str = "scnet_small.onnx";
const MODEL_BYTES: u64 = 48_175_620;
const MODEL_SHA: &str = "7f05258241fdeadb506f49f793501128ea3b5d0f4104bf7117973f48040241ca";
/// The four MDX-Net models earlier versions downloaded; removed once the new one is in.
const OLD_MODELS: [&str; 4] = [
    "kuielab_a_vocals.onnx",
    "kuielab_a_bass.onnx",
    "kuielab_a_drums.onnx",
    "kuielab_a_other.onnx",
];

/// The last song separated, so asking for another part of it is instant: (fingerprint, the four parts).
type Stems = Vec<(Vec<f32>, Vec<f32>)>;
static LAST: std::sync::Mutex<Option<(u64, Stems)>> = std::sync::Mutex::new(None);

fn fingerprint(x: &[f32]) -> u64 {
    let mut h: u64 = 0xcbf29ce484222325 ^ x.len() as u64;
    for v in x.iter().step_by(97) {
        h = (h ^ v.to_bits() as u64).wrapping_mul(0x100000001b3);
    }
    h
}

/// Only one download or separation at a time.
#[derive(Default)]
pub struct Ai(AtomicBool);

struct Busy<'a>(&'a AtomicBool);
impl<'a> Busy<'a> {
    fn take(f: &'a AtomicBool) -> Result<Self, String> {
        if f.swap(true, Ordering::SeqCst) {
            return Err("The AI separator is already busy. Wait for it to finish.".into());
        }
        Ok(Busy(f))
    }
}
impl Drop for Busy<'_> {
    fn drop(&mut self) {
        self.0.store(false, Ordering::SeqCst);
    }
}

fn model_dir(app: &AppHandle) -> Result<PathBuf, String> {
    Ok(app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?
        .join("ai-separator"))
}

fn model_path(app: &AppHandle) -> Result<PathBuf, String> {
    Ok(model_dir(app)?.join(MODEL_FILE))
}

fn lib_name() -> &'static str {
    if cfg!(target_os = "windows") {
        "onnxruntime.dll"
    } else if cfg!(target_os = "macos") {
        "libonnxruntime.dylib"
    } else {
        "libonnxruntime.so"
    }
}

/// Where the bundled ONNX Runtime library is (TC_ORT overrides it, for development).
fn runtime_path(app: &AppHandle) -> Option<PathBuf> {
    if let Ok(p) = std::env::var("TC_ORT") {
        return Some(PathBuf::from(p));
    }
    let p = app.path().resource_dir().ok()?.join("ort").join(lib_name());
    p.exists().then_some(p)
}

static ORT: OnceLock<Result<(), String>> = OnceLock::new();

/// On Windows the DirectML build of ONNX Runtime needs DirectML.dll from the same folder.
#[cfg(target_os = "windows")]
fn add_dll_dir(dir: &std::path::Path) {
    use std::os::windows::ffi::OsStrExt;
    let w: Vec<u16> = dir
        .as_os_str()
        .encode_wide()
        .chain(std::iter::once(0))
        .collect();
    unsafe {
        windows_sys::Win32::System::LibraryLoader::SetDllDirectoryW(w.as_ptr());
    }
}

/// A model session, on the graphics card when asked and available (DirectML on Windows, Core ML on
/// macOS), otherwise on the processor.
pub fn build_session(
    path: &std::path::Path,
    gpu: bool,
    cache: Option<&std::path::Path>,
) -> Result<ort::session::Session, String> {
    let threads = std::thread::available_parallelism()
        .map(|x| x.get())
        .unwrap_or(4);
    #[allow(unused_mut)]
    let mut b = ort::session::Session::builder()
        .map_err(|e| e.to_string())?
        .with_intra_threads(threads)
        .map_err(|e| e.to_string())?;
    if gpu {
        #[cfg(target_os = "windows")]
        {
            b = b
                .with_memory_pattern(false)
                .and_then(|b| b.with_parallel_execution(false))
                .and_then(|b| {
                    b.with_execution_providers([
                        ort::execution_providers::DirectMLExecutionProvider::default()
                            .build()
                            .error_on_failure(),
                    ])
                })
                .map_err(|e| e.to_string())?;
        }
        #[cfg(target_os = "macos")]
        {
            let mut ep = ort::execution_providers::CoreMLExecutionProvider::default();
            if let Some(c) = cache {
                ep = ep.with_model_cache_dir(c.to_string_lossy());
            }
            b = b
                .with_execution_providers([ep.build().error_on_failure()])
                .map_err(|e| e.to_string())?;
        }
        #[cfg(not(any(target_os = "windows", target_os = "macos")))]
        {
            let _ = cache;
            return Err("no graphics card support on this system".into());
        }
    }
    b.commit_from_file(path).map_err(|e| e.to_string())
}

fn ort_init(app: &AppHandle) -> Result<(), String> {
    ORT.get_or_init(|| {
        let p = runtime_path(app).ok_or("This build of the app doesn't include the AI runtime.")?;
        #[cfg(target_os = "windows")]
        if let Some(d) = p.parent() {
            add_dll_dir(d);
        }
        ort::init_from(p.to_string_lossy().to_string())
            .commit()
            .map(|_| ())
            .map_err(|e| format!("The AI runtime couldn't start: {e}"))
    })
    .clone()
}

fn installed(app: &AppHandle) -> bool {
    model_path(app)
        .ok()
        .and_then(|f| std::fs::metadata(f).ok())
        .map(|m| m.len() == MODEL_BYTES)
        .unwrap_or(false)
}

#[derive(serde::Serialize)]
pub struct AiStatus {
    runtime: bool,
    installed: bool,
    download_mb: u32,
    busy: bool,
    /// The previous separator's models are still on disk (shown as an upgrade).
    old: bool,
}

/// Whether AI separation can run: the runtime is in this build and the models are downloaded.
#[tauri::command]
pub fn ai_status(app: AppHandle, ai: State<'_, Ai>) -> AiStatus {
    AiStatus {
        runtime: runtime_path(&app).is_some(),
        installed: installed(&app),
        download_mb: (MODEL_BYTES / 1_000_000) as u32,
        busy: ai.0.load(Ordering::SeqCst),
        old: model_dir(&app)
            .map(|d| OLD_MODELS.iter().any(|f| d.join(f).exists()))
            .unwrap_or(false),
    }
}

fn progress(app: &AppHandle, stage: &str, p: f32) {
    let _ = app.emit(
        "ai-progress",
        serde_json::json!({ "stage": stage, "p": p.clamp(0.0, 1.0) }),
    );
}

fn download(app: &AppHandle) -> Result<(), String> {
    let dir = model_dir(app)?;
    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let dest = model_path(app)?;
    if !std::fs::metadata(&dest)
        .map(|m| m.len() == MODEL_BYTES)
        .unwrap_or(false)
    {
        // TC_AI_BASE points the download somewhere else, for testing
        let base = std::env::var("TC_AI_BASE").unwrap_or_else(|_| BASE.to_string());
        let url = format!("{base}{MODEL_FILE}");
        let resp = ureq::get(&url)
            .call()
            .map_err(|e| format!("Couldn't download the AI separator: {e}"))?;
        let mut rd = resp.into_reader();
        let tmp = dest.with_extension("part");
        let mut f = std::fs::File::create(&tmp).map_err(|e| e.to_string())?;
        let mut h = Sha256::new();
        let mut buf = vec![0u8; 1 << 16];
        let mut got = 0u64;
        let mut last = 0u64;
        loop {
            let k = rd
                .read(&mut buf)
                .map_err(|e| format!("The download was interrupted: {e}"))?;
            if k == 0 {
                break;
            }
            f.write_all(&buf[..k]).map_err(|e| e.to_string())?;
            h.update(&buf[..k]);
            got += k as u64;
            if got - last > 1 << 20 {
                last = got;
                progress(app, "download", got as f32 / MODEL_BYTES as f32);
            }
        }
        drop(f);
        let hex: String = h.finalize().iter().map(|b| format!("{b:02x}")).collect();
        if got != MODEL_BYTES || hex != MODEL_SHA {
            let _ = std::fs::remove_file(&tmp);
            return Err("The AI separator didn't download correctly. Try again.".into());
        }
        std::fs::rename(&tmp, &dest).map_err(|e| e.to_string())?;
    }
    for old in OLD_MODELS {
        let _ = std::fs::remove_file(dir.join(old));
    }
    progress(app, "download", 1.0);
    Ok(())
}

/// Downloads the separation models (once).
#[tauri::command]
pub async fn ai_install(app: AppHandle) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || {
        let ai = app.state::<Ai>();
        let _b = Busy::take(&ai.0)?;
        download(&app)
    })
    .await
    .map_err(|e| e.to_string())?
}

/// Deletes the downloaded models to free the space.
#[tauri::command]
pub fn ai_remove(app: AppHandle, ai: State<'_, Ai>) -> Result<(), String> {
    let _b = Busy::take(&ai.0)?;
    if let Ok(mut g) = LAST.lock() {
        *g = None;
    }
    let d = model_dir(&app)?;
    if d.exists() {
        std::fs::remove_dir_all(d).map_err(|e| e.to_string())?;
    }
    Ok(())
}

/// Separates one part of a song with the AI model.
/// Body: the song as 32-bit floats at 44.1 kHz, all of the left channel then all of the right.
/// Header `x-part`: vocals, bass, drums or other.
/// Returns the part at 22.05 kHz in the same layout.
#[tauri::command]
pub async fn ai_separate(app: AppHandle, request: Request<'_>) -> Result<Response, String> {
    let part = request
        .headers()
        .get("x-part")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("")
        .to_string();
    let want_gpu = request.headers().get("x-gpu").and_then(|v| v.to_str().ok()) == Some("1");
    if !sepcore::PARTS.contains(&part.as_str()) {
        return Err("Unknown part".into());
    }
    let InvokeBody::Raw(bytes) = request.body() else {
        return Err("No audio was sent".into());
    };
    let data: Vec<f32> = bytes
        .chunks_exact(4)
        .map(|c| f32::from_le_bytes([c[0], c[1], c[2], c[3]]))
        .collect();
    tauri::async_runtime::spawn_blocking(move || {
        let ai = app.state::<Ai>();
        let _b = Busy::take(&ai.0)?;
        if !installed(&app) {
            return Err("The AI separator isn't downloaded yet.".into());
        }
        ort_init(&app)?;
        let n = data.len() / 2;
        if n < 44_100 {
            return Err("The song is too short.".into());
        }
        let (l, r) = data.split_at(n);
        let idx = sepcore::source_index(&part).ok_or("Unknown part")?;
        let key = fingerprint(&data);
        let cached = LAST.lock().ok().and_then(|g| {
            g.as_ref()
                .filter(|(k, _)| *k == key)
                .map(|(_, st)| st[idx].clone())
        });
        let (sl, sr) = if let Some(x) = cached {
            progress(&app, "separate", 1.0);
            x
        } else {
            let mp = model_path(&app)?;
            let cache = model_dir(&app)?.join("gpu-cache");
            let _ = std::fs::create_dir_all(&cache);
            let total = sepcore::chunks(n).max(1);
            let run = |gpu: bool| -> Result<Stems, String> {
                let mut s = build_session(&mp, gpu, Some(&cache))?;
                let mut k = 0;
                progress(&app, "separate", 0.0);
                let out = sepcore::separate(&mut s, l, r, || {
                    k += 1;
                    progress(&app, "separate", k as f32 / total as f32);
                })?;
                if out
                    .iter()
                    .any(|(a, _)| a.iter().take(44_100 * 4).any(|v| !v.is_finite()))
                {
                    return Err("the graphics card gave unusable results".into());
                }
                Ok(out)
            };
            // the graphics card first when it's on; the processor if that doesn't work
            let stems = if want_gpu {
                match run(true) {
                    Ok(x) => {
                        let _ = app.emit(
                            "ai-progress",
                            serde_json::json!({ "stage": "device", "gpu": true }),
                        );
                        x
                    }
                    Err(e) => {
                        eprintln!(
                            "AI separation on the graphics card failed, using the processor: {e}"
                        );
                        let _ = app.emit(
                            "ai-progress",
                            serde_json::json!({ "stage": "device", "gpu": false }),
                        );
                        run(false).map_err(|e| format!("The AI model couldn't run: {e}"))?
                    }
                }
            } else {
                run(false).map_err(|e| format!("The AI model couldn't run: {e}"))?
            };
            let one = stems[idx].clone();
            if let Ok(mut g) = LAST.lock() {
                *g = Some((key, stems));
            }
            one
        };
        let (hl, hr) = (sepcore::half(&sl), sepcore::half(&sr));
        let mut out = Vec::with_capacity((hl.len() + hr.len()) * 4);
        for v in hl.iter().chain(hr.iter()) {
            out.extend_from_slice(&v.to_le_bytes());
        }
        Ok(Response::new(out))
    })
    .await
    .map_err(|e| e.to_string())?
}

/// Finds the notes in a separated part with the built-in note model. Only needs ONNX Runtime, not the
/// separation download. Takes mono audio at 22,050 Hz; returns the note activations then the onset activations.
#[tauri::command]
pub async fn ai_notes(app: AppHandle, request: Request<'_>) -> Result<Response, String> {
    let InvokeBody::Raw(bytes) = request.body() else {
        return Err("No audio was sent".into());
    };
    let x: Vec<f32> = bytes
        .chunks_exact(4)
        .map(|c| f32::from_le_bytes([c[0], c[1], c[2], c[3]]))
        .collect();
    tauri::async_runtime::spawn_blocking(move || {
        ort_init(&app)?;
        let mut s = notes::session().map_err(|e| format!("The note model couldn't start: {e}"))?;
        let (n, o) = notes::infer(&mut s, &x, |k, t| {
            progress(&app, "notes", k as f32 / t as f32)
        })
        .map_err(|e| format!("The note model couldn't run: {e}"))?;
        let mut out = Vec::with_capacity((n.len() + o.len()) * 4);
        for v in n.iter().chain(o.iter()) {
            out.extend_from_slice(&v.to_le_bytes());
        }
        Ok(Response::new(out))
    })
    .await
    .map_err(|e| e.to_string())?
}

#[cfg(test)]
mod tests {
    /// Release builds run this with TC_ORT pointing at the bundled runtime, so a runtime that
    /// won't load, or a graphics-card path that crashes, stops the release.
    #[test]
    fn runtime_loads_and_runs() {
        let Ok(lib) = std::env::var("TC_ORT") else {
            eprintln!("TC_ORT not set: skipped");
            return;
        };
        #[cfg(target_os = "windows")]
        if let Some(d) = std::path::Path::new(&lib).parent() {
            super::add_dll_dir(d);
        }
        ort::init_from(lib)
            .commit()
            .expect("ONNX Runtime should load");
        let model = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../tests/tiny.onnx");
        for gpu in [true, false] {
            let mut s = match super::build_session(&model, gpu, None) {
                Ok(s) => s,
                Err(e) if gpu => {
                    eprintln!("graphics card not available here ({e}); the app falls back to the processor");
                    continue;
                }
                Err(e) => panic!("processor session failed: {e}"),
            };
            let x = ort::value::Tensor::from_array((
                [1usize, 4, 8, 8],
                vec![1f32; 256].into_boxed_slice(),
            ))
            .unwrap();
            let out = s.run(ort::inputs!["input" => x]).unwrap();
            let (_, y) = out["output"].try_extract_tensor::<f32>().unwrap();
            assert!(
                (y[0] - 2.0).abs() < 1e-4,
                "wrong result {} (gpu {gpu})",
                y[0]
            );
            eprintln!(
                "ok on {}",
                if gpu {
                    "the graphics card"
                } else {
                    "the processor"
                }
            );
        }
    }

    /// The note model finds an A3 (220 Hz) as key 57.
    #[test]
    fn note_model_finds_a_note() {
        let Ok(lib) = std::env::var("TC_ORT") else {
            eprintln!("TC_ORT not set: skipped");
            return;
        };
        #[cfg(target_os = "windows")]
        if let Some(d) = std::path::Path::new(&lib).parent() {
            super::add_dll_dir(d);
        }
        let _ = ort::init_from(lib).commit();
        let sr = crate::notes::SR as f32;
        let x: Vec<f32> = (0..(crate::notes::SR * 5))
            .map(|i| {
                let t = i as f32 / sr;
                0.3 * ((2.0 * std::f32::consts::PI * 220.0 * t).sin()
                    + 0.5 * (2.0 * std::f32::consts::PI * 440.0 * t).sin())
            })
            .collect();
        let mut s = crate::notes::session().expect("note model should load");
        let (n, o) = crate::notes::infer(&mut s, &x, |_, _| {}).expect("note model should run");
        let k = crate::notes::KEYS;
        assert_eq!(n.len(), o.len());
        assert_eq!(n.len() / k, crate::notes::frames_for(x.len()));
        let mid = (n.len() / k) / 2;
        let row = &n[mid * k..(mid + 1) * k];
        let best = row
            .iter()
            .enumerate()
            .max_by(|a, b| a.1.partial_cmp(b.1).unwrap())
            .unwrap()
            .0;
        assert_eq!(best + 21, 57, "expected A3, got key {}", best + 21);
        eprintln!("note model ok: A3 at {:.2}", row[best]);
    }

    /// Local check of the separator against the reference implementation: TC_SCNET is the model,
    /// TC_MIX a stereo mix as raw floats (left then right); the parts are written next to it.
    #[test]
    fn scnet_separates() {
        let (Ok(lib), Ok(model), Ok(mix)) = (
            std::env::var("TC_ORT"),
            std::env::var("TC_SCNET"),
            std::env::var("TC_MIX"),
        ) else {
            eprintln!("TC_ORT, TC_SCNET or TC_MIX not set: skipped");
            return;
        };
        let _ = ort::init_from(lib).commit();
        let b = std::fs::read(&mix).unwrap();
        let x: Vec<f32> = b
            .chunks_exact(4)
            .map(|c| f32::from_le_bytes([c[0], c[1], c[2], c[3]]))
            .collect();
        let (l, r) = x.split_at(x.len() / 2);
        let mut s = super::build_session(std::path::Path::new(&model), false, None).unwrap();
        let t = std::time::Instant::now();
        let out = crate::sepcore::separate(&mut s, l, r, || {}).unwrap();
        eprintln!(
            "separated {:.1}s of audio in {:.1}s",
            l.len() as f32 / 44100.0,
            t.elapsed().as_secs_f32()
        );
        for (i, name) in crate::sepcore::SOURCES.iter().enumerate() {
            let mut o = Vec::new();
            for v in out[i].0.iter().chain(out[i].1.iter()) {
                o.extend_from_slice(&v.to_le_bytes());
            }
            std::fs::write(format!("{mix}.{name}"), o).unwrap();
        }
    }
}
