---
title: Lifeworld
url: https://lifeworld.wetransfer.com/
studio: WeTransfer
awards: [SOTD, Developer Award]
year: 2024
category: institutions
techniques: [scroll-pinning, text-reveal, smooth-scroll, type-stretch, mix-blend, parallax, live-clock]
stack: [gsap, scrolltrigger, splittext, lenis, svelte]
---

# Lifeworld — clean-room study

A companion site for a public light artwork, built as one long black-and-white editorial scroll.
The signature is **type pulled to the edges**: a condensed capital wordmark is stretched to fill
the whole viewport, letters arrive sliced and displaced and settle as you scroll, and giant
partner names span the page width. Everything else is quiet: pure black and white, one
condensed display face, one small grotesk, a live clock and countdown.

Rebuild: [`design-inspiration-rebuilds/institutions/lifeworld`](https://github.com/raphaelbleier/design-inspiration-skills/tree/main/skills/design-inspiration-rebuilds/institutions/lifeworld) (fictional content, generated images, open-source fonts; installed with the optional `design-inspiration-rebuilds` skill). Run it with `npm install && npm run dev`.

## Design Tokens

| Role | Value |
|---|---|
| Light (page, light sections) | `#fff` |
| Dark (page, dark sections, ink) | `#000` |
| Muted text on dark | `#888` – `#aaa` |
| Gradient (shop) | black to white, stop at 85% |

```css
:root {
  --gap: 3.125rem; --gutter: 20.625rem;
  --font-body: 'Hanken Grotesk', Arial, sans-serif;   /* original: a geometric grotesk */
  --font-head: 'Anton', 'Arial Narrow', sans-serif;   /* original: a condensed bold Helvetica */
}
/* Fluid rem: layout is designed at 1440 and scales with the viewport. */
html { font-size: clamp(11px, calc(100vw / 90), 20px); }
```

- **Type:** condensed bold capitals for display (headlines 82px with `line-height: .8`, body
  headings 40px with `line-height: .85`), a light grotesk at 12–18px for body, asides and nav.
- **Contrast through scale:** words of 40px sit next to words 20 times larger. Nothing in
  between: no cards, no shadows on text, no accent colour.
- **Nav:** fixed, `mix-blend-mode: difference`, so one white nav reads on black and white sections.

## Motion Spec

| What | Trigger | Animation | Duration / easing | Rebuild file |
|---|---|---|---|---|
| Smooth scroll | always | Lenis `{ lerp: .1, smoothWheel, syncTouch }` on the GSAP ticker | — | `src/scroll.js` |
| Hero statement | load | black screen, SplitText words rise `yPercent: 40` and fade from `.12` | 1.2s `power3.out`, stagger .08 | `src/hero.js` |
| Wordmark assembly | scroll through a 300vh hero | white panel rises from the bottom; each letter cell (clipped) starts displaced, squashed and skewed, then settles to a perfect fit | scrubbed, `power3.out`, stagger .06 | `src/hero.js` |
| Line reveal | enters at 88% | SplitText lines in masks rise `yPercent: 105 → 0` | 1.1s `power3.out`, stagger .08 | `src/reveals.js` |
| Image reveal | enters at 88% | `clip-path: inset(100% 0 0 0) → inset(0)` plus inner scale 1.25 → 1 | 1.3s `power3.out` | `src/reveals.js` |
| Fitted giant word | enters at 90% | word measured to span the width, stretched `scaleY 1.35`, rises from below its baseline | 1.4s `power3.out` | `src/fit.js` |
| Shop title | scroll through a 300vh stage | letters grow `scaleY .2 → 1` on a black-to-white gradient, title in `difference` blend | scrubbed, `power2.out`, stagger .04 | `src/shop.js` |
| Floating records | scroll | five sleeves move at different speeds and rotations, farther ones blurred | scrubbed, linear | `src/shop.js` |
| Clock and countdown | always | nav clock cycles city on click; big countdown to the next full hour | 1s interval | `src/artwork.js` |
| City preview | hover | frame fades out, image swaps, fades in | .4s | `src/artwork.js` |

### Key excerpts

**Stretching a glyph to an exact box**: `src/glyph.js`
```js
const m = ctx.measureText(text);
const fa = m.fontBoundingBoxAscent, fd = m.fontBoundingBoxDescent;
return { width: m.width, cap: h.actualBoundingBoxAscent,
         base: (fs - (fa + fd)) / 2 + fa };   // baseline offset inside a line-height:1 box
```
Canvas metrics give cap height and baseline, so `scaleX`/`scaleY` can pull any capital to fill a cell exactly.

**Letters settle on scroll**: `src/hero.js`
```js
const sy = (H * 0.97) / m.cap, sx = (cw * 0.98) / m.width;
// ...
tl.fromTo(g,
  { y: rnd(-0.7, 0.7) * H, scaleY: sy * rnd(0.4, 0.9), scaleX: sx * rnd(0.7, 1.3), skewY: rnd(-14, 14) },
  { y: 0, scaleY: sy, scaleX: sx, skewY: 0, duration: 0.45, ease: 'power3.out' },
  0.25 + i * 0.06);
```
Each cell has `overflow: hidden`, so letters look sliced while they travel.

**Giant word that spans the width**: `src/fit.js`
```js
const m = metrics(el.dataset.fit, 200);
const fs = (W / m.width) * 200;            // font-size so the word is exactly W wide
// ...
el.style.height = `${cap * STRETCH}px`;    // container = stretched cap height, clipped
gsap.set(span, { transformOrigin: `50% ${base}px`, scaleY: STRETCH });   // scale from the baseline
```

**Smooth scroll on the GSAP ticker**: `src/scroll.js`
```js
lenis = new Lenis({ lerp: 0.1, smoothWheel: true, syncTouch: true, touchMultiplier: 2, autoRaf: false });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));   // gsap time is seconds, lenis wants ms
gsap.ticker.lagSmoothing(0);
```

**Masked line reveal**: `src/reveals.js`
```js
SplitText.create(t, { type: 'lines', mask: 'lines', autoSplit: true,
  onSplit: (self) => gsap.from(self.lines, {
    yPercent: 105, duration: 1.1, ease: 'power3.out', stagger: 0.08,
    scrollTrigger: { trigger: t, start: 'top 88%', once: true } }) });
```

`prefers-reduced-motion`: smooth scroll, scrubbed assembly and reveals are off; the wordmark is shown
fitted and static, content is simply visible.

## Why Award-Worthy

1. **One idea, pushed to the edge.** Type stretched to the viewport is the hero, the partner
   names and the footer. The identity is the scale, not an image.
2. **Strict two-colour discipline.** Black and white only; the artwork's own colour lives in
   the imagery, so the interface never competes with it.
3. **Letters that assemble.** The wordmark does not fade in: it arrives sliced, then locks into
   a perfect fit, tied directly to scroll position.
4. **Live data as texture.** A real clock in the nav and a countdown in display type tie a
   static page to the installation happening elsewhere right now.
5. **A nav that works everywhere.** One `difference`-blended bar stays legible across every
   background change with no per-section theming.

**Anti-patterns it avoids:** no accent colour, no cards or boxes, no generic fade-up on every
block, no carousel; the heaviest effect (the wordmark) happens once, early.

## Credits

- Original: [lifeworld.wetransfer.com](https://lifeworld.wetransfer.com/) by **WeTransfer**.
  Design and content are the intellectual property of their creators.
- Recognition: Awwwards Site of the Day, Developer Award.
- This study is an independent clean-room analysis. The rebuild uses a fictional artwork and
  artist, AI-generated images and open-source fonts; it contains no original code, assets or copy.
