---
title: Dropbox Brand
url: https://brand.dropbox.com
studio: Daybreak Studio
awards: [SOTM Feb 2025, SOTD, Developer Award]
year: 2025
category: design-agencies
techniques: [scroll-driven-unfold, tile-mosaic-navigation, page-transitions, mask-reveal, outline-to-fill-text, sticky-scroll-sections, variable-font-playground, cursor-tags, drag-momentum, marquee, canvas-whiteboard, curtain-wipe]
stack: [vanilla-js, css, webflow, lottie, rive, canvas-2d]
---

# Dropbox Brand: clean-room study

A brand-guidelines site where the **navigation is the home page**. A white screen with a drawn logo
scrolls open into an 8-tile colour mosaic around one blue button; the same mosaic is the menu on every
subpage, and clicking a tile turns that tile into the next page's opening. There is no WebGL, no GSAP
and no smooth-scroll library: native scroll, CSS transforms, masks, clip widths and a few Canvas 2D and
Rive pieces. The brand rules are demonstrated by touchable widgets (a bezier editor, a variable-font
playground, magnifying colour chips) instead of described.

Rebuild: [`design-inspiration-rebuilds/design-agencies/dropbox-brand`](https://github.com/raphaelbleier/design-inspiration-skills/tree/main/skills/design-inspiration-rebuilds/design-agencies/dropbox-brand) (fictional content, generated images, open-source fonts; installed with the optional `design-inspiration-rebuilds` skill). Run it with `npm install && npm run dev`.

## Design Tokens

| Role | Value |
|---|---|
| Brand blue (buttons, links, progress) | `#0061fe` |
| Annotation blue (UI on dark) | `#5f9dff` |
| Hairline (translucent / solid / on light) | `#5f9dff66` / `#5f9dff` / `#c5dbff` |
| Dark surface (subpage openings) | `#1e1919` |
| Light surfaces | `#ffffff` `#f7f6f5` |
| Text | `#1a1918` base, `#736c64` subtle light, `#bbb5ae` subtle dark |
| Identity pairs (tile bg / on-colour) | blue `#b4c8e1`/`#283750`, cyan `#3dd3ee`/`#055463`, green `#b4dc19`/`#175641`, orange `#f9a34b`/`#6d2e09`, pink `#ffafa5`/`#892055`, purple `#c8aff0`/`#682760`, red `#fa551e`/`#4e0119`, yellow `#fad24b`/`#684505` |

```css
:root {
  --accent: #0061fe; --line: #5f9dff66; --dark: #1e1919;
  --nav-easing: cubic-bezier(.4, 0, .2, 1);
  --swoop: cubic-bezier(.6, 0, 0, 1);
  --tile-transition: .35s var(--nav-easing);
  --nav-tile-gap: 10px;  --button-size: 90px;      /* 5px / 64px at <=991px */
  --opening-margin: 120px; --opening-gutter: 24px;  /* 60/12 at <=991, 32 at <=767 */
}
```

- **Type:** a variable wide grotesk for display (original: DB Sharp Grotesk, wght 250-900 plus a
  `wdth` axis; substitute: Bricolage Grotesque) at weight ~500-520 and width 100-108. Body and UI in a
  neutral grotesk (original: Atlas Grotesk; substitute: Inter). Mono readouts in Noto Sans Mono.
  Script words, if any, use Caveat Brush rather than traced lettering.
- **Scale (1440 / 390):** page title `clamp(0, 10vw, 200px)` = 144px / 46.8px with `-0.02em` tracking
  and `text-wrap: balance`; h1 60 / 36, h2 40 / 28, body 14/22, annotation 12/20.
- **Grid:** 12 columns, 120px margins and 24px gutters on the subpage openings. Everything is in
  `px`; fluidity comes from vw maths and one `clamp`.
- **Shape:** the mosaic has 8px radii on its four outer corners only, inner corners 0. Hairlines are
  1px. No shadows on the UI.

## Motion Spec

| What | Trigger | Animation | Duration / easing | Rebuild file |
|---|---|---|---|---|
| Home scroll curve | scroll | raw scroll progress is remapped by a hand-rolled bezier solver before it drives anything | `cubicBezier(1, .25, .85, 1)` | `src/easing.js` |
| Tile unfold | scroll over a 300vh runway | 8 tiles scale 2 to 1 and fly in along per-tile vectors; gridlines counter-scale to stay 1px; tiles become clickable above 0.95 | scrubbed, rAF-throttled | `src/home.js`, `src/tiles.js` |
| Centre button states | scroll | white 800px square, then blue 500px, then linear shrink to the 90px button; the two intro headlines cross-fade | .6s `cubic-bezier(.5,0,.2,1)`; titles .2s | `src/home.js` |
| Logo load-in | page load | 1px stroke draws, fills, then shrinks to the bottom-left mark while blue gridlines sweep in | draw 1.25s `cubic-bezier(.4,0,.3,1)`; grid 3s `cubic-bezier(.5,0,0,1)` | `src/home.js`, `src/brandmark.js` |
| Tile hover | hover | tile inverts to near-black with white text; per-tile icons animate | .35s `cubic-bezier(.4,0,.2,1)` | `src/tiles.js`, `src/styles/tiles.css` |
| Rail and section colour | scroll | left rail (bottom bar at <=991px) shows page title, progress bar, and takes the colour of the section under the viewport; a luminance test picks the Partner Info colour | .2s ease | `src/shell.js`, `src/styles/shell.css` |
| Menu open / close | button, Escape, wheel overscroll | tiles return from the "yeeted" pose; the button warps with a squash-and-stretch keyframe set; overscroll fills a conic ring that opens the menu at 100% | open .4s linear; tiles .5s `cubic-bezier(.6,0,0,1)` | `src/shell.js`, `src/tiles.js` |
| Tile-to-page transition | tile click (desktop) | clicked tile grows to full viewport on dark, its title scales to 4x into the destination title position, other tiles fade, navigation after 600ms | .6s `cubic-bezier(.65,0,.15,1)` | `src/shell.js`, `src/styles/shell.css` |
| Subpage opening load-in | fonts ready | h-lines `scaleX` in at i*200ms, v-lines at i*200+100ms, doodles, tags and title at i*80+160ms | .7s `cubic-bezier(.6,0,.6,1)` | `src/opening.js`, `src/openings.js` |
| Doodles and cursor tags | static / hover | icon-like stroke doodles; collaboration-style cursor pills (10px radius, 24px badge) | colour .3s ease-in-out | `src/fx/doodles.js`, `src/fx/cursor-tags.js` |
| Partner Info outro | button | panel slides in leaving a 60px strip; hovering the credits row flies in 10 random cursor tags | panel .7s `cubic-bezier(.6,0,0,1)`; tags .4s `cubic-bezier(.15,.5,.05,1)`, 0-250ms random delay | `src/fx/outro.js` |
| Scroll toolkit | scroll | rAF-throttled handler and sticky-section progress `-top / (height - vh)` shared by every page | n/a | `src/fx/scroll.js` |
| Outline to fill headline | scroll in sticky section | each word is outlined text with a masked solid copy; `mask-position` sweeps; Color page background steps through four stages | scrubbed, `easeOutQuad` | `src/fx/mask-reveal.js`, `src/pages/color.js` |
| Framework: whiteboard | pointer | Canvas 2D marker (`#C8AFF0`, 7px) and 50px eraser, undo/redo capped at 20 | live | `src/fx/whiteboard.js` |
| Framework: photo cards | scroll in 200vh sticky | 8 cards translate in vw/dvh and rotate with `progress^2`; ellipse draws via `stroke-dashoffset` | scrubbed | `src/pages/framework.js` |
| Voice: Generate options | click | fake-AI line streamed word by word | 400ms start, then 30 + rand*150ms per word | `src/pages/voice-and-tone.js` |
| Logo: six snap states | scroll | sticky stage; state is the section at viewport centre; CSS layer cross-fade stands in for the Rive state machine | `scroll-snap-type: y mandatory` | `src/pages/logo.js` |
| Typography: playground and fill | click, slider, scroll | wght, wdth and slant sliders plus Randomize; per-letter scroll fill from outline to solid | scrubbed, `easeOutQuad` | `src/pages/typography.js` |
| Iconography: stack and marquees | click, drag | folder cards fly in and prune past 15; three marquees at 125/110/95 px/s with a 4s ease-out-quint intro; hover letter shuffle | intro 4000ms | `src/pages/iconography.js` |
| Drag with momentum | pointer | release velocity x50, friction .95 per frame (marquees, colour chips, customer carousel) | per frame | `src/fx/drag-scroller.js` |
| Color: dropper and chips | hover, click | dropper recolours the opening; magnifying chips, click copies hex | .2s | `src/pages/color.js` |
| Imagery: curtain wipe | scroll in 300vh sticky | cover shrinks to 0 width; carousels cross-fade every 3s with 150ms stagger | `easeInOutQuint` | `src/pages/imagery.js` |
| Motion: timeline and bezier | scroll, drag | word mask reveal, growing boxes, mm:ss readout over 10:00, zoom slider, live frame-time readout at 24fps | scrubbed; zoom .2s ease | `src/pages/motion.js` |
| Palette and spacing | n/a | tokens, grid helpers and breakpoints (991 / 767) | n/a | `src/styles/tokens.css`, `src/styles/base.css` |

### Key excerpts

**Home scroll curve**: `src/easing.js`
```js
export function cubicBezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t) => ((ax * t + bx) * t + cx) * t;
  const sy = (t) => ((ay * t + by) * t + cy) * t;
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let lo = 0, hi = 1, t = x;
    for (let i = 0; i < 12; i++) {           // 12 subdivisions
      t = (lo + hi) / 2;
      sx(t) < x ? (lo = t) : (hi = t);
    }
    return sy(t);
  };
}
export const homeCurve = cubicBezier(1, 0.25, 0.85, 1);
```
Raw scroll progress goes through `homeCurve` once per frame; its output drives tile scale, tile translation and the button states.

**Scroll toolkit (no smooth-scroll library)**: `src/fx/scroll.js`
```js
export function onFrame(fn) {
  let t = false;
  const run = () => { t = false; fn(); };
  const req = () => { if (!t) { t = true; requestAnimationFrame(run); } };
  addEventListener('scroll', req, { passive: true }); addEventListener('resize', req);
  fn();
}
export const stickyProgress = (el) => {
  const r = el.getBoundingClientRect();
  return clamp(-r.top / Math.max(1, r.height - innerHeight));
};
```

**Outline to fill mask**: `src/styles/pages.css`, `src/fx/mask-reveal.js`
```css
.w { position: relative; display: inline-block; color: transparent; -webkit-text-stroke: 1.2px var(--c1-fg); }
.w::after { content: attr(data-w); position: absolute; left: 0; top: 0; color: var(--c1-fg); -webkit-text-stroke: 0;
  mask: linear-gradient(90deg, #000 50%, transparent 50%) 0 0 / 200% 100%;
  mask-position: var(--mp, 100%) 0; }
```
```js
// words revealed in sequence: global progress g is split by cumulative letter counts
const p = easeOutQuad(clamp((g - a) / (b - a)));
w.style.setProperty('--mp', `${100 * (1 - p)}%`);
```
The mask is a hard-edged gradient at 200% width, so moving `mask-position` from 100% to 0% wipes the solid copy across the outlined word.

**Subpage opening stagger**: `src/opening.js`
```js
const ease = 'cubic-bezier(.6,0,.6,1)';
const set = (el, d) => {
  el.style.transition = `opacity .7s ${d}ms ${ease}, transform .7s ${d}ms ${ease}, background-color .3s ${d + 400}ms ease-in-out`;
};
op.querySelectorAll('.ol-h').forEach((el, i) => set(el, i * 200));
op.querySelectorAll('.ol-v').forEach((el, i) => set(el, i * 200 + 100));
op.querySelectorAll('.title-wrap, .oel').forEach((el, i) => set(el, i * 80 + 160));
requestAnimationFrame(() => op.classList.remove('pre'));
```

**Drag with momentum**: `src/fx/drag-scroller.js`
```js
const tick = () => {
  s.v *= friction;                       // .95 per frame
  apply(s.x + s.v);
  if (Math.abs(s.v) > 0.1) raf = requestAnimationFrame(tick);
};
// pointermove
s.v = (dx / dt) * 50 / 3;                // release velocity scaled by the original's x50
```

`prefers-reduced-motion`: the tile-to-page transition, carousels, marquees and the type contrast card
are disabled or fixed; content is simply visible. No horizontal overflow at 768 or 390 on any page.

## Why Award-Worthy

1. **The menu is the home page and the transition.** Scroll pulls the mosaic out of a white screen;
   clicking a tile makes that very tile the next page's opening, with the title landing in the same
   column on the same dark background. No spinner, no wipe, and the overscroll-to-open and button warp
   reuse the same motion, so navigation feels like one physical system.
2. **The guidelines demonstrate themselves.** A timeline and bezier editor, a live variable-font
   playground, magnifying colour chips and a fake "Generate options" streamer: every rule is something
   you can touch.
3. **A strict, tiny system.** One blue, one near-black, eight identity pairs, hairline grids and one
   variable typeface. Constraint reads as confidence, and the 12-column vw maths holds at any width.
4. **Native performance and robustness.** No scroll-jacking and no WebGL; rAF-throttled handlers write
   transforms and masks. Reduced motion is honoured, hidden layers are `inert`, and transitions are
   suppressed during resize.
5. **Collaboration metaphors as brand.** Cursor tags, doodles, selection handles and timelines make the
   brand feel like the product: a shared workspace.

**Anti-patterns it avoids:** no custom cursor replacing the system one; no preloader percentage; no
fake-smooth scroll lag; no autoplay audio; no blocking WebGL; no horizontal overflow; no hidden
navigation (button and Escape always reach the menu).

## Credits

- Original: [brand.dropbox.com](https://brand.dropbox.com) by **Daybreak Studio**. Design and content are
  the intellectual property of their creators.
- Recognition: Awwwards Site of the Month (Feb 2025), Site of the Day, Developer Award.
- This study is an independent clean-room analysis. The rebuild uses a fictional brand, generated
  images and open-source fonts; it contains no original code, assets or copy.
