---
title: Lando Norris
url: https://landonorris.com
studio: OFF+BRAND
awards: [SOTY 2025, SOTM Nov 2025, SOTD, Developer Award]
year: 2025
category: design-agencies
techniques: [webgl, shader, scroll-pinning, text-reveal, page-transitions, smooth-scroll, marquee]
stack: [three, gsap, scrolltrigger, splittext, lenis, webflow]
---

# Lando Norris — clean-room study

A personal site for a racing driver, built around one signature: a live **topographic contour
field** (WebGL) that sits behind the whole page and reacts to the cursor and to the section it
is under. Everything else is a calm editorial system — cream, dark olive and one acid lime —
with huge condensed uppercase type and a serif for single accent words.

Rebuild: [`design-inspiration-rebuilds/design-agencies/lando-norris`](https://github.com/raphaelbleier/design-inspiration-skills/tree/main/skills/design-inspiration-rebuilds/design-agencies/lando-norris) (fictional content, generated images, open-source fonts; installed with the optional `design-inspiration-rebuilds` skill). Run it with `npm install && npm run dev`.

## Design Tokens

| Role | Value |
|---|---|
| Dark olive (ink, dark sections) | `#282c20` |
| Black (helmets section) | `#111112` |
| Cream (page) | `#f4f4ed` |
| Lime (signature accent, CTAs) | `#d2ff00` |
| Muted lime | `#b2c73a` |
| Tints | `#dde1d2` `#b4b8a5` `#3b3c38` |

```css
:root {
  --green: #282c20; --black: #111112; --cream: #f4f4ed; --lime: #d2ff00; --lime-m: #b2c73a;
  --ease: cubic-bezier(.65, .05, 0, 1);   /* site-wide default easing */
  --dur: .75s;
  --gap: 1.25rem;
}
/* Fluid rem: the layout is designed at 1728px and scales as a whole. */
html { font-size: calc(clamp(992px, 100vw, 1920px) / 1728 * 16); }   /* 13.33px @1440 */
@media (max-width: 479px) { html { font-size: calc(100vw / 36); } }   /* 10.83px @390 */
```

- **Type:** a variable grotesk (original: Mona Sans — free on Google Fonts) at weight 800, stretched
  narrow (`font-stretch` ~88%), uppercase for all display type. A high-contrast display serif
  (original: Brier; substitute: Gloock / Playfair Display) is used *only* for single accent words
  inside a grotesk headline.
- **Impact type:** `7.3rem`, `line-height: .81`, `letter-spacing: -.22rem`. Lines touch — that
  density is the look.
- **Spacing & shape:** one gap token (`1.25rem`), radii `1rem` / `3rem` / `6.25rem`, no shadows.
  Depth comes from overlap and colour, never from elevation.
- Everything is in `rem` so the fluid root scales the entire composition.

## Motion Spec

| What | Trigger | Animation | Duration / easing | Rebuild file |
|---|---|---|---|---|
| Smooth scroll | always (toggle in menu) | Lenis `{ lerp: .1, smoothWheel, syncTouch, touchMultiplier: 2 }`, driven by `gsap.ticker`, `lagSmoothing(0)` | — | `src/scroll.js` |
| Topo contour field | always, cursor | simplex noise → contour bands via `fract`/`step`; cursor bends the field | continuous | `src/topo.js` |
| Section recolour | scroll into section | shader colours lerp to the section's theme (cream → dark) | scrubbed | `src/theme.js` |
| Hero pin → message frame | scroll 0 → 100vh | pinned hero; the full-screen field shrinks into a framed "message" card on dark olive; lime signature draws in | scrubbed | `src/hero.js` |
| Headline reveal | enters at 85% | SplitText lines, ellipse `clip-path` opens from the baseline + `yPercent: 35 → 0` | 1.5s `power2.inOut`, stagger .15 | `src/reveals.js` |
| Body text reveal | enters at 88% | lime highlighter bar wipes over each line, text appears, bar leaves | .6s `power2.out`, stagger .08 | `src/reveals.js` |
| Image reveal | enters at 88% | ellipse `clip-path` from centre + inner image scale 1.35 → 1 | .8s / 1.1s `power2.out` | `src/reveals.js` |
| Horizontal gallery | scroll | pinned section translates a photo row horizontally | scrubbed | `src/gallery.js` |
| Menu | click | full-screen panel opens with ellipse `clip-path`; links pop in | .8s `power3.out`; links `back.out(1.2)` | `src/menu.js` |
| Social card fan | hover | cards fan out | .5s `elastic.out(1, .75)` | `src/fan.js` |
| Partners marquee | always | infinite logo row | linear | `src/marquee.js` |
| Page transition | link click | lime wipe covers the screen, navigation happens under it (original: Rive animation; rebuild: GSAP) | leave holds ~1s | `src/transition.js` |
| Hover states | hover | every interactive element uses the default curve | .75s `cubic-bezier(.65,.05,0,1)` | `src/style.css` |

### Key excerpts

**Smooth scroll on the GSAP ticker**: `src/scroll.js`
```js
lenis = new Lenis({ lerp: 0.1, smoothWheel: true, syncTouch: true, touchMultiplier: 2,
  autoRaf: false });                       // gsap ticker drives it
lenis.on('scroll', ScrollTrigger.update);
// ...
gsap.ticker.lagSmoothing(0);
gsap.ticker.add((time) => {
  if (lenis) lenis.raf(time * 1000);      // gsap time is seconds, lenis wants ms
  frameCallbacks.forEach((fn) => fn(time * 1000));   // shader render runs in the same tick
});
```
One frame loop for scroll, ScrollTrigger and WebGL keeps pinned elements and the shader in sync.

**Topographic contour field**: `src/topo.js`
```glsl
float bump = exp(-r * r * 18.0) * uMouseAmp;          // cursor: radial bump on the noise
float f = field(p * 1.35, uTime) + bump * 0.9;
float v = f * 0.5 + 0.5;
// ...
float lo = v * uDensity;                               // outside the frame: line-only palette
float d = min(fract(lo), 1.0 - fract(lo)) / fwidth(lo);
float line = 1.0 - smoothstep(0.0, 1.3, d);            // crisp ~1px contour via fwidth
vec3 outCol = mix(uBg, uLine, line);
```

**Headline reveal (ellipse clip-path)**: `src/reveals.js`
```js
const ELLIPSE_HIDDEN = 'ellipse(75% 0% at 50% 100%)';   // flat sliver on the baseline
const ELLIPSE_SHOWN = 'ellipse(75% 130% at 50% 100%)';  // big enough to cover the line box
// ...
gsap.fromTo(self.lines,
  { clipPath: ELLIPSE_HIDDEN, yPercent: 35 },
  { clipPath: ELLIPSE_SHOWN, yPercent: 0, duration: 1.5, ease: 'power2.inOut', stagger: 0.15,
    scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
```

**Body text highlighter wipe**: `src/reveals.js`
```js
gsap.set(self.lines, { '--bar': 0, '--barx': 0, color: 'transparent' });
gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 88%', once: true } })
  .to(self.lines, { '--bar': 1, duration: 0.6, ease: 'power2.out', stagger: 0.08 })
  .set(self.lines, { color: 'inherit' }, '<+0.3')
  .to(self.lines, { '--barx': 1, duration: 0.6, ease: 'power2.out', stagger: 0.08 }, '>-0.3');
```
The bar grows over the hidden text, the text appears, then the bar leaves.

**Menu ellipse from the button**: `src/menu.js`
```js
const hidden = () => `ellipse(0% 0% at ${origin()})`;     // origin = centre of the menu button
const shown = () => `ellipse(150% 150% at ${origin()})`;
// ...
gsap.to(menu, { clipPath: shown(), duration: 0.8, ease: 'power3.out' });
gsap.fromTo(links, { yPercent: 110, rotate: 4 },
  { yPercent: 0, rotate: 0, duration: 0.9, ease: 'back.out(1.2)', stagger: 0.07, delay: 0.25 });
```

`prefers-reduced-motion`: smooth scroll, shader drift, pinning and reveals are disabled; content
is simply visible.

## Why Award-Worthy

1. **One signature, used everywhere.** The contour field is the hero, the background of later
   sections and (recoloured) the footer panel. A single WebGL idea carries the identity instead of
   a different effect per section.
2. **A three-colour system with one acid accent.** Cream and olive do the work; lime is rare and
   therefore loud — CTAs, the highlighter wipe, the signature, the page transition.
3. **Extreme type contrast.** Condensed 800-weight uppercase with negative tracking and
   line-height < 1, interrupted by a single serif word. Instantly recognisable without a logo.
4. **Motion with one personality.** One custom curve (`.65,.05,0,1`) for all UI, ellipse
   clip-paths for every reveal (text, images, menu). Consistency reads as craft.
5. **Fluid rem root.** The whole composition scales as one object between 992 and 1920px, so the
   tight typographic lockups never break.

**Anti-patterns it avoids:** no drop shadows or glassmorphism; no gradient soup (flat colours
only); no generic fade-up-on-scroll — every reveal has a shape; no per-section random effects;
the WebGL layer never blocks content or input (`pointer-events: none`).

## Credits

- Original: [landonorris.com](https://landonorris.com) by **OFF+BRAND**. Design and content are
  the intellectual property of their creators.
- Recognition: Awwwards Site of the Year 2025, Site of the Month (Nov 2025), Site of the Day,
  Developer Award.
- This study is an independent clean-room analysis. The rebuild uses a fictional driver, AI-generated
  images and open-source fonts; it contains no original code, assets or copy.
