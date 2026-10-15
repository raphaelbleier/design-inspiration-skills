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

Rebuild: [`rebuild/`](rebuild/) (fictional driver, generated images, open-source fonts).
Run it with `npm install && npm run dev`.

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

| What | Trigger | Animation | Duration / easing | Rebuild code |
|---|---|---|---|---|
| Smooth scroll | always (toggle in menu) | Lenis `{ lerp: .1, smoothWheel, syncTouch, touchMultiplier: 2 }`, driven by `gsap.ticker`, `lagSmoothing(0)` | — | `rebuild/src/scroll.js` |
| Topo contour field | always, cursor | simplex noise → contour bands via `fract`/`step`; cursor bends the field | continuous | `rebuild/src/topo.js` |
| Section recolour | scroll into section | shader colours lerp to the section's theme (cream → dark) | scrubbed | `rebuild/src/theme.js` |
| Hero pin → message frame | scroll 0 → 100vh | pinned hero; the full-screen field shrinks into a framed "message" card on dark olive; lime signature draws in | scrubbed | `rebuild/src/hero.js` |
| Headline reveal | enters at 85% | SplitText lines, ellipse `clip-path` opens from the baseline + `yPercent: 35 → 0` | 1.5s `power2.inOut`, stagger .15 | `rebuild/src/reveals.js` |
| Body text reveal | enters at 88% | lime highlighter bar wipes over each line, text appears, bar leaves | .6s `power2.out`, stagger .08 | `rebuild/src/reveals.js` |
| Image reveal | enters at 88% | ellipse `clip-path` from centre + inner image scale 1.35 → 1 | .8s / 1.1s `power2.out` | `rebuild/src/reveals.js` |
| Horizontal gallery | scroll | pinned section translates a photo row horizontally | scrubbed | `rebuild/src/gallery.js` |
| Menu | click | full-screen panel opens with ellipse `clip-path`; links pop in | .8s `power3.out`; links `back.out(1.2)` | `rebuild/src/menu.js` |
| Social card fan | hover | cards fan out | .5s `elastic.out(1, .75)` | `rebuild/src/fan.js` |
| Partners marquee | always | infinite logo row | linear | `rebuild/src/marquee.js` |
| Page transition | link click | lime wipe covers the screen, navigation happens under it (original: Rive animation; rebuild: GSAP) | leave holds ~1s | `rebuild/src/transition.js` |
| Hover states | hover | every interactive element uses the default curve | .75s `cubic-bezier(.65,.05,0,1)` | `rebuild/src/style.css` |

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
