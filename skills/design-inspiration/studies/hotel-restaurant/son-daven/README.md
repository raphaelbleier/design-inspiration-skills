---
title: Son Daven
url: https://sondaven.com/en
studio: The First The Last
awards: [SOTM Jun 2026, SOTD, Developer Award]
year: 2026
category: hotel-restaurant
techniques: [webgl, shader, halftone, scroll-pinning, text-reveal, page-transitions, smooth-scroll, marquee, drag-interaction]
stack: [gsap, scrolltrigger, splittext, flip, draggable, lenis, webgl, vite]
---

# Son Daven — clean-room study

A resort-hotel and investment site whose identity is one rendering idea: a **vertical-bar halftone**.
Photos, the hero logotype and a pine-tree silhouette are all quantised to a grid and redrawn as
vertical bars (dark pixels give wide bars, bright pixels thin ones) by a single small WebGL
fragment shader. Around it sits a quiet two-colour system, sand and warm near-black, with a wide
classical display serif against an extended geometric sans, everything uppercase.

Rebuild: [`design-inspiration-rebuilds/hotel-restaurant/son-daven`](https://github.com/raphaelbleier/design-inspiration-skills/tree/main/skills/design-inspiration-rebuilds/hotel-restaurant/son-daven) (fictional content, generated images, open-source fonts; installed with the optional `design-inspiration-rebuilds` skill). Run it with `npm install && npm run dev`.

## Design Tokens

| Role | Value |
|---|---|
| Sand (light theme background, bar fill) | `#a89474` |
| Ink (dark theme background, text on sand) | `#2c2824` |
| White (text on photos) | `#fff` |
| Alphas | sand `50%` / `10%`, ink `50%` / `10%`, white `60%` / `20%` |

```css
:root {
  --sand: #a89474; --ink: #2c2824;
  --dur-s: .4s; --dur-m: .8s; --dur-l: 1.2s;     /* the only three durations */
  --px: calc(1rem / 14.4);                        /* 1 design px at a 1440 layout */
  --ease-inout: cubic-bezier(.76, 0, .24, 1);
  --ease-out: cubic-bezier(.25, 1, .5, 1);
}
html { font-size: 1vw; }                          /* 1rem = 1% of viewport width */
@media (max-width: 991px) { :root { --px: calc(1rem / 3.84); } }   /* design width 384 */
```

- **Sizing model:** every length is `calc(N * var(--px))`, with N authored at 1440px. The whole
  composition scales linearly with the viewport; no `clamp()`, no fluid-type formula.
- **Type:** display serif (original: a wide Roman face; substitute: Cinzel) with `-0.064em`
  tracking, UI and body in an extended sans (substitute: Syncopate) with `+0.08em` tracking. One
  weight (400) throughout. Scale `144 / 96 / 72 / 56 / 40 / 24` for headings.
- **Themes:** semantic variables (`--bg`, `--fg`, `--line`) swap by a theme class per section, and
  the fixed header and sound toggle follow whichever theme is under them.
- **Shape:** hairlines (1px), circular buttons, pill CTAs, no shadows. A noise PNG overlay adds grain.

## Motion Spec

| What | Trigger | Animation | Duration / easing | Rebuild file |
|---|---|---|---|---|
| Halftone shader | always, scroll | per-cell bar width from brightness; levels, threshold and bounds are tweened as plain config values | scrubbed | `src/effects/halftone.js` |
| Halftone wordmark | load | hero logotype drawn in an offscreen canvas, blurred, then run through the bar shader (200 x 14 cells) | static | `src/effects/wordmark.js` |
| Smooth scroll | always | Lenis `{ duration: 1.2, smoothWheel, touchMultiplier: 2 }` on the GSAP ticker; second instance (0.6s) for inner scrollers | exp-out curve | `src/core/lenis.js` |
| Preloader + logo hand-off | first visit | percent counter, grid wipe out, hero scale 1.5 → 1, logo moves to header slot with Flip | 2.4s Out; 1.8s InOut | `src/effects/preloader.js` |
| Hero scroll area | scroll 0 → 400vh | title flies up, render pushes in, halftone fades over the photo, wrapper shrinks to 0.3 | scrubbed | `src/effects/hero.js` |
| Zoom-through intro | scroll, pinned 300% | tree silhouette bars grow 34% → 340%, then bloom into solid sand | scrubbed | `src/effects/benefits.js` |
| Benefit card pass | scroll, >= 992px | pinned horizontal track, tilted cards (±5 to 10deg) | scrub 1 | `src/effects/benefits.js` |
| Word reveal | enters bottom | SplitText words, random yPercent from `[-150, 75, -75, 150]`, scale 0 → 1 | 1.2s Out, stagger .025 random | `src/effects/reveal.js` |
| Line / card reveal | enters bottom | masked lines rise from 250%; cards flip in on rotateY -90 | 1.2s Out | `src/effects/reveal.js` |
| Reading-light quote | scrub | chars 0.1 → 1 opacity in a soft wave | .4s Out, stagger .1 | `src/effects/prologue-highlight.js` |
| Parallax | scrub | images yPercent ±20, oversized 40% in CSS | none | `src/effects/parallax.js` |
| Season knob | drag | knob projected onto an SVG path, release snaps; two halftone layers cross-fade via threshold | 1.2s | `src/effects/season-knob.js` |
| Apartment tabs | click | outgoing card slides to -125% and rotates 15deg, incoming from +125% | 1.2s InOut | `src/effects/tabs-apartments.js` |
| Clip slider | click, key, drag | incoming slide wipes by `clip-path`, old image scales 1 → 1.5 | 1.2s | `src/effects/clip-slider.js` |
| Drag list + filter pill | drag | Draggable with inertia; pill x and width tween to the active filter | .8s InOut | `src/effects/drag-list.js` |
| Menu | click | mask-image gradient slides down the panel, words pop in | 1.8s Out | `src/effects/menu.js` |
| Page grid transition | link, anchor | 240 cells (20 x 12) scaleX 0 ↔ 1 from the bottom-right | .4s InOut, each .03 | `src/effects/transition-grid.js` |
| Nav hover | hover | two stacked label copies, chars swap in random order | .8s Out, stagger .025 | `src/effects/nav-hover.js` |
| Magnetic buttons | hover, >= 992px | shell and label follow the pointer at different strengths, elastic return | 1.6s | `src/effects/magnetic.js` |
| Cursor tip | hover | trails the pointer with `quickTo`, clip-path pop-in | 1.2s power3 | `src/effects/floating-tip.js` |
| CTA modal | click | card enters from scale 0, rotateX -90; flips on rotateY after submit | 1.2s | `src/effects/cta-modal.js` |
| Marquee | always | xPercent 0 → -50, timeScale follows scroll velocity | 24s linear | `src/effects/marquee.js` |
| Footer reveal | scrub | footer scales 2 → 1, background 0.75 → 1 | none | `src/effects/footer-reveal.js` |

### Key excerpts

**Vertical-bar halftone fragment shader**: `src/effects/halftone.js`
```glsl
vec2 g = local * u_grid;
vec2 cell = floor(g);
vec2 inCell = fract(g);
vec2 c = (cell + .5) / u_grid;                 // sample the texture at the cell centre
// ...
vec3 rgb = pow(s.rgb, vec3(u_gamma));
rgb = clamp((rgb * 255. - u_black) / max(u_white - u_black, 1.), 0., 1.);
float br = dot(rgb, vec3(.333)) * s.a;
vec4 o = u_bg;
if (br <= u_thr / 255.) {
  float w = mix(u_maxW, u_minW, br);           // dark = wide bar, bright = thin
  if (abs(inCell.x - .5) * 2. <= w) o = u_fill;
}
gl_FragColor = o;
```
Brightness only: sources need strong luminance contrast. Animating `blackPoint`, `whitePoint`,
`threshold` or the bounds is plain GSAP on a config object; the render loop redraws on change.

**Bloom into a solid field**: `src/effects/halftone.js`
```js
// BLOOM TRICK: tween cfg.minW from -0.02 to 1.02 and cfg.threshold to 256 and every
// cell becomes a full fill block, i.e. the scene "blooms" into a solid colour field.
```
The zoom-through intro uses this to turn a tree silhouette into the next section's sand background.

**1rem = 1vw sizing**: `src/styles/tokens.css`
```css
html { font-size: 1vw; }
--px: calc(1rem / 14.4);                 /* desktop: N authored at 1440 is N px at 1440 */
/* <=991px: --px: calc(1rem / 3.84) */
.h1 { font-size: calc(var(--n-h1) * var(--px)); }
```
A layout drawn once scales linearly with no breakpoints in the type.

**Scattered word reveal**: `src/effects/reveal.js`
```js
const WORD_FROM = [-150, 75, -75, 150];
SplitText.create(el, { type: 'words', autoSplit: true, onSplit(self) {
  return gsap.from(self.words, {
    yPercent: (n) => WORD_FROM[(n + i) % 4],
    scale: 0, opacity: 0, duration: 1.2, ease: 'Out',
    delay: 0.2 + i * 0.05,
    stagger: { each: 0.025, from: 'random' },
    scrollTrigger: st(el),
  });
}});
```
The random order plus scale pop reads as a shimmer, not a slide.

**Grid wipe transition**: `src/effects/transition-grid.js`
```js
const stagger = { each: 0.03, from: 'end', grid: [20, 12] };
export function cover() {
  gsap.set(cells, { transformOrigin: 'left center' });
  return gsap.fromTo(cells, { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: 'InOut', stagger }).then();
}
export function reveal() {
  gsap.set(cells, { transformOrigin: 'right center' });
  return gsap.to(cells, { scaleX: 0, duration: 0.4, ease: 'InOut', stagger }).then(/* ... */);
}
```
Cells take the current theme's background, so the wipe always matches the page it covers.

`prefers-reduced-motion`: smooth scroll, pinning, reveals and the preloader are skipped; content is visible.

## Why Award-Worthy

1. **One rendering idea carries the brand.** The bar halftone is the logotype, the hero overlay, the
   tree zoom and the season switcher. Nothing else competes with it.
2. **Image treatment doubles as transition.** Tweening shader levels dissolves photos in and
   blooms a silhouette into the next section's background, so scenes change without cuts.
3. **Two colours, no clutter.** Sand and near-black with hairlines and circles read as luxury
   without gradients or shadows.
4. **Authored once, scales everywhere.** The `1rem = 1vw` model keeps tight uppercase lockups intact
   at every width.
5. **Consistent motion vocabulary.** Three durations and two curves run the whole site; each
   reveal type has a distinct shape.

**Anti-patterns it avoids:** no generic fade-up reveals, no stock carousel (clip-wipe and drag
list instead), no drop shadows, the WebGL layers only draw while in view and never block content.

## Credits

- Original: [sondaven.com](https://sondaven.com/en) by **The First The Last**. Design and content are
  the intellectual property of their creators.
- Recognition: Awwwards Site of the Month (Jun 2026), Site of the Day, Developer Award.
- This study is an independent clean-room analysis. The rebuild uses a fictional hotel project,
  AI-generated images and open-source fonts; it contains no original code, assets or copy.
