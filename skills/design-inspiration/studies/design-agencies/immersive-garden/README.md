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

Rebuild: [`rebuild/`](rebuild/) (fictional studio "Lumen Orchard", invented copy and projects,
generated images, open-source fonts). Run it with `npm install && npm run dev`.

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

| What | Trigger | Animation | Duration / easing | Rebuild code |
|---|---|---|---|---|
| Intro loader | page load | logo mask wipes in, baseline words stagger in, 0-100 counter; layer bg then fades and the identical DOM underneath takes over | logo 2.5s `quart.out`; words 1s `sine.inOut`, stagger .1; bg fade 1.2s `sine.inOut`; canvas fade 1.75s, zoom 2s `power1.out` | `rebuild/src/loader.js` |
| Smooth scroll | always | Lenis `{ lerp: .05, wheelMultiplier: 1 }` on desktop, native-like on touch; driven by `gsap.ticker` | — | `rebuild/src/scroll.js` |
| Plaster relief | always, cursor, scroll | tiled bas-relief; a 256px ping-pong flowmap stores cursor extrusion, vertex z scales `mix(.05, 1, extrude)`; scroll raises extrusion globally | continuous | `rebuild/src/relief.js` |
| Ghost cursor | idle | a second autonomous pointer draws 1-3 rough wiggles every 1-3s so the plaster ripples alone | .7-1s each, `RoughEase` | `rebuild/src/ghost.js` |
| Fast / slow modes | sustained scroll speed | speed >= .99 enters fast (reverts under .75, or 1s after hitting a page end); text scales to .5 and fades, media shrink and shift, giant titles appear, UI fades | fast 1.5s `(.2,0,0,1)`; slow 1.3s `(.4,0,0,1)`; UI .5s | `rebuild/src/fast-mode.js` |
| Text reveal | enters viewport | per-line rise out of a mask while colour travels `#a6a6a6` to ink (DOM stand-in for the MSDF per-character reveal) | rise 1.4s `power3.out`, colour 1.2s `sine.inOut`, stagger .12 | `rebuild/src/text-reveal.js` |
| Media hover | hover | plane scales to .97, slow breathe, darkening, soft spot around the cursor | 2s ease | `rebuild/src/media-hover.js` |
| Showreel | hover, click | hover darkens and cursor label reads "Play"; click expands the plane to a fullscreen pop-in in two beats | .97 scale 2s; expand 1s then 1.5s `power2.inOut`; controls 2.25s | `rebuild/src/showreel.js` |
| Custom cursor | pointer move | 3px dot lerps at .1; 12px label letters fade in with stagger `.4/length` | in .8s, out .5s | `rebuild/src/cursor.js` |
| Ink-smoke mask | route change, About | black noisy blob grows from the top-right corner via CSS `mask-image` | About open 2.5s `(.01875,.08,0,.991875)`; close 1s linear | `rebuild/src/ink.js` |
| About overlay | Menu click | ink reveals a dark relief scene, background dives in, nav items rise | dive 4s `power2.out`; items 1.2s `power3.out`, stagger .09 | `rebuild/src/about.js` |
| Page transitions | link click | ink covers, hash route swaps, ink recedes | see ink.js | `rebuild/src/router.js` |
| Footer | scroll to end | two black screens; dark flower photo with a brightened copy revealed by a radial mask at the pointer | hover .6 opacity, .5s | `rebuild/src/footer.js` |
| Sound toggle | click | ring draws with `stroke-dashoffset`; a generated pad fades in | .6s `(.4,0,0,1)` | `rebuild/src/sound.js` |
| Easing vocabulary | everywhere | `slow`, `fast`, `inkMask`, `page` registered once as CustomEase | — | `rebuild/src/easing.js` |
| Hover states | hover | opacity to .6; list rows dim siblings to .1 and draw an underline from the right | .3s / .2s | `rebuild/src/styles.css`, `rebuild/src/views/projects.js` |

The original draws the UI and all text in WebGL; the rebuild keeps those parts in the DOM and
reserves WebGL for the relief. `prefers-reduced-motion` is read into `rebuild/src/state.js` so
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
