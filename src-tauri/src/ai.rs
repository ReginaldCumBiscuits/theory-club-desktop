//! AI stem separation for the song transcriber (desktop app only).
//!
//! The separation models (MDX-Net, KUIELab, MIT licence) are about 119 MB, so they are downloaded the first
//! time someone turns the feature on, checked against known SHA-256 hashes and kept in the app's data folder.
//! ONNX Runtime ships inside the app (see scripts/fetch-onnxruntime.sh) and is loaded on first use.
use crate::sepcore;
use sha2::{Digest, Sha256};
use std::io::{Read, Write};
use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::OnceLock;
use tauri::ipc::{InvokeBody, Request, Response};
use tauri::{AppHandle, Emitter, Manager, State};

const BASE: &str = "https://github.com/TRvlvr/model_repo/releases/download/all_public_uvr_models/";
const MODEL_BYTES: u64 = 29_703_204;
const MODELS: [(&str, &str); 4] = [
    ("vocals", "daba83c2ee1afee9139766ad64c9b6808d6b6f092fff04bed3338be50baac721"),
    ("bass", "0c3e77b9963185b1ea6bb46a4b8924137d9370fc1ccdefec7b1b416ef550dcaa"),
    ("drums", "40f586b7091934dd6f5563f0cba8f14bad57ce88440da1098bf388ea716c2901"),
    ("other", "7b67a1dcb5f232153528c59960b4c7bf8dc736b8114de360af0e719633f53358"),
];

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
    Ok(app.path().app_data_dir().map_err(|e| e.to_string())?.join("ai-separator"))
}

fn model_path(app: &AppHandle, part: &str) -> Result<PathBuf, String> {
    Ok(model_dir(app)?.join(format!("kuielab_a_{part}.onnx")))
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

fn ort_init(app: &AppHandle) -> Result<(), String> {
    ORT.get_or_init(|| {
        let p = runtime_path(app).ok_or("This build of the app doesn't include the AI runtime.")?;
        ort::init_from(p.to_string_lossy().to_string())
            .commit()
            .map(|_| ())
            .map_err(|e| format!("The AI runtime couldn't start: {e}"))
    })
    .clone()
}

fn installed(app: &AppHandle) -> bool {
    MODELS.iter().all(|(p, _)| {
        model_path(app, p).ok().and_then(|f| std::fs::metadata(f).ok()).map(|m| m.len() == MODEL_BYTES).unwrap_or(false)
    })
}

#[derive(serde::Serialize)]
pub struct AiStatus {
    runtime: bool,
    installed: bool,
    download_mb: u32,
    busy: bool,
}

/// Whether AI separation can run: the runtime is in this build and the models are downloaded.
#[tauri::command]
pub fn ai_status(app: AppHandle, ai: State<'_, Ai>) -> AiStatus {
    AiStatus {
        runtime: runtime_path(&app).is_some(),
        installed: installed(&app),
        download_mb: ((MODEL_BYTES * MODELS.len() as u64) / 1_000_000) as u32,
        busy: ai.0.load(Ordering::SeqCst),
    }
}

fn progress(app: &AppHandle, stage: &str, p: f32) {
    let _ = app.emit("ai-progress", serde_json::json!({ "stage": stage, "p": p.clamp(0.0, 1.0) }));
}

fn download(app: &AppHandle) -> Result<(), String> {
    let dir = model_dir(app)?;
    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let total = MODEL_BYTES * MODELS.len() as u64;
    let mut done = 0u64;
    for (part, hash) in MODELS {
        let dest = model_path(app, part)?;
        if std::fs::metadata(&dest).map(|m| m.len() == MODEL_BYTES).unwrap_or(false) {
            done += MODEL_BYTES;
            continue;
        }
        // TC_AI_BASE points the download somewhere else, for testing
        let base = std::env::var("TC_AI_BASE").unwrap_or_else(|_| BASE.to_string());
        let url = format!("{base}kuielab_a_{part}.onnx");
        let resp = ureq::get(&url).call().map_err(|e| format!("Couldn't download the {part} model: {e}"))?;
        let mut rd = resp.into_reader();
        let tmp = dest.with_extension("part");
        let mut f = std::fs::File::create(&tmp).map_err(|e| e.to_string())?;
        let mut h = Sha256::new();
        let mut buf = vec![0u8; 1 << 16];
        let mut got = 0u64;
        let mut last = 0u64;
        loop {
            let k = rd.read(&mut buf).map_err(|e| format!("The download was interrupted: {e}"))?;
            if k == 0 {
                break;
            }
            f.write_all(&buf[..k]).map_err(|e| e.to_string())?;
            h.update(&buf[..k]);
            got += k as u64;
            if got - last > 1 << 20 {
                last = got;
                progress(app, "download", (done + got) as f32 / total as f32);
            }
        }
        drop(f);
        let hex: String = h.finalize().iter().map(|b| format!("{b:02x}")).collect();
        if got != MODEL_BYTES || hex != hash {
            let _ = std::fs::remove_file(&tmp);
            return Err(format!("The {part} model didn't download correctly. Try again."));
        }
        std::fs::rename(&tmp, &dest).map_err(|e| e.to_string())?;
        done += MODEL_BYTES;
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
    let part = request.headers().get("x-part").and_then(|v| v.to_str().ok()).unwrap_or("").to_string();
    if !sepcore::PARTS.contains(&part.as_str()) {
        return Err("Unknown part".into());
    }
    let InvokeBody::Raw(bytes) = request.body() else {
        return Err("No audio was sent".into());
    };
    let data: Vec<f32> = bytes.chunks_exact(4).map(|c| f32::from_le_bytes([c[0], c[1], c[2], c[3]])).collect();
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
        let threads = std::thread::available_parallelism().map(|x| x.get()).unwrap_or(4);
        let mp = model_path(&app, &part)?;
        let mut s = ort::session::Session::builder()
            .and_then(|b| b.with_intra_threads(threads))
            .and_then(|b| b.commit_from_file(&mp))
            .map_err(|e| format!("The AI model couldn't load: {e}"))?;
        let total = sepcore::chunks(n, &part).max(1);
        let mut k = 0;
        progress(&app, "separate", 0.0);
        let (sl, sr) = sepcore::separate(&mut s, &part, l, r, || {
            k += 1;
            progress(&app, "separate", k as f32 / total as f32);
        })?;
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
