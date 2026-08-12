#!/usr/bin/env bash
# Vogelstimmen für WT588D konvertieren (16 kHz Mono WAV)
set -euo pipefail

INPUT_DIR="${1:-}"
OUTPUT_DIR="${2:-}"

if [[ -z "$INPUT_DIR" || -z "$OUTPUT_DIR" ]]; then
  echo "Usage: $0 <input_dir> <output_dir>"
  exit 1
fi

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg nicht gefunden. Bitte installieren."
  exit 1
fi

mkdir -p "$OUTPUT_DIR"

mapfile -t files < <(find "$INPUT_DIR" -maxdepth 1 -type f \( \
  -iname '*.mp3' -o -iname '*.wav' -o -iname '*.ogg' -o -iname '*.flac' -o -iname '*.m4a' \
\) | sort | head -n 8)

if [[ ${#files[@]} -eq 0 ]]; then
  echo "Keine Audiodateien in $INPUT_DIR"
  exit 1
fi

i=1
for f in "${files[@]}"; do
  out="$OUTPUT_DIR/vogel${i}.wav"
  echo "[$i/8] $(basename "$f") -> vogel${i}.wav"
  ffmpeg -y -i "$f" -ar 16000 -ac 1 -sample_fmt s16 "$out"
  ((i++))
done

echo ""
echo "Fertig: ${#files[@]} Datei(en) in $OUTPUT_DIR"
