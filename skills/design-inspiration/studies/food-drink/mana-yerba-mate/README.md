---
title: Mana Yerba Mate
url: https://en.manayerbamate.com/
studio: Louis Paquet, Michael Garcia, Pam
awards: [SOTY 2023, SOTD, Developer Award]
year: 2023
category: food-drink
techniques: [webgl, 3d-model, scroll-pinning, rotating-ring, smooth-scroll, page-transitions, lottie, parallax, easter-egg]
stack: [three, gltf, gsap, scrolltrigger, lenis, lottie]
---

# Mana Yerba Mate — clean-room study

A beverage brand site that behaves like a toy. The hero is a **real-time 3D can** floating over a
full-bleed, flat-colour illustration that changes with every flavor. Scrolling tips the can over,
opens it, and hands the page to a **pinned ring of cards** that rolls past on a giant circle. Everything
else is warm cream, hard-shadow pill buttons, one light-weight grotesk and a footer you can play.

Rebuild: [`design-inspiration-rebuilds/food-drink/mana-yerba-mate`](https://github.com/raphaelbleier/design-inspiration-skills/tree/main/skills/design-inspiration-rebuilds/food-drink/mana-yerba-mate) (fictional brand and copy, images listed in `images.json` for later generation, open-source fonts; installed with the optional `design-inspiration-rebuilds` skill). Run it with `npm install && npm run dev`.

## Design Tokens

| Role | Value |
|---|---|
| Ink (text, hairlines, button shadow on light) | `#0e0e0e` |
| Cream (page) | `#fef7e6` |
| Yellow (selection, round buttons, feed section) | `#ffd372` |
| Navy (announcement bar, button shadow) | `#2b3d73` |
| Coral (primary button) | `#f15b40` |
| Pink-red / Forest / Sage / Sky / Pink | `#e72f63` / `#195e1c` / `#acd084` / `#88c1f8` / `#f6b1cf` |

```css
:root {
  --wrapper: 94.6vw; --gutter: 2.7vw;
  --col: calc((var(--wrapper) - 11 * var(--gutter)) / 12);   /* 12-column grid, all in vw */
}
body { font: 400 clamp(18px, 1.98vw, 38px) / 1.16 "Neue Montreal"; background: #fef7e6; color: #0e0e0e; }
.titre     { font: 300 clamp(65px, 16.2vw, 317px) / .85; text-transform: uppercase; }
.grosTitre { font: 300 clamp(80px, 23.2vw, 446px) / 1;   text-transform: uppercase; }
.btnOmbre > span { background: #f15b40; border: 1px solid #2b3d73; border-radius: 2em; padding: 0 1.3em; transition: transform .1s; }
.btnOmbre::after { background: #2b3d73; transform: translateY(.15em); }   /* hard offset shadow */
.btnOmbre:hover span { transform: translateY(.15em); }                 /* label sinks into it */
```

- **Type:** one grotesk (original: Neue Montreal; substitute: Inter Tight) at weight **300** for all
  display type, uppercase, `line-height: 0–1`. Body 400. The giant word is `23.2vw`, so it always spans the screen.
- **Colour logic:** every flavor owns one background (sage, yellow, sky, pink) plus one dark accent for its
  button, card header and doodles. The chrome (cream, ink, navy shadow) never changes.
- **Shape:** pills (`2em` radius), `0.75–0.9em` cards, 1px ink hairlines between full-bleed sections, no blur shadows.
  Depth is the single hard `.15em` offset under buttons.
- Layout is `vw`-based with `clamp()` so the composition scales as one piece; below 768px the gutter becomes a fixed 20px.

## Motion Spec

| What | Trigger | Animation | Duration / easing | Rebuild file |
|---|---|---|---|---|
| Smooth scroll | always | Lenis `{ lerp: .1, smoothWheel }`, driven by `gsap.ticker`, `lagSmoothing(0)` | — | `src/scroll.js` |
| Intro | load | coloured wordmark letters pop `scale .8 → 1`, then a full-bleed circle in the hero colour grows over them | letters `elastic.out(.34,.26)` stagger .08; circle .9s `power4.inOut` | `src/intro.js` |
| 3D can | always, cursor | glTF can with reflections; tilts ±.22 rad toward the cursor, lerp .08 | continuous | `src/can.js` |
| Flavor switch | arrow click | can does one full turn, label swaps at the half turn, background colour tweens, illustration crossfades with a 1.06 → 1 settle, button recolours | .9s `power3.inOut`; bg .6s `power2.inOut` | `src/hero.js`, `src/can.js` |
| Hero → open can | scroll, scrubbed | can tips over (z spin), drops to the bottom edge, top turns toward the camera, pull-tab lifts | scrub 1 | `src/can.js` |
| Card ring | scroll, pinned | four cards sit on a circle whose centre is below the viewport; the ring rotates 275° over `+=450%`, cards stay tangent so they tilt; a sage arc scales in at the top | scrub .8, linear | `src/circle.js` |
| Giant word | enters at 85% | letters rise out of a clipped line | .9s `power4.out`, stagger .05 | `src/flavors.js` |
| Product slider | arrow click | three full-height colour tiles, one tile per click | .7s `power4.inOut` | `src/flavors.js` |
| Image duo / feed photos | scroll, scrubbed | duo images shift `-100px → 0`; tilted feed photos drift at different speeds | scrub, linear | `src/parallax.js` |
| Page transition | link click | coloured circle scales over the page, navigation happens under it, next page shrinks it away | .8s `power4.inOut` | `src/transition.js` |
| Footer game | Space / tap | figure walks (CSS), jumps up and lands with a bounce | up .35s `power2.out`, down .45s `bounce.out` | `src/jump.js` |
| Buttons | hover | label sinks `.15em` into its hard shadow | .1s | `src/style.css` |

### Key excerpts

**Smooth scroll on the GSAP ticker**: `src/scroll.js`
```js
lenis = new Lenis({ lerp: 0.1, smoothWheel: true, autoRaf: false });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.lagSmoothing(0);
gsap.ticker.add((time) => {
  if (lenis) lenis.raf(time * 1000);
  frameCallbacks.forEach((fn) => fn(time));     // the Three.js render runs in the same tick
});
```
One loop for scroll, ScrollTrigger and WebGL keeps the pinned ring and the can in lockstep.

**Scrubbed can pose**: `src/can.js`
```js
tl.to(pose, { z: -1.1, y: -1.2, duration: 1, ease: 'power1.inOut' })
  .to(pose, { z: 0, y: -2.4, x: 0.75, s: 1.25, tab: 1.15, duration: 1, ease: 'power1.inOut' });
// the render loop reads the plain `pose` object every frame:
can.rotation.set(pose.x + ty * 0.22, pose.spin + tx * 0.22, pose.z, 'YXZ');
tab.rotation.x = -pose.tab;
```
GSAP animates a plain object, the render loop copies it onto the mesh, so scroll, cursor tilt and flavor spin all add up without fighting.

**Flavor switch with a texture swap at the half turn**: `src/can.js`
```js
gsap.to(pose, {
  spin: '+=' + Math.PI * 2, duration: 0.9, ease: 'power3.inOut',
  onUpdate() {
    if (!half.done && this.progress() > 0.5) { half.done = true; mats[0].map = textures[i]; onMid?.(); }
  },
});
```
The swap happens while the can is edge-on, so it reads as a different can rather than a texture change.

**Card ring**: `src/circle.js` and `src/style.css`
```css
.ring { position: absolute; left: 50%; top: 118vh; --R: 106vh; --cw: 26vw; }   /* centre below the viewport */
.cc   { position: absolute; top: calc(var(--R) * -1); transform-origin: calc(var(--cw) / 2) var(--R); }
```
```js
cards.forEach((c, i) => gsap.set(c, { rotation: i * 55 }));
tl.fromTo('#ring', { rotation: 55 }, { rotation: -220, duration: 1, ease: 'none' }, 0);
```
Each card's transform-origin is the ring centre, so rotating the ring parent is all it takes.

**Hard-shadow button**: `src/style.css`
```css
.btn-shadow::after { content: ''; position: absolute; inset: 0; border-radius: 2em; background: var(--navy);
  transform: translateY(.15em); z-index: -1; }
.btn-shadow:hover > span { transform: translateY(.15em); }
```

`prefers-reduced-motion`: smooth scroll, intro, pinning, scrub and word reveals are off; the can renders once in
the hero and the cards stack as a plain grid.

## Why Award-Worthy

1. **A product you can turn.** The 3D can is not a decoration: it is the carousel, the scroll narrator and the
   cursor toy. The brand's whole shelf is one object that is always on screen.
2. **Colour as navigation.** Four flavors, four full-page palettes. Changing flavor re-themes the whole hero in
   0.6s, so the site never feels like a template with a swapped photo.
3. **One idea per scroll section.** The can tips and opens, a ring of cards rolls past it, a word fills the
   screen, a slider takes over. Each beat is a different motion, but they share easing and hard-edged shapes.
4. **Light-weight type at huge scale.** Weight 300 caps at 16–23vw read as friendly and confident, against tiny
   400-weight labels.
5. **Craft in the corners.** Hard-shadow buttons, a circle page wipe, a footer you can jump in: details that make
   the site feel handmade.

**Anti-patterns it avoids:** no blur shadows or glassmorphism; no stock photography in the hero; no generic
fade-up reveals; the WebGL canvas never blocks input (`pointer-events: none`); no autoplay audio.

## Credits

- Original: [en.manayerbamate.com](https://en.manayerbamate.com/) by **Louis Paquet, Michael Garcia, Pam**.
  Design and content are the intellectual property of their creators.
- Recognition: Awwwards Site of the Year 2023, Site of the Day, Developer Award.
- This study is an independent clean-room analysis. The rebuild uses a fictional brand, listed (not yet generated)
  images and open-source fonts; it contains no original code, assets or copy.
