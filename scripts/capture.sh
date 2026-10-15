#!/usr/bin/env bash
# Screenshot a page at 3 breakpoints x 5 scroll positions.
# Usage: scripts/capture.sh <url> <out-dir> [playwright-session]
# Used for both the original (out-dir under captures/, gitignored) and the rebuild.
set -euo pipefail
url=$1; out=$2; session=${3:-default}; mkdir -p "$out"
pw(){ playwright-cli -s="$session" --raw "$@" 2>/dev/null | grep -v -e '║' -e '╔' -e '╚' || true; }
pw open >/dev/null
for size in 1440x900 768x1024 390x844; do
  pw resize ${size%x*} ${size#*x}
  pw goto "$url"; sleep 6
  # Scroll with real wheel input so any smooth-scroll library (Lenis, Locomotive...) follows.
  pw mousemove $(( ${size%x*} / 2 )) $(( ${size#*x} / 2 ))
  max=$(pw eval "document.documentElement.scrollHeight - innerHeight" | tr -dc '0-9')
  at=0
  # Wheel-driven sites have no native scroll range: use their window.__scrollTo(p) debug hook if present.
  hook=$(pw eval "typeof window.__scrollTo === 'function'" | tr -dc 'a-z')
  for pct in 0 25 50 75 100; do
    if [ "$max" = "" ] || [ "$max" -le 0 ]; then
      if [ "$hook" = "true" ]; then
        pw eval "window.__scrollTo($pct / 100)" >/dev/null; sleep 3
        pw screenshot --filename="$out/${size}-${pct}.png" >/dev/null
      fi
      continue
    fi
    target=$(( max * pct / 100 ))
    while [ $at -lt $target ]; do
      step=$(( target - at < 800 ? target - at : 800 ))
      pw mousewheel 0 $step >/dev/null; at=$(( at + step )); sleep 0.3
    done
    sleep 2
    pw screenshot --filename="$out/${size}-${pct}.png" >/dev/null
  done
done
ls "$out" | wc -l
pw close >/dev/null
