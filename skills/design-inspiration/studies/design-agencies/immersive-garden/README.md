---
title: Immersive Garden
url: https://immersive-g.com
studio: Immersive Garden
awards: [SOTM Jan 2025, SOTD, Developer Award]
year: 2025
category: design-agencies
techniques: [webgl, shader, flowmap, bas-relief, smooth-scroll, scroll-speed-modes, text-reveal, page-transitions, mask-transition, custom-cursor, ui-in-webgl]
stack: [three, gsap, scrolltrigger, splittext, lenis, vite]
---

# Immersive Garden — clean-room study

An agency portfolio drawn almost entirely inside one fixed WebGL canvas. Behind every page sits a
**baked plaster bas-relief** of flowers and animals that stays nearly flat until the cursor (or an
autonomous ghost cursor) pushes it out of the wall. On top: a restrained editorial layer, a
light grey page, near-black ink, one Times-like serif for statements and one Helvetica-like grotesk
for all UI. Hard scrolling zooms the whole site out into a title index.

Rebuild: [`design-inspiration-rebuilds/design-agencies/immersive-garden`](https://github.com/raphaelbleier/design-inspiration-skills/tree/main/skills/design-inspiration-rebuilds/design-agencies/immersive-garden) (fictional content, generated images, open-source fonts; installed with the optional `design-inspiration-rebuilds` skill). Run it with `npm install && npm run dev`.

## Design Tokens

| Role | Value |
|---|---|
| Ink (text, footer, About) | `#030303` |
| Page grey (body, loader, light text on dark, hairlines on dark) | `#e8e8e8` |
| Projects list page | `#f3f3f3` |
| Fast-mode scroll dots | `#a6a6a6` |
| Fluid tint (edge fringe on the relief) | `rgb(122,191,197)` |
| About light / bloom / fade | `#e6cca2` / `#362c1f` / `#f5a75f` |

```css
:root {
  --ink: #030303; --grey: #e8e8e8;
  --slow: cubic-bezier(.4, 0, 0, 1);    /* slow mode, state returns, circle draw */
  --fast: cubic-bezier(.2, 0, 0, 1);    /* fast mode zoom, label letters */
  --page: cubic-bezier(.445, .05, .55, .95);
}
/* 12 columns, 16px gap, 16px side padding (32px at 1024 and below), max 2088px */
.grid { display: grid; grid-template-columns: repeat(12, 1fr); column-gap: 16px; }
```

- **Type:** a Times-like serif (original: PS Times; substitute: Newsreader, Instrument Serif or
  Libre Caslon Text) for headlines, statements, list names and the footer CTA. A Helvetica Neue
  Regular (substitute: Inter or Arimo) for every UI string at 14px, cursor label at 12px.
- **Scale:** all `vw`-based with pixel floors and a cap at 1915px (x1.33). Hero
  `clamp(44px, 3.889vw, 74.48px)` / 1.1, large statement `clamp(34px, 3.056vw, 58.52px)`, body
  `clamp(23px, 1.944vw, 37.24px)`, small label `clamp(20px, 1.528vw, 29.26px)`.
  `html` stays 16px; nothing scales through the root.
- **Spacing:** project block gap `11.111vw`, margin between projects `36.111vw`, text block
  `min-height: 55vw`. Media offsets come in `vw` steps (±5.556, ±16.667, ±27.778).
- **Shape:** no radii, no shadows, 1px underlines only. Depth comes from the relief and bloom.
- **Opacity roles:** hover `.6`, secondary text `.5`, unselected list type `.1`.

## Motion Spec

| What | Trigger | Animation | Duration / easing | Rebuild file |
|---|---|---|---|---|
| Intro loader | page load | logo mask wipes in, baseline words stagger in, 0-100 counter; layer bg then fades and the identical DOM underneath takes over | logo 2.5s `quart.out`; words 1s `sine.inOut`, stagger .1; bg fade 1.2s `sine.inOut`; canvas fade 1.75s, zoom 2s `power1.out` | `src/loader.js` |
| Smooth scroll | always | Lenis `{ lerp: .05, wheelMultiplier: 1 }` on desktop, native-like on touch; driven by `gsap.ticker` | — | `src/scroll.js` |
| Plaster relief | always, cursor, scroll | tiled bas-relief; a 256px ping-pong flowmap stores cursor extrusion, vertex z scales `mix(.05, 1, extrude)`; scroll raises extrusion globally | continuous | `src/relief.js` |
| Ghost cursor | idle | a second autonomous pointer draws 1-3 rough wiggles every 1-3s so the plaster ripples alone | .7-1s each, `RoughEase` | `src/ghost.js` |
| Fast / slow modes | sustained scroll speed | speed >= .99 enters fast (reverts under .75, or 1s after hitting a page end); text scales to .5 and fades, media shrink and shift, giant titles appear, UI fades | fast 1.5s `(.2,0,0,1)`; slow 1.3s `(.4,0,0,1)`; UI .5s | `src/fast-mode.js` |
| Text reveal | enters viewport | per-line rise out of a mask while colour travels `#a6a6a6` to ink (DOM stand-in for the MSDF per-character reveal) | rise 1.4s `power3.out`, colour 1.2s `sine.inOut`, stagger .12 | `src/text-reveal.js` |
| Media hover | hover | plane scales to .97, slow breathe, darkening, soft spot around the cursor | 2s ease | `src/media-hover.js` |
| Showreel | hover, click | hover darkens and cursor label reads "Play"; click expands the plane to a fullscreen pop-in in two beats | .97 scale 2s; expand 1s then 1.5s `power2.inOut`; controls 2.25s | `src/showreel.js` |
| Custom cursor | pointer move | 3px dot lerps at .1; 12px label letters fade in with stagger `.4/length` | in .8s, out .5s | `src/cursor.js` |
| Ink-smoke mask | route change, About | black noisy blob grows from the top-right corner via CSS `mask-image` | About open 2.5s `(.01875,.08,0,.991875)`; close 1s linear | `src/ink.js` |
| About overlay | Menu click | ink reveals a dark relief scene, background dives in, nav items rise | dive 4s `power2.out`; items 1.2s `power3.out`, stagger .09 | `src/about.js` |
| Page transitions | link click | ink covers, hash route swaps, ink recedes | see ink.js | `src/router.js` |
| Footer | scroll to end | two black screens; dark flower photo with a brightened copy revealed by a radial mask at the pointer | hover .6 opacity, .5s | `src/footer.js` |
| Sound toggle | click | ring draws with `stroke-dashoffset`; a generated pad fades in | .6s `(.4,0,0,1)` | `src/sound.js` |
| Easing vocabulary | everywhere | `slow`, `fast`, `inkMask`, `page` registered once as CustomEase | — | `src/easing.js` |
| Hover states | hover | opacity to .6; list rows dim siblings to .1 and draw an underline from the right | .3s / .2s | `src/styles.css`, `src/views/projects.js` |

### Key excerpts

**Smooth scroll and speed model**: `src/scroll.js`
```js
lenis = new Lenis({ lerp: state.fine ? 0.05 : 1, wheelMultiplier: 1, syncTouch: false, smoothWheel: true });
lenis.on('scroll', (l) => { state.scroll = l.scroll; state.velocity = l.velocity; ScrollTrigger.update(); });
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
// ...
gsap.ticker.add((_, dtMs) => {
  const f60 = Math.min(dtMs / 16.67, 3);
  const v = lenis ? Math.abs(lenis.velocity) : 0;
  const target = Math.min(1, v / 38);
  state.speed += (target - state.speed) * (1 - Math.pow(0.9, f60));
});
```
`state.speed` is the scroll intensity that decides slow vs fast mode; the frame-rate-independent lerp keeps it stable at any refresh rate.

**Fast / slow mode switch**: `src/fast-mode.js`
```js
if (!state.fast && state.speed >= 0.99) set(true);
else if (state.fast && !forced && state.speed < 0.75) set(false);
// ...
const row = lis[0].offsetHeight;
ty += (-(best + .5) * row - ty) * 0.08;
list.style.transform = `translateY(${ty}px)`;
```
Hysteresis (.99 in, .75 out) stops flicker; the titles list lerps at .08 toward the project block nearest the viewport centre.

**Easing vocabulary**: `src/easing.js`
```js
CustomEase.create('slow', '.4,0,0,1');
CustomEase.create('fast', '.2,0,0,1');
CustomEase.create('inkMask', '.01875,.08,0,.991875');
CustomEase.create('page', '.445,.05,.55,.95');
```

**Text reveal**: `src/text-reveal.js`
```js
SplitText.create(el, {
  type: 'lines', mask: 'lines', autoSplit: true,
  onSplit(self) {
    return gsap.fromTo(self.lines, { yPercent: 105, color: '#a6a6a6' },
      { yPercent: 0, color, duration: 1.4, ease: 'power3.out', stagger: 0.12,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  },
});
```

**Ink-smoke mask**: `src/ink.js`
```js
const o = { s: parseFloat(el.style.getPropertyValue('--s')) || 0 };
return gsap.to(o, { s: to, duration, ease, overwrite: true,
  onUpdate: () => el.style.setProperty('--s', `${o.s}px`) });
// full cover: Math.hypot(innerWidth, innerHeight) * 5.3
```
A CSS `mask-image` blob is sized `--s` and centred on the top-right corner; 5.3x the viewport diagonal guarantees full cover.

**Relief extrusion shader**: `src/relief.js`
```glsl
float e = flowAt(vUv);
float n = fbm(pos / (uSize.x * .16) + uTime * .06);
float ext = e + uSpeed * .5 * (.55 + .9 * n) + uFast * (.75 + .6 * n) + uStatic * smoothstep(.42, .7, n);
ext = clamp(ext, 0., 1.25);
float d = texture2D(tDepth, tile(pos)).r;
float m = smoothstep(.08, .32, d * ext * 1.9);
```
Flowmap, scroll speed and fast mode all feed one extrusion value that thresholds the baked depth map.

The original draws the UI and all text in WebGL; the rebuild keeps those parts in the DOM and
reserves WebGL for the relief. `prefers-reduced-motion` is read into `src/state.js` so
effects can fall back to visible, static content.

## Why Award-Worthy

1. **One continuous world behind every page.** A sculpted relief that answers the cursor, scroll
   speed and idle time means the site never reads as a flat web layout.
2. **Navigation as a gesture.** Scroll hard and the site pulls back into a title index; slow down
   and it returns to detail. Two named curves (`slow`, `fast`) carry the whole feeling.
3. **Restraint in the UI.** Two typefaces, a grey and a near-black, 14px labels, hairline
   underlines. Client work supplies the colour. The UI hides itself in fast mode and under About.
4. **Transitions are authored.** One ink-smoke mask is reused for About and for route changes,
   and the video pop-in expands from the same plane it was clicked on.
5. **Craft in small things.** Breathing image hover, a faint motion smear on the UI layer,
   enlarged tap targets, and a ghost cursor that keeps the surface alive.

**Anti-patterns it avoids:** no drop shadows or rounded corners; no template card grids; no
scroll-jacking that fights the user (Lenis plus speed-based modes); no layout shift (everything is
`vw`-based); no horizontal overflow at 1440, 768 or 390px.

## Credits

- Original: [immersive-g.com](https://immersive-g.com) by **Immersive Garden**. Design and content
  are the intellectual property of their creators.
- Recognition: Awwwards Site of the Month (Jan 2025), Site of the Day, Developer Award.
- This study is an independent clean-room analysis. The rebuild uses a fictional studio, invented
  copy, generated images and open-source fonts; it contains no original code, assets or copy.
