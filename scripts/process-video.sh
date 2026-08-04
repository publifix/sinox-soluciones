#!/usr/bin/env bash
# One-off pipeline for the Modelo Operativo background clip.
# Requires ffmpeg on PATH (e.g. `pip install imageio-ffmpeg` and use its
# bundled binary if there's no system ffmpeg available).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$ROOT/SINOX-CLIP.MP4"
OUT_DIR="$ROOT/public/assets/video"
FFMPEG="${FFMPEG:-ffmpeg}"

mkdir -p "$OUT_DIR"

# Poster: reuse the source file's embedded cover/thumbnail frame.
"$FFMPEG" -y -i "$SRC" -map 0:2 -update 1 -frames:v 1 "$OUT_DIR/sinox-clip-poster-raw.jpg"

# Web-optimized loop: drop audio (video is always muted), re-encode H.264
# with faststart so playback can begin before the full file downloads.
"$FFMPEG" -y -i "$SRC" -map 0:0 -an \
  -c:v libx264 -profile:v high -level 4.0 -pix_fmt yuv420p \
  -crf 22 -preset slower -movflags +faststart \
  "$OUT_DIR/sinox-clip.mp4"

python3 - "$OUT_DIR/sinox-clip-poster-raw.jpg" "$OUT_DIR/sinox-clip-poster.jpg" <<'PY'
import sys
from PIL import Image
src, dest = sys.argv[1], sys.argv[2]
Image.open(src).convert("RGB").save(dest, quality=82, optimize=True, progressive=True)
PY
rm -f "$OUT_DIR/sinox-clip-poster-raw.jpg"

echo "done -> $OUT_DIR"
