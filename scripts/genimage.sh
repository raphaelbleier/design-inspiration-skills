#!/usr/bin/env bash
# Generate one image: agy (Gemini Nano Banana) first, Codex (gpt-6-luna + gpt-image) as fallback.
# Usage: genimage.sh "<prompt>" <out.png> [aspect, e.g. 16:9]
# Prints the path on success; exits 1 if both generators fail. Never downloads or draws images.
set -u
prompt=$1 out=$(realpath -m "$2") aspect=${3:-16:9}
dir=$(dirname "$out"); mkdir -p "$dir"; rm -f "$out"
rule="Never download, search for, copy or draw images any other way. If generation fails, reply only FAILED: <error>."

# agy print mode kills the image subagent on exit, so keep the session open via stream-json until the file exists.
{
  printf '{"event":"user","message":{"role":"user","content":%s}}\n' \
    "$(printf 'Call your generate_image tool (Nano Banana) once: %s. Aspect ratio %s. Save it as %s. %s' "$prompt" "$aspect" "$out" "$rule" | python3 -c 'import json,sys;print(json.dumps(sys.stdin.read()))')"
  for _ in $(seq 48); do [ -s "$out" ] && break; sleep 5; done
} | timeout 300 agy --dangerously-skip-permissions --add-dir "$dir" --input-format stream-json --output-format stream-json -p "" >/dev/null 2>&1
[ -s "$out" ] && file "$out" | grep -q image && { echo "$out"; exit 0; }

timeout 300 codex exec -m gpt-6-luna --skip-git-repo-check -s workspace-write -C "$dir" \
  "Generate an image with your image generation tool (gpt-image): $prompt. Aspect ratio $aspect. Save it as $out. $rule" >/dev/null 2>&1
[ -s "$out" ] && file "$out" | grep -q image && { echo "$out"; exit 0; }
echo "genimage: both agy and codex failed" >&2; exit 1
