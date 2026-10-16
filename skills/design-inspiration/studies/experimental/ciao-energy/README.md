---
title: Ciao Energy
url: https://www.ciaoenergy.com/
studio: Skaald
awards: [SOTD, Developer Award]
year: 2026
category: experimental
techniques: [webgl, 3d-carousel, scroll-timeline, text-reveal, smooth-scroll, gradient-background, shader-free-pbr]
stack: [three, gsap, scrolltrigger, splittext, lenis, webflow]
---

# Ciao Energy — clean-room study

A product site for an energy drink, built around one object: a **real-time 3D aluminium can** that
never leaves the screen. A fixed WebGL canvas holds a looping row of cans (one per flavour); a single
scroll timeline flies the camera around them, tilts, spins and finally spirals them into a helix.
Everything else is calm: black, white, one geometric grotesk and a huge blurred conic gradient that
takes the colour of the flavour in front.

Rebuild: [`design-inspiration-rebuilds/experimental/ciao-energy`](https://github.com/raphaelbleier/design-inspiration-skills/tree/main/skills/design-inspiration-rebuilds/experimental/ciao-energy) (fictional content, generated images, open-source fonts; installed with the optional `design-inspiration-rebuilds` skill). Run it with `npm install && npm run dev`.

## Design Tokens

| Role | Value |
|---|---|
| Page / content sections | `#000` |
| Text | `#fff` (hairlines at 25-50% white) |
| Flavour colours | each flavour = one deep tone (page) + one bright tone (rim light, gradient), e.g. violet `#3d2b68` / `#9089d3` |
| Hover / pill border | `rgba(255,255,255,.4)` |

```css
:root {
  --p: #4a2a73; --s: #b99be8;                 /* current flavour, tweened by GSAP on change */
  --ease: cubic-bezier(.65, .05, 0, 1);       /* hover and char-roll curve */
}
.bg__conic {                                  /* fixed, 150% of the viewport, heavily blurred */
  inset: -25%; filter: blur(110px);
  background: conic-gradient(from 17deg, var(--s), var(--p) 25%, var(--s) 50%, var(--p) 75%, var(--s));
}
```

- **Type:** a Franklin-style grotesk at weight 500, uppercase, `line-height` .8-.9 for all display
  type (original: Franklin Gothic ATF; substitute: Libre Franklin). Body is Geist 300 at 14px.
- **Scale:** FAQ title 96px, hero kicker ~53px, section copy ~38px; hero flavour name is viewport-wide.
- **Shape:** pills (`border-radius: 99px`) with 1px white outlines; no shadows, no cards on black.
- Palette per flavour is data (`data-taste-primary` / `data-taste-secondary` in the original); the page
  background, gradient and a coloured point light all read from the same pair.

## Motion Spec

| What | Trigger | Animation | Duration / easing | Rebuild file |
|---|---|---|---|---|
| Smooth scroll | always | Lenis, `syncTouch`, driven by `gsap.ticker`, `lagSmoothing(0)` | — | `src/scroll.js` |
| Can scene | always | fixed canvas; PBR cans (lathe body, label cylinder), room environment, tinted point light; only the centre can follows the pointer | continuous | `src/scene.js` |
| Scroll timeline | scroll through 8 sections | one `data` object (camera pos/rot/fov, can tilt, spin, spacing, wave, swirl, base height, light, fade) tweened step by step, scrubbed | each step 1 unit, `power1.inOut` | `src/timeline.js` |
| Flavour carousel | drag, arrows, keys, chips | `target` snaps to integers; `pos` damps toward it; loops through 3 copies of 6 cans | rate 7 / s | `src/carousel.js` |
| Flavour change | index changes | background vars tween; name chars slide out up, new chars rise from a mask | .8s `power2.out`; chars .3s `power2.in` / .7s `power3.out`, stagger .025 | `src/flavor.js` |
| Text reveal | enters at 80% | SplitText chars rise out of a mask, reverse on exit | .8s `power3.out`, stagger .015 | `src/ui.js` |
| Helix finale | section 7 | cans leave the row and wind into a spiral, base slab drops away | scrubbed | `src/timeline.js` |
| Scene exit | section 8 | camera sinks, canvas and gradient fade to black content | scrubbed | `src/timeline.js` |
| Button char roll | hover | every letter slides up and its copy takes its place, staggered | .6s `cubic-bezier(.65,.05,0,1)`, 18ms per char | `src/style.css` |
| Menu | click | white panel opens as a circle `clip-path` from the button; links pop in | .8s `power3.out`; links `back.out(1.2)` | `src/ui.js` |
| Scroll indicator | scroll | nav dot fills as a conic gradient and glows brighter | follows scroll | `src/scroll.js` |

### Key excerpts

**One object, one timeline**: `src/timeline.js`
```js
export const data = {
  camX: 0, camY: 0, camZ: 10, camRX: 0, camRY: 0, camRZ: 0, fov: 30,
  canScale: 1, canX: 0, canY: 0, canZ: 0, canRX: 0, canRY: 0, canRZ: 0, spin: 0,
  spacing: 4.6, wave: 0, swirl: 0, baseOffset: 0,
  env: 1, spot: 0, tint: 1, pointer: 0.2, fade: 1,
};
// ...
const tl = gsap.timeline({ paused: true, defaults: { ease: 'power1.inOut', duration: 1 } });
STEPS.forEach((s) => tl.to(data, s));
ScrollTrigger.create({ animation: tl, trigger: document.body, start: 0,
  end: () => endEl.offsetTop, scrub: true });
```
The DOM never touches the scene. Sections are exactly one viewport tall, so section i is step i; the
renderer just reads `data` every frame.

**Can placement: line, wave and helix from the same loop**: `src/scene.js`
```js
const k = wrap(i - carousel.pos + N / 2, N) - N / 2;   // signed distance from the centre can
const a = k * 0.75, s = d.swirl;
const x = k * d.spacing * (1 - s) + Math.sin(a) * 3.4 * s;
let y = k * 0.3 * s + Math.sin(k * 0.9 + t * 1.6) * 0.35 * d.wave;
const z = (Math.cos(a) * 3.4 - 3.4) * s;
// ...
c.rotation.set(d.canRX + mouse.sy * d.pointer * near,
               d.canRY + d.spin + mouse.sx * d.pointer * near, d.canRZ);
```
`swirl` 0 → 1 blends a straight row into a helix; `spacing` and `wave` do the rest. Tweening three
numbers redraws the whole scene.

**A can without a model file**: `src/scene.js`
```js
const profile = [[0, -1.12], [0.3, -1.14], [0.38, -1.2], [0.44, -1.2], [0.5, -1.1], [0.5, 0.85],
  [0.47, 0.98], [0.41, 1.08], [0.37, 1.14], [0.38, 1.2], [0.34, 1.2], [0.32, 1.16], [0, 1.16]]
  .map(([x, y]) => new THREE.Vector2(x, y));
const bodyGeo = new THREE.LatheGeometry(profile, 64);
const labelGeo = new THREE.CylinderGeometry(0.503, 0.503, 1.9, 64, 1, true);
const metal = new THREE.MeshStandardMaterial({ color: 0xd8dade, metalness: 0.92, roughness: 0.28 });
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
```
A 13-point profile plus a studio environment map is enough for convincing brushed aluminium.

**Carousel that damps toward integers**: `src/carousel.js`
```js
export function updateCarousel(dt) {
  carousel.pos += (carousel.target - carousel.pos) * (1 - Math.exp(-dt * 7));   // frame-rate independent
  const idx = wrap(Math.round(carousel.target));
  if (idx !== carousel.index) { carousel.index = idx; listeners.forEach((f) => f(idx)); }
}
// drag: 1 can per (viewport width / 4.2) px, snap on release
carousel.target = down.t - (e.clientX - down.x) / (innerWidth / 4.2);
```

**Flavour colour swap**: `src/flavor.js`
```js
gsap.to(document.documentElement, { '--p': f.p, '--s': f.s, duration: 0.8, ease: 'power2.out' });
gsap.to(tintLight.color, { ...new THREE.Color(f.s), duration: 0.8 });
// name: old chars out, then new chars rise from the mask
gsap.to(old.chars, { yPercent: -110, duration: 0.3, ease: 'power2.in', stagger: 0.015, onComplete: put });
gsap.from(sp.chars, { yPercent: 110, duration: 0.7, ease: 'power3.out', stagger: 0.025 });
```
CSS variables, the rim light and the gradient share one tween, so page and product always agree.

`prefers-reduced-motion`: Lenis, the idle float, name animations and text reveals are off; the
scroll timeline still scrubs with the user's own scroll.

## Why Award-Worthy

1. **The product is the page.** One persistent 3D object, never swapped for a screenshot, turns a
   catalogue into a single continuous camera move.
2. **A scene driven by numbers, not by sections.** A single `data` object and one scrubbed
   timeline replace per-section animations, so transitions are always continuous.
3. **Colour from the product.** The flavour's own pair feeds background, gradient and lighting at
   once; the site changes mood without any extra design.
4. **Restraint around the spectacle.** Black, white, one typeface and thin outlines let the saturated
   cans carry all the colour.
5. **Honest performance.** DPR capped, a procedural can instead of heavy assets, and every effect
   tied to one frame loop.

**Anti-patterns it avoids:** no scroll hijacking beyond smoothing; no separate canvases per section;
no drop shadows or glass; the WebGL layer never blocks input (`pointer-events: none`); content stays
real HTML text.

## Credits

- Original: [ciaoenergy.com](https://www.ciaoenergy.com/) by **Skaald**. Design and content are
  the intellectual property of their creators.
- Recognition: Awwwards Site of the Day, Developer Award.
- This study is an independent clean-room analysis. The rebuild uses a fictional brand, AI-generated
  images (listed in `images.json`) and open-source fonts; it contains no original code, assets or copy.
