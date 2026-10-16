---
title: Messenger
url: https://messenger.abeto.co
studio: abeto
awards: [SOTY 2025, SOTD, Developer Award]
year: 2025
category: games-entertainment
techniques: [webgl, post-processing, outline-shader, flat-shading, toon-shading, stop-motion-ui, custom-easing, page-transitions, procedural-geometry]
stack: [three, gsap, customease, vite, fontsource]
---

# Messenger — clean-room study

A browser game that opens on a small spinning planet and lets you walk its surface as a courier.
The whole thing is a single WebGL canvas that reads as a **hand-inked animation**: flat-shaded
low-poly geometry, hard cel bands, dark ink lines that wobble in steps, and a flat posterised sky.
All UI (panels, buttons, checklist) is drawn in the same language: paper-white shapes with a hard
offset shadow and a jittering polygon outline.

Rebuild: [`design-inspiration-rebuilds/games-entertainment/messenger-abeto`](https://github.com/raphaelbleier/design-inspiration-skills/tree/main/skills/design-inspiration-rebuilds/games-entertainment/messenger-abeto) (fictional world and copy, procedural 3D, open-source fonts; installed with the optional `design-inspiration-rebuilds` skill). Run it with `npm install && npm run dev`.

## Design Tokens

| Role | Value |
|---|---|
| Sky (flat, posterised) | `#62BEBB` `#68c6c0` `#70cdc3` |
| Ink (lines, text outline) | `#363a3c` |
| Paper (panels) | `#F8F8F8` |
| Hard shadow | `#647A87` |
| Blue accent | `#66BDE6` / dark `#488BAA` |
| Button yellow / bevel / text shadow | `#F6CF5F` / `#BD8A42` / `#7A5E0D` |

```css
:root {
  --paper: #F8F8F8; --shadow: #647A87; --line: #363a3c; --sky: #62BEBB;
  --hud: 65px; --hud-r: 30px; --hud-t: 50px; --sh: 5.5px;
  --inkline: drop-shadow(1.5px 0 0 var(--line)) drop-shadow(-1.5px 0 0 var(--line))
             drop-shadow(0 1.5px 0 var(--line)) drop-shadow(0 -1.5px 0 var(--line));
  --panel: drop-shadow(var(--sh) var(--sh) 0 var(--shadow)) var(--inkline);
}
@media (max-width: 700px) { :root { --hud: 45px; --hud-r: 20px; --hud-t: 30px; --sh: 4px; } }
```

- **Type:** a pixel face for headings and the BEGIN button (substitute: Silkscreen), a hand-written
  face for body and panels (Gaegu), a clean geometric sans for small tags (Rem).
- **Shape language:** no gradients, no blur. Depth is a 5.5px hard offset shadow plus a 1.5px ink
  outline built from four stacked `drop-shadow`s that follow whatever `clip-path` the child has.
- **HUD:** four square icon buttons on the right edge (65px desktop, 45px phones).

## Motion Spec

| What | Trigger | Animation | Duration / easing | Rebuild file |
|---|---|---|---|---|
| Planet arrival | intro, t=0.2s | y -80 -> 0, scale .3 -> 1, x-rot -pi -> 0, y-rot -1.15pi -> .12 | 2.25s / 6.3s / 2s / 5.65s, custom `inOut1` / `inOut3` | `src/main.js` |
| Title letters | t=2.35s | letters pop in 0.08s apart | elastic | `src/title.js` |
| BEGIN button | t=3.3s | scale + x-rot from -180deg | `elastic.out(1,.9)` 3.25s | `src/main.js` |
| Intro -> game | click | camera orbit, zoom to game distance, white diagonal wipes, flash, scene swap under full white | 2.5s `tweaked`, 2.75s `inOut1`, wipes 1.15s / 2s | `src/main.js` |
| Ink outline | every frame | normal + depth edge detect on a second pass, jittered 8x per second | continuous | `src/outline.js` |
| UI boil | idle | panel `clip-path` polygon re-seeded about 7x per second | steps of .14s | `src/stepped.js` |
| Panel pop | open/close | scale quantised to 4 steps | .35s in, .05s out, ease `none` | `src/stepped.js` |
| Planet | build | icosphere, per-face colour, 6 biomes, merged props | static | `src/planet.js` |
| Courier | input | walk on sphere, outfit editor, emote wheel | - | `src/character.js`, `src/game.js`, `src/hud.js` |
| Dialogue | proximity | speech panel, typed text | - | `src/dialogue.js` |

### Key excerpts

**Ink lines from normals and depth**: `src/outline.js`
```glsl
for (int i = 0; i < 4; i++) {
  vec2 u = vUv + offs[i] + jit;                       // jit changes 8x per second = line boil
  nd = max(nd, length(n0 - texture2D(tNormal, u).rgb));
  dd = max(dd, abs(dl - lin(texture2D(tDepth, u).r)) / dl);
}
float e = max(smoothstep(.35, .7, nd), smoothstep(.015, .04, dd));
col = mix(col, uInk, e * .92);
```
The same scene is rendered twice (colour, then `MeshNormalMaterial` with `flatShading`); creases come
from the normal difference, silhouettes from the depth jump.

**Posterised sky**: `src/outline.js`
```glsl
col = uSkyA;
col = mix(col, uSkyB, step(.63, n));
col = mix(col, uSkyC, step(.78, fbm(p * 1.3 + 4.)));
```
Two hard thresholds on fbm noise give flat cloud shapes, no gradient anywhere.

**Faceted planet**: `src/planet.js`
```js
export const R = 40;
// IcosahedronGeometry(R, 6).toNonIndexed() -> every face owns its normal
// biome = nearest centre direction after a +-0.11 domain warp -> irregular borders
const w = 0.22;
const x = d.x + (noise3(d.x * 3, d.y * 3, d.z * 3) - 0.5) * w;
```
Props are merged into one geometry with vertex colours, so the world is a handful of draw calls.

**Stop-motion panels**: `src/stepped.js`
```js
export function wobblePoly(amp = 1.3, rnd = Math.random) {
  const j = () => ((rnd() * 2 - 1) * amp).toFixed(2) + 'px';
  const pts = [[0,0],[33,0],[66,0],[100,0],[100,50],[100,100],[66,100],[33,100],[0,100],[0,50]];
  return 'polygon(' + pts.map(([x, y]) => `calc(${x}% + ${j()}) calc(${y}% + ${j()})`).join(',') + ')';
}
```
A 10-point polygon is re-jittered on a 0.14s ticker; the stacked `drop-shadow`s hug the moving shape.

**Custom eases**: `src/ease.js`
```js
CustomEase.create('inOut1', 'M0,0 C0.5,0 0.1,1 1,1');      // slow start, long soft landing
CustomEase.create('inOut3', 'M0,0 C0.6,0 0,1 1,1');
CustomEase.create('tweaked', 'M0,0 C0.388,0 0.441,0.356 0.496,0.496 0.553,0.641 0.647,1 1,1');
if (REDUCED) gsap.globalTimeline.timeScale(12);   // sequences still finish in order, almost instantly
```

`prefers-reduced-motion`: the global timeline runs 12x faster so state changes still happen in order;
idle loops (auto-rotate, ink boil, glyph wiggle) stand still.

## Why Award-Worthy

1. **One rendering idea carries everything.** The ink post-process turns plain low-poly geometry into
   something that looks drawn; no textures are needed.
2. **UI belongs to the world.** DOM panels use the same ink line, hard shadow and jitter as the 3D
   scene, so there is no seam between game and interface.
3. **Quantised motion.** Pops, boils and sky drift run in steps, which gives a stop-motion feel
   at a cheap cost and hides frame-rate differences.
4. **Hand-tuned easing.** A small set of custom Bezier curves, reused for every intro move, gives
   the opening its slow, confident landing.
5. **Constrained palette.** Teal sky, paper white and one ink colour; colour comes from the biomes.

**Anti-patterns it avoids:** no smooth gradients or blur, no soft shadows, no stock UI kit, no
loading bar (a short stepped animation instead), no separate "menu look" versus "game look".

## Credits

- Original: [messenger.abeto.co](https://messenger.abeto.co) by **abeto**. Design and content are
  the intellectual property of their creators.
- Recognition: Awwwards Site of the Year 2025, Site of the Day, Developer Award.
- This study is an independent clean-room analysis. The rebuild uses a fictional world, procedural
  geometry and open-source fonts; it contains no original code, assets or copy.
