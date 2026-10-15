#!/usr/bin/env bash
# Rebuild screenshots (captures/<slug>/rebuild-shots/1440x900-0.png, local only, our rebuild never the
# original) -> site/public/thumbs/<slug>.webp, ~1200px wide, <= 120 KB.
set -euo pipefail
cd "$(dirname "$0")/.."
out=site/public/thumbs
mkdir -p "$out"
for src in captures/*/rebuild-shots/1440x900-0.png; do
  [ -f "$src" ] || continue
  slug=$(basename "$(dirname "$(dirname "$src")")")
  for q in 82 72 62 52 42; do
    convert "$src" -resize 1200x -quality "$q" -define webp:method=6 "$out/$slug.webp"
    [ "$(stat -c %s "$out/$slug.webp")" -le 122880 ] && break
  done
  echo "$slug $(stat -c %s "$out/$slug.webp") bytes"
done
