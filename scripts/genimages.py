#!/usr/bin/env python3
"""Generate every missing image listed in <rebuild>/images.json with the local ComfyUI (flux1-schnell).

Usage: scripts/genimages.py <rebuild-dir>...
images.json: [{"path": "public/img/hero.webp", "prompt": "...", "aspect": "16:9"}, ...]
Runs sequentially and writes WebP <= 200 KB. Existing files are skipped, so it is safe to re-run.
"""
import io, json, os, sys, time, urllib.parse, urllib.request
from PIL import Image

BASE = os.environ.get('COMFYUI_URL', 'http://127.0.0.1:8188')
MAX_BYTES, MAX_WIDTH = 200_000, 1920


def size(aspect):
    w, h = map(float, aspect.split(':'))
    s = (1024 * 1024 / (w * h)) ** .5  # ~1 MP, the model's native budget
    return round(w * s / 64) * 64, round(h * s / 64) * 64


def comfy(prompt, aspect):
    W, H = size(aspect)
    g = {
        '1': {'class_type': 'CheckpointLoaderSimple', 'inputs': {'ckpt_name': 'flux1-schnell-fp8.safetensors'}},
        '2': {'class_type': 'CLIPTextEncode', 'inputs': {'text': prompt, 'clip': ['1', 1]}},
        '3': {'class_type': 'CLIPTextEncode', 'inputs': {'text': '', 'clip': ['1', 1]}},
        '4': {'class_type': 'EmptySD3LatentImage', 'inputs': {'width': W, 'height': H, 'batch_size': 1}},
        '5': {'class_type': 'KSampler', 'inputs': {'model': ['1', 0], 'positive': ['2', 0], 'negative': ['3', 0],
              'latent_image': ['4', 0], 'seed': time.time_ns() % 2**32, 'steps': 4, 'cfg': 1,
              'sampler_name': 'euler', 'scheduler': 'simple', 'denoise': 1}},
        '6': {'class_type': 'VAEDecode', 'inputs': {'samples': ['5', 0], 'vae': ['1', 2]}},
        '7': {'class_type': 'SaveImage', 'inputs': {'images': ['6', 0], 'filename_prefix': 'genimages'}},
    }
    req = urllib.request.Request(BASE + '/prompt', json.dumps({'prompt': g}).encode(), {'Content-Type': 'application/json'})
    pid = json.load(urllib.request.urlopen(req, timeout=30))['prompt_id']
    for _ in range(200):
        time.sleep(2)
        hist = json.load(urllib.request.urlopen(f'{BASE}/history/{pid}', timeout=30))
        if pid in hist:
            img = hist[pid]['outputs']['7']['images'][0]
            return urllib.request.urlopen(BASE + '/view?' + urllib.parse.urlencode(img), timeout=60).read()
    raise TimeoutError(prompt)


def webp(png, out):
    im = Image.open(io.BytesIO(png)).convert('RGB')
    if im.width > MAX_WIDTH:
        im = im.resize((MAX_WIDTH, round(im.height * MAX_WIDTH / im.width)), Image.LANCZOS)
    for q in range(85, 30, -5):
        buf = io.BytesIO(); im.save(buf, 'WEBP', quality=q)
        if buf.tell() <= MAX_BYTES:
            break
    os.makedirs(os.path.dirname(out), exist_ok=True)
    open(out, 'wb').write(buf.getvalue())


failed = 0
for d in sys.argv[1:]:
    manifest = os.path.join(d, 'images.json')
    if not os.path.exists(manifest):
        print(f'{d}: no images.json'); continue
    for e in json.load(open(manifest)):
        out = os.path.join(d, e['path'])
        if os.path.exists(out):
            continue
        try:
            webp(comfy(e['prompt'], e.get('aspect', '16:9')), out); print('ok', out)
        except Exception as err:  # keep going; a re-run picks up what is missing
            failed += 1; print('FAILED', out, err)
sys.exit(1 if failed else 0)
