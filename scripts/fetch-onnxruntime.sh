#!/usr/bin/env bash
# Puts ONNX Runtime (used by the transcriber's AI separation) into src-tauri/ort for one platform.
#   scripts/fetch-onnxruntime.sh windows-x64 | mac-arm64 | mac-x64
set -euo pipefail
V=1.23.0
BASE="https://github.com/microsoft/onnxruntime/releases/download/v$V"
OUT="$(cd "$(dirname "$0")/.." && pwd)/src-tauri/ort"
TMP="$(mktemp -d)"
case "${1:-}" in
  windows-x64) F="onnxruntime-win-x64-$V.zip";        SHA=72c23470310ec79a7d42d27fe9d257e6c98540c73fa5a1db1f67f538c6c16f2f ;;
  mac-arm64)   F="onnxruntime-osx-arm64-$V.tgz";      SHA=8182db0ebb5caa21036a3c78178f17fabb98a7916bdab454467c8f4cf34bcfdf ;;
  mac-x64)     F="onnxruntime-osx-universal2-$V.tgz"; SHA=5e4365fb4a05aef353f6232b9a1848f37e608c421c9227e9224572205c0cfc08 ;;
  *) echo "usage: $0 windows-x64|mac-arm64|mac-x64"; exit 1 ;;
esac
curl -fsSL --retry 3 -o "$TMP/$F" "$BASE/$F"
GOT=$( (sha256sum "$TMP/$F" 2>/dev/null || shasum -a 256 "$TMP/$F") | cut -d' ' -f1)
[ "$GOT" = "$SHA" ] || { echo "checksum mismatch for $F: $GOT"; exit 1; }
cd "$TMP"
if [[ "$F" == *.zip ]]; then
  unzip -q "$F"
  D="${F%.zip}"
  cp "$D/lib/onnxruntime.dll" "$OUT/onnxruntime.dll"
else
  tar xzf "$F"
  D="${F%.tgz}"
  if [ "$1" = "mac-x64" ]; then
    lipo -thin x86_64 "$D/lib/libonnxruntime.$V.dylib" -output "$OUT/libonnxruntime.dylib"
  else
    cp "$D/lib/libonnxruntime.$V.dylib" "$OUT/libonnxruntime.dylib"
  fi
fi
cp "$D/LICENSE" "$OUT/LICENSE-onnxruntime.txt"
ls -la "$OUT"
