#!/usr/bin/env bash
# Generate one image: agy (Gemini Nano Banana) first, then Codex (gpt-6-luna + gpt-image), then local ComfyUI (flux1-schnell).
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
# Last resort: local ComfyUI API, flux1-schnell at 4 steps.
COMFYUI_URL=${COMFYUI_URL:-http://127.0.0.1:8188} python3 - "$prompt" "$out" "$aspect" <<'PY' && { echo "$out"; exit 0; }
import json, sys, time, urllib.request, urllib.parse
prompt, out, aspect = sys.argv[1:4]
w, h = map(int, aspect.split(':')); scale = (1024 * 1024 / (w * h)) ** .5
W, H = round(w * scale / 64) * 64, round(h * scale / 64) * 64
base = __import__('os').environ['COMFYUI_URL']
g = {
 '1': {'class_type': 'CheckpointLoaderSimple', 'inputs': {'ckpt_name': 'flux1-schnell-fp8.safetensors'}},
 '2': {'class_type': 'CLIPTextEncode', 'inputs': {'text': prompt, 'clip': ['1', 1]}},
 '3': {'class_type': 'CLIPTextEncode', 'inputs': {'text': '', 'clip': ['1', 1]}},
 '4': {'class_type': 'EmptySD3LatentImage', 'inputs': {'width': W, 'height': H, 'batch_size': 1}},
 '5': {'class_type': 'KSampler', 'inputs': {'model': ['1', 0], 'positive': ['2', 0], 'negative': ['3', 0], 'latent_image': ['4', 0],
       'seed': int(time.time()), 'steps': 4, 'cfg': 1, 'sampler_name': 'euler', 'scheduler': 'simple', 'denoise': 1}},
 '6': {'class_type': 'VAEDecode', 'inputs': {'samples': ['5', 0], 'vae': ['1', 2]}},
 '7': {'class_type': 'SaveImage', 'inputs': {'images': ['6', 0], 'filename_prefix': 'genimage'}},
}
req = urllib.request.Request(base + '/prompt', json.dumps({'prompt': g}).encode(), {'Content-Type': 'application/json'})
pid = json.load(urllib.request.urlopen(req, timeout=30))['prompt_id']
for _ in range(120):
    time.sleep(3)
    hist = json.load(urllib.request.urlopen(f'{base}/history/{pid}', timeout=30))
    if pid in hist:
        img = hist[pid]['outputs']['7']['images'][0]
        data = urllib.request.urlopen(base + '/view?' + urllib.parse.urlencode(img), timeout=60).read()
        open(out, 'wb').write(data); sys.exit(0)
sys.exit(1)
PY
echo "genimage: agy, codex and comfyui failed" >&2; exit 1
