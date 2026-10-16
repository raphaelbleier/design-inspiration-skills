"""Turns raw/<slot>.png (made with scripts/genimage.sh from image-prompts.tsv) into src/assets/<slot>.webp.
bg*: cover-crop, Gaussian blur (the original ships pre-blurred plates), WebP <= 200 KB.
rv*: cover-crop, sharp, WebP <= 200 KB. Deletes the PNGs. Usage: python3 tools/process-images.py"""
import os, sys
from PIL import Image, ImageFilter
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
for f in sorted(os.listdir(R+'/raw')):
    if not f.endswith('.png'): continue
    n=f[:-4]; im=Image.open(f'{R}/raw/{f}').convert('RGB')
    port=n.endswith(('p1','p2')) and n.startswith(('bgp','rvp'))
    tw,th=(1080,1920) if port else (1920,1080)
    # cover-crop to target aspect then resize
    ar=tw/th; w,h=im.size
    if w/h>ar: nw=int(h*ar); im=im.crop(((w-nw)//2,0,(w-nw)//2+nw,h))
    else: nh=int(w/ar); im=im.crop((0,(h-nh)//2,w,(h-nh)//2+nh))
    if n.startswith('bg'):
        im=im.resize((tw//2,th//2),Image.LANCZOS).filter(ImageFilter.GaussianBlur(14)).resize((tw,th),Image.BICUBIC)
    else:
        im=im.resize((tw,th),Image.LANCZOS)
    q=88
    while True:
        out=f'{R}/src/assets/{n}.webp'; im.save(out,'WEBP',quality=q,method=6)
        if os.path.getsize(out)<=200*1024 or q<=30: break
        q-=4
    print(n,q,os.path.getsize(out)//1024,'KB'); os.remove(f'{R}/raw/{f}')
