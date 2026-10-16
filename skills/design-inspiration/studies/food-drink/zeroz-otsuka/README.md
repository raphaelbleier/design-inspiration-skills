---
title: /zeroz Brand Site
url: https://otsuka-air.jp/
studio: SHIFTBRAIN
awards: [SOTD, Developer Award]
year: 2026
category: food-drink
techniques: [webgl, scroll-pinning, text-reveal, parallax, smooth-scroll, page-transitions, 3d-transforms, bloom-transition]
stack: [three, gsap, scrolltrigger, lenis, alpinejs, astro]
---

# /zeroz Brand Site — clean-room study

A launch site for a "self-conditioning food" sold in single-serve sachets. The whole page is one
long, pinned scroll story in a single hue: a **WebGL corner room lit by a ceiling lamp** with the
pouch floating in the beam, which **blooms into pure white** and hands over to calm mint chapters.
Japanese body copy sits in the centre of every screen while skewed photos drift past it.

Rebuild: [`design-inspiration-rebuilds/food-drink/zeroz-otsuka`](https://github.com/raphaelbleier/design-inspiration-skills/tree/main/skills/design-inspiration-rebuilds/food-drink/zeroz-otsuka) (fictional brand and copy, images listed in `images.json` and generated later, open-source fonts; installed with the optional `design-inspiration-rebuilds` skill). Run it with `npm install && npm run dev`.

## Design Tokens

| Role | Value |
|---|---|
| Emerald (logo, CTA, store button) | `#00a852` |
| Deep forest (hero room, dark chapter) | `#133221` / `#11663a` |
| Mint wash (page, light chapters) | `#e8f6f1` |
| Mint highlight (radial centre) | `#bff5dc` |
| Ink | `#111312` |
| White (bloom, intro, cards) | `#ffffff` |

```css
:root {
  --green: #00a852; --deep: #133221; --forest: #11663a; --mint: #e8f6f1; --mint2: #bff5dc;
  --ease: cubic-bezier(.3, .26, .38, 1);   /* one curve for every hover, header and menu change */
  --pad: clamp(16px, 2.4vw, 34px);         /* header / page gutter (original: 34px left, 10px right) */
}
.t-display { font: 500 clamp(26px, 2.9vw, 42px)/1.8 var(--ja); letter-spacing: .2em; }
.text      { font: 400 clamp(15px, 1.25vw, 18px)/2.05 var(--ja); letter-spacing: .1em; }
```

- **Type:** two voices. A neutral Helvetica-style grotesk (original: Helvetica Now Display; substitute:
  Inter Tight) for English: tight, `letter-spacing: -.02em`, regular weight, hero lines at `7.6vw`
  with `line-height: .98`. A Japanese gothic (original: Tazugane Gothic; substitute: Zen Kaku Gothic New)
  with **wide tracking** (`.1em` body, `.2em` display) and `palt` for display lines.
- **Colour logic:** one green family. Dark forest for the hero and one "problem" chapter, pale mint
  for every explanatory chapter. Header text flips white/ink with the section underneath.
- **Shape:** rectangular cards, a flat emerald "Online store" tab hanging from the top-right corner,
  circle-arrow CTAs, hairline circles for the scroll hint and side dots. No shadows.
- **Photos:** always skewed (`rotate(r) skewY(-.6r)`) and never in a grid: they are scattered and in
  motion, so the type in the middle stays the only fixed thing.

## Motion Spec

| What | Trigger | Animation | Duration / easing | Rebuild file |
|---|---|---|---|---|
| Smooth scroll | always | Lenis `{ lerp: .1, smoothWheel }` driven by `gsap.ticker`, `lagSmoothing(0)`; one loop also renders WebGL | — | `src/scroll.js` |
| Hero room | always, cursor, scroll | corner room + spot lamp + pouch + pill + dust; camera follows cursor (lerp .06); scroll spins the pouch 1.6 turns and swells the lamp | continuous / scrubbed | `src/stage.js` |
| Hero headline | page load | split into characters, rise from `yPercent: 110`; bracket pair opens on scroll | 1.1s `power3.out`, stagger .035 | `src/hero.js` |
| Bloom hand-over | scroll 40% → 100% of 520vh hero | white radial disc scales 0 → 2.8 until the viewport is flat white | scrubbed .6 | `src/hero.js` |
| Statement + summary | scroll through 640vh pinned section | three-line statement rises out of masks, then summary lines light up one by one (opacity .14 → 1) in three blocks | scrubbed .6 | `src/intro.js` |
| Wordmark | end of intro | huge green logo scales .7 → 1 and fades in | `power2.out` | `src/intro.js` |
| Chapter title + text | scroll through each ~500vh chapter | title fades/rises in, leaves; text lines fade up with 6px blur, stagger 2.5 units; CTA appears with first block | scrubbed .6 | `src/chapters.js` |
| Floating photos | same timeline | skewed cards cross the screen at individual speeds (`data-speed` .9–2.2) | linear, scrubbed | `src/chapters.js` |
| Molecule | chapter 3 | dotted-bond molecule of glowing atoms, slow idle spin plus scroll spin | continuous / scrubbed | `src/molecule.js` |
| Photo stacks | chapter 4 | two piles of slabs in CSS 3D (`rotateY ±62deg`) slide in and fan open (z gap 8 → 46px) | scrubbed | `src/stack.js` |
| Scene list | enters at 85% | each row opens with `clip-path: inset(0 0 100% 0)` → `inset(0)`, image settles 1.2 → 1 | .9s `power3.inOut` | `src/scenes.js` |
| Header + dots | scroll | header colour flips white/ink per section; side dots mark the current chapter | .5s `cubic-bezier(.3,.26,.38,1)` | `src/theme.js` |
| Menu | click (mobile) | circle clip-path grows from the button, links rise out of masks | .8s `power3.out`, stagger .07 | `src/menu.js` |
| Page transition | link click | green panel wipes up, scroll jumps under it, panel leaves upward (original: full page navigation) | .55s `power3.in` / .7s `power3.out` | `src/transition.js` |

### Key excerpts

**One frame loop for scroll, ScrollTrigger and WebGL**: `src/scroll.js`
```js
lenis = new Lenis({ lerp: 0.1, smoothWheel: true, autoRaf: false });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.lagSmoothing(0);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);                       // gsap time is seconds, Lenis wants ms
  frameCallbacks.forEach((fn) => fn(time));     // hero + molecule render in the same tick
});
```
Sticky sections plus one ticker keep the 3D scene exactly in step with the scrubbed copy.

**Hero scroll: scene progress, copy exit and bloom on one 0-100 timeline**: `src/hero.js`
```js
const tl = gsap.timeline({ defaults: { ease: 'none' },
  scrollTrigger: { trigger: '#kv', start: 'top top', end: 'bottom bottom', scrub: 0.6 } });
tl.to(prog, { p: 1, duration: 45, onUpdate: () => stage.setProgress(prog.p) }, 0)
  .to('.copy-top', { yPercent: -60, opacity: 0, duration: 35 }, 0)
  .to('.b-l', { x: '-9vw', duration: 45 }, 0).to('.b-r', { x: '9vw', duration: 45 }, 0)
  .fromTo('.bloom', { scale: 0 }, { scale: 2.8, duration: 60 }, 40);
```
The hero is a 520vh section with a `position: sticky` child, so there is no pin spacer to fight Lenis.

**Lamp, light shaft and scroll-driven swell**: `src/stage.js`
```js
const spot = new THREE.SpotLight(0xeaffe6, 60, 14, 0.55, 0.7, 1.2);   // angle .55, penumbra .7
const shaft = new THREE.Mesh(new THREE.ConeGeometry(2.2, 4.4, 48, 1, true),
  new THREE.MeshBasicMaterial({ color: 0x9dffb8, transparent: true, opacity: 0.04,
    blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
// per frame
pouch.rotation.y = p * Math.PI * 3.2 + state.cx * 0.4;
spot.intensity = 60 + p * 120; shaft.material.opacity = 0.04 + p * 0.3; lamp.scale.setScalar(1 + p * 2);
```
An open additive cone fakes volumetric light; scroll progress brightens it until the white bloom takes over.

**Summary lines that light up one by one**: `src/intro.js`
```js
blocks.forEach((b, i) => {
  const [s, e] = at[i], ps = b.querySelectorAll('p');
  tl.set(b, { visibility: 'visible' }, s)
    .to(ps, { opacity: 1, duration: 4, stagger: (e - s - 10) / ps.length }, s)
    .to(b, { opacity: 0, duration: 3 }, e)
    .set(b, { visibility: 'hidden' }, e + 3);
});
```
Lines start at opacity .14 (CSS), so the reader sees what is coming; the stagger is spread over the block's window.

**Photos drift at their own speed**: `src/chapters.js`
```js
ch.querySelectorAll('.ph').forEach((ph) => {
  const sp = +ph.dataset.speed;
  tl.fromTo(ph, { y: () => innerHeight * 0.6 * sp }, { y: () => -innerHeight * 0.8 * sp, duration: 100 }, 0);
});
```
Function values plus `invalidateOnRefresh` keep the distances right after a resize.

**Fanning CSS 3D stacks**: `src/stack.js`
```js
const set = (gap) => cards.forEach((c, i) =>
  gsap.set(c, { x: side * i * 54, z: -i * gap, rotateY: side * 62, yPercent: -50 }));
// ...
.to(o, { gap: 46, duration: 50, onUpdate: () => set(o.gap) }, 10)
```
Tweening one number (`gap`) and re-applying transforms avoids 16 separate tweens per pile.

`prefers-reduced-motion`: Lenis, pinning, reveals and the bloom are off; sections become normal flow with all copy visible and the 3D scenes render a single still frame.

## Why Award-Worthy

1. **A single hue carries the brand.** Everything is green: the room, the bloom, the mint chapters,
   the wordmark. Contrast comes from value (deep forest vs. mint vs. white), not from extra colours.
2. **The hero hands over through light.** The lamp in the room is the same object that becomes the
   white screen, so the jump from 3D scene to flat editorial page reads as one continuous gesture.
3. **Copy stays still, imagery moves.** Centred Japanese text is the fixed point of every chapter;
   skewed photos cross it at different speeds, giving depth without a single heavy effect.
4. **One easing, one rhythm.** Headers, buttons, dots and menu share `cubic-bezier(.3,.26,.38,1)`;
   every chapter uses the same title-then-text structure, so a 500vh scroll stays legible.
5. **Light, bounded WebGL.** Two small scenes (hero room, molecule) render only while visible and
   share the scroll loop; everything else is CSS transforms and clip-paths.

**Anti-patterns it avoids:** no drop shadows or gradient decoration beyond the radial mint wash; no
card grids; no autoplaying video; WebGL never covers the type or blocks input; reveal effects are
not repeated per element but built into one timeline per chapter.

## Credits

- Original: [otsuka-air.jp](https://otsuka-air.jp/) by **SHIFTBRAIN**. Design and content are the
  intellectual property of their creators.
- Recognition: Awwwards Site of the Day, Developer Award.
- This study is an independent clean-room analysis. The rebuild uses a fictional brand and copy,
  images to be generated from `images.json` and open-source fonts; it contains no original code,
  assets or copy.
