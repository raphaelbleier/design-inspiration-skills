---
title: Miu Miu A House That We Shaped
url: https://immersivebags.miumiu.com/
studio: Merci Michel
awards: [SOTD, Developer Award]
year: 2026
category: fashion
techniques: [webgl, shader, parallax, hotspots, page-transitions, text-reveal, immersive]
stack: [three, gsap, vite]
---

# Miu Miu A House That We Shaped — clean-room study

An immersive product launch staged as a walkable apartment. A deep-blue gate with a tracked,
justified title leads into a single full-screen WebGL scene: a flat, symmetrical, retro-editorial
photograph of a room. The cursor nudges it in parallax, the wheel dollies in, round hotspots on
objects open the bags, and door hotspots push you through to the next room with a radial ripple.
Yellow subtitles narrate each room. No scroll page at all.

Rebuild: [`design-inspiration-rebuilds/fashion/miu-miu-house`](https://github.com/raphaelbleier/design-inspiration-skills/tree/main/skills/design-inspiration-rebuilds/fashion/miu-miu-house) (fictional content, generated images, open-source fonts; installed with the optional `design-inspiration-rebuilds` skill). Run it with `npm install && npm run dev`.

## Design Tokens

| Role | Value |
|---|---|
| Gate blue | `#0b0f5c` |
| Subtitle yellow | `#ffe100` |
| Tooltip / card cream | `#fbf1e0` |
| Door red / green (in the imagery) | vermilion / grass green |
| Ink / white | `#0a0a0a` / `#fff` |

```css
:root { --blue:#0b0f5c; --yellow:#ffe100; --cream:#fbf1e0;
  --ease: cubic-bezier(.23, 1, .32, 1); }   /* hotspot + panel curve, .6-.8s */
```

- **Type:** Work Sans (the original uses it too) at 800, uppercase, wide tracking for the gate
  title, laid out as justified two-word rows. A script face (original: Biro Script; substitute:
  Caveat) only inside the hint tooltip, like handwriting on a note. Sometype Mono for small labels.
- **Colour:** the UI is white, cream and one yellow; all saturation lives in the photography
  (painted doors, pastel walls), so the interface never competes with the product.
- **Shape:** hard square cards, circular hotspots with a pulsing ring, slight rotations (-1.5deg,
  6deg) on notes and the sound toggle for a hand-placed feel. No shadows.

## Motion Spec

| What | Trigger | Animation | Duration / easing | Rebuild file |
|---|---|---|---|---|
| Gate title | load | words slide up out of overflow-hidden rows, then sub/CTA fade in | .9s `power4.out`, stagger .05 | `src/intro.js` |
| Gate exit | click Enter | gate wipes upward via `clip-path: inset(0 0 100% 0)` | .9s `power2.inOut` | `src/intro.js` |
| Room parallax | pointer | cursor offsets the texture UVs, lerped | lerp .06, ±.018 uv | `src/room.js` |
| Dolly zoom | wheel | zoom 1 → 1.35, eased | lerp .08 | `src/room.js` |
| Door transition | door click | radial reveal from the door, ripple at the band, old room zooms out through, new room settles | 1.6s `power2.inOut` | `src/room.js` |
| Hotspots | room enter | pop in, pulsing ring; positions reprojected from image space every frame | .6s `back.out(2)`, stagger .1 | `src/hotspots.js` |
| Bag card | hotspot click | cream card slides in from the right (bottom sheet on mobile) | .8s `cubic-bezier(.23,1,.32,1)` | `src/style.css` |
| Subtitles | room enter | letters appear one by one, hold, fade | .018 per char, hold 3.2s | `src/subtitles.js` |
| Film grain | always | hash noise added in the fragment shader | per frame | `src/room.js` |

### Key excerpts

**Door push-through transition**: `src/room.js`
```glsl
float r = uProg * 2.2;
float edge = smoothstep(r, r - .22, d);                 // 1 inside the reveal
vec2 dir = normalize(s - uOrigin + 1e-4);
vec2 sA = s + dir * edge * (1.0 - edge) * .16;          // ripple at the band
float zA = uZoom * 1.08 * mix(1.0, 1.5, uProg);         // old room rushes past
float zB = 1.08 * mix(1.3, 1.0, uProg);                 // new room settles
vec3 col = mix(a, b, edge);
```

**Cover-fit with parallax**: `src/room.js`
```glsl
vec2 cover(vec2 s, float asp, float zoom, vec2 par){
  float r = uRes.x / uRes.y;
  vec2 k = r > asp ? vec2(1.0, asp / r) : vec2(r / asp, 1.0);
  return (s - .5) * k / zoom + .5 + par;
}
```
The 1.08 base zoom is overscan, so the .018 parallax never exposes an edge.

**Hotspots that ride the image**: `src/room.js`
```js
// image-uv -> screen px, mirrors the shader
const z = u.uZoom.value * 1.08;
const tu = x - px, tv = (1 - y) - py;
const sx = (tu - .5) * z / kx + .5, sy = (tv - .5) * z / ky + .5;
return { x: sx * innerWidth, y: (1 - sy) * innerHeight };
```
Hotspots are plain DOM buttons (accessible, focusable) repositioned from the same maths as the shader.

**Gate title reveal**: `src/intro.js`
```js
gsap.set(w, { yPercent: 110 });
gsap.timeline({ delay: .3 })
  .to(w, { yPercent: 0, duration: .9, ease: 'power4.out', stagger: .05 })
  .to(['.intro__sound', '.intro__sub', '.intro__enter'],
    { autoAlpha: 1, duration: .8, ease: 'power2.out', stagger: .12 }, '-=.4');
```

`prefers-reduced-motion`: parallax, dolly and the ripple transition are off; rooms cut instantly.

## Why Award-Worthy

1. **One image, one shader, whole site.** The experience is a single textured plane; parallax,
   zoom and transitions all come from UV maths, so it is light and consistent.
2. **Photography does the colouring.** A neutral UI lets painted doors and pastel rooms carry
   the brand; yellow subtitles are the only recurring accent.
3. **Navigation as architecture.** Doors are the menu; moving between rooms feels like walking,
   not clicking.
4. **Hotspots stay glued to objects** because they are reprojected from image space, so the
   parallax never breaks the illusion.
5. **A confident gate.** Justified tracked type on flat blue sets tone before any imagery loads.

**Anti-patterns it avoids:** no scrolling page of cards, no carousel, no heavy 3D models, no
autoplaying video wall; the product is revealed by exploring.

## Credits

- Original: [immersivebags.miumiu.com](https://immersivebags.miumiu.com/) by **Merci Michel**. Design and
  content are the intellectual property of their creators.
- Recognition: Awwwards Site of the Day, Developer Award.
- This study is an independent clean-room analysis. The rebuild uses a fictional house (Ostra),
  AI-generated images and open-source fonts; it contains no original code, assets, logos, products
  or copy.
