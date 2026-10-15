#!/usr/bin/env bash
# Screenshot a page at 3 breakpoints x 5 scroll positions.
# Usage: scripts/capture.sh <url> <out-dir>
# Used for both the original (out-dir under captures/, gitignored) and the rebuild.
set -euo pipefail
url=$1; out=$2; mkdir -p "$out"
pw(){ playwright-cli --raw "$@" 2>/dev/null | grep -v -e '║' -e '╔' -e '╚' || true; }
for size in 1440x900 768x1024 390x844; do
  pw resize ${size%x*} ${size#*x}
  pw goto "$url"; sleep 6
  for pct in 0 25 50 75 100; do
    pw eval "(() => { const y = (document.documentElement.scrollHeight - innerHeight) * $pct / 100;
      window.lenis ? window.lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y); })()"
    sleep 2
    pw screenshot --filename="$out/${size}-${pct}.png" >/dev/null
  done
done
ls "$out" | wc -l
