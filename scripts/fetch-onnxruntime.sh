#!/usr/bin/env bash
# Puts ONNX Runtime (used by the transcriber's AI separation) into src-tauri/ort for one platform.
#   scripts/fetch-onnxruntime.sh windows-x64 | mac-arm64 | mac-x64
set -euo pipefail
V=1.23.0
BASE="https://github.com/microsoft/onnxruntime/releases/download/v$V"
OUT="$(cd "$(dirname "$0")/.." && pwd)/src-tauri/ort"
TMP="$(mktemp -d)"
# pinned package checksums (Windows packages come from NuGet)
SHA_ort="${SHA_ort:-a33ec2382b3c440bab74042a135733bb6e5085f293b908d3997688a58fe307e7}"
SHA_dml="${SHA_dml:-4e7cb7ddce8cf837a7a75dc029209b520ca0101470fcdf275c1f49736a3615b9}"
case "${1:-}" in
  windows-x64)
    # the DirectML build (graphics-card acceleration, falls back to the processor) and DirectML itself
    mkdir -p "$TMP/ort" "$TMP/dml"
    curl -fsSL --retry 3 -o "$TMP/ort.zip" "https://www.nuget.org/api/v2/package/Microsoft.ML.OnnxRuntime.DirectML/$V"
    curl -fsSL --retry 3 -o "$TMP/dml.zip" "https://www.nuget.org/api/v2/package/Microsoft.AI.DirectML/1.15.4"
    for f in ort dml; do
      GOT=$( (sha256sum "$TMP/$f.zip" 2>/dev/null || shasum -a 256 "$TMP/$f.zip") | cut -d' ' -f1)
      WANT=$(eval echo "\${SHA_${f}:-}")
      echo "$f package sha256 $GOT"
      if [ -n "$WANT" ] && [ "$GOT" != "$WANT" ]; then echo "checksum mismatch for $f"; exit 1; fi
    done
    (cd "$TMP/ort" && unzip -q ../ort.zip) && (cd "$TMP/dml" && unzip -q ../dml.zip)
    cp "$TMP/ort/runtimes/win-x64/native/onnxruntime.dll" "$OUT/onnxruntime.dll"
    cp "$TMP/dml/bin/x64-win/DirectML.dll" "$OUT/DirectML.dll"
    cp "$TMP/ort/LICENSE"* "$OUT/LICENSE-onnxruntime.txt" 2>/dev/null || cp "$TMP/ort/LICENSE.txt" "$OUT/LICENSE-onnxruntime.txt" 2>/dev/null || true
    ls -la "$OUT"
    exit 0 ;;
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
