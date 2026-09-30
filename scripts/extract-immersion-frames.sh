#!/usr/bin/env bash
# Regenera la secuencia WebP de inmersión a partir del MP4 fuente.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VIDEO="${1:-$ROOT/kling_20261001_VIDEO_Cinematic_436_0 (online-video-cutter.com).mp4}"
OUT="$ROOT/public/immersion"

if [[ ! -f "$VIDEO" ]]; then
  echo "No encuentro el vídeo: $VIDEO" >&2
  exit 1
fi

mkdir -p "$OUT"
rm -f "$OUT"/frame-*.webp
ffmpeg -y -i "$VIDEO" \
  -vf "fps=10,scale=960:-2:flags=lanczos" \
  -c:v libwebp -quality 72 -compression_level 6 \
  "$OUT/frame-%03d.webp"

COUNT=$(ls "$OUT"/frame-*.webp | wc -l | tr -d ' ')
echo "Generados $COUNT fotogramas en $OUT ($(du -sh "$OUT" | cut -f1))"
echo "Actualiza IMMERSION_FRAME_COUNT en lib/immersionFrames.ts si el número cambió."
