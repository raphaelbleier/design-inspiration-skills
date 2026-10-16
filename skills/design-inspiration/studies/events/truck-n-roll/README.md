---
title: Truck n Roll
url: https://trucknroll.com/
studio: Locomotive
awards: [SOTD, Developer Award]
year: 2026
category: events
techniques: [smooth-scroll, text-reveal, scroll-pinning, parallax, marquee, accordion, sticky-image-swap, halftone-type]
stack: [gsap, scrolltrigger, lenis, vite]
---

# Truck n Roll — clean-room study

A logistics company for touring shows that sells itself like a band. Near-black page, one
electric violet-blue, and a single idea: **colossal condensed type** that fills the viewport
width, set against small, tight grotesk copy. A slanted stacked logo block is the only graphic mark.

Rebuild: [`design-inspiration-rebuilds/events/truck-n-roll`](https://github.com/raphaelbleier/design-inspiration-skills/tree/main/skills/design-inspiration-rebuilds/events/truck-n-roll) (fictional content, generated images, open-source fonts; installed with the optional `design-inspiration-rebuilds` skill). Run it with `npm install && npm run dev`.

## Design Tokens

| Role | Value |
|---|---|
| Ink (page, dark sections) | `#121212` |
| Paper (type on dark, white section) | `#fefefe` |
| Violet-blue (CTA, footer) | `#4a35ff` |
| Ash (footer type) | `#d3cecd` |

```css
:root {
  --ink: #121212; --paper: #fefefe; --blue: #4a35ff; --ash: #d3cecd;
  --ease: cubic-bezier(.76, 0, .24, 1);
  --pad: 16px;
}
```

- **Type:** two families. Body and UI in a neo-grotesk (original: Helvetica Now Display, 700, 32px
  nav with `-0.32px` tracking; substitute Inter Tight). Display in an extra-condensed black
  (original: National 2 Condensed 900, `200px / 140px`, `-4px`; substitute Archivo at `font-stretch: 62%`, 900).
- **Scale:** small copy is 16px / 500 / 1.1; sub-heads 51px with `-1.53px`; section statements are
  sized in `vw` (about 19vw) so one word spans the screen.
- **Layout:** two equal columns with a 12px gutter and a 16px page padding; hairline 1px rules
  separate every list. Images have a single squared corner with one large (28px) radius.
- **Palette rule:** three blocks of colour only: dark, one white interlude, one violet footer.

## Motion Spec

| What | Trigger | Animation | Duration / easing | Rebuild file |
|---|---|---|---|---|
| Smooth scroll | always | Lenis `{ lerp: .1, smoothWheel, syncTouch }`, driven by `gsap.ticker`, `lagSmoothing(0)` | — | `src/scroll.js` |
| Load sequence | page load | logo blocks drop in rotated, headline lines rise from masks, nav fades | 1.1s `back.out(1.6)` / `power4.out`, stagger .09 | `src/intro.js` |
| Image parallax + wipe | scroll | image yPercent -7 → 7 scrubbed; frame wipes open with `clip-path inset` | scrub / 1.2s `power3.inOut` | `src/parallax.js` |
| Huge headings | enters at 80% | masked line rise + scrubbed horizontal drift on alternating lines | 1.2s `power4.out`, stagger .1 | `src/huge.js` |
| Sticky image swap | each step crosses 55% | sticky column; next image wipes up over the previous | .9s `power3.inOut` | `src/steps.js` |
| FAQ accordion | click | height 0 ↔ auto, plus turns to minus; one open at a time | .55s `power3.inOut` | `src/accordion.js` |
| Halftone statement | scroll through 330svh sticky stage | words are gridded "ASCII" texture, resolve to solid line by line while block lifts | scrubbed .6 | `src/ascii.js` |
| Use-case rail | scroll | section pinned, card row translates horizontally | scrub .5, linear | `src/rail.js` |
| Tilted marquee | always, scroll velocity | two crossing bands at ±3°, speed scales with scroll velocity | 28s linear loop | `src/marquee.js` |

### Key excerpts

**Smooth scroll on the GSAP ticker**: `src/scroll.js`
```js
const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, syncTouch: true, touchMultiplier: 2, autoRaf: false });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));   // gsap seconds -> lenis ms
gsap.ticker.lagSmoothing(0);
```

**Masked headline lines**: `src/huge.js`
```js
gsap.from(lines, { yPercent: 105, duration: 1.2, ease: 'power4.out', stagger: 0.1,
  scrollTrigger: { trigger: h, start: 'top 80%', once: true } });
lines.forEach((l, i) => gsap.fromTo(l,
  { x: (i % 2 ? 1 : -1) * innerWidth * 0.03 },
  { x: (i % 2 ? -1 : 1) * innerWidth * 0.03, ease: 'none',
    scrollTrigger: { trigger: h, start: 'top bottom', end: 'bottom top', scrub: true } }));
```
Each `.ln` is `overflow: hidden`; the inner `<i>` slides, so the type seems to grow out of a floor.

**Halftone type resolving to solid**: `src/ascii.js` + `src/style.css`
```css
.al { color: transparent;
  background: repeating-linear-gradient(0deg, #6a6a6a 0 1px, transparent 1px 3px),
              repeating-linear-gradient(90deg, #6a6a6a 0 1px, transparent 1px 3px);
  -webkit-background-clip: text; background-clip: text; }
.al::after { content: attr(data-t); position: absolute; inset: 0 0 auto; color: var(--paper); opacity: var(--s, 0); }
```
```js
lines.forEach((l, i) => tl.to(l, { '--s': 1, duration: 0.14, ease: 'power1.inOut' }, 0.14 + i * 0.1));
```
A pure CSS texture, no canvas: a grid gradient clipped to the glyphs, with a solid copy faded in per line.

**Sticky image swap**: `src/steps.js`
```js
ScrollTrigger.create({ trigger: el, start: 'top 55%', end: 'bottom 55%',
  onToggle: (self) => {
    if (!self.isActive) return;
    imgs.forEach((im, k) => {
      im.style.zIndex = k <= i ? k + 1 : 0;
      gsap.to(im, { clipPath: k <= i ? 'inset(0% 0 0 0)' : 'inset(100% 0 0 0)',
        duration: 0.9, ease: 'power3.inOut', overwrite: 'auto' });
    });
  } });
```

**Velocity-driven marquee**: `src/marquee.js`
```js
gsap.fromTo(t, { xPercent: 0 }, { xPercent: -50, ease: 'none', duration: 28, repeat: -1 });
lenis.on('scroll', ({ velocity }) => { boost = Math.min(Math.abs(velocity) * 0.35, 6); });
gsap.ticker.add(() => { boost *= 0.92; tweens.forEach((tw) => tw.timeScale(1 + boost)); });
```

`prefers-reduced-motion`: Lenis is not created, reveals, parallax, pinning and marquee are skipped; the
halftone words render solid and the rail becomes a native horizontal scroller.

## Why Award-Worthy

1. **Type is the image.** Words sized to the viewport carry every section; photography is
   secondary and cropped hard.
2. **A disciplined palette.** Black, one white interlude and a single violet footer give three clear
   chapters with no gradients.
3. **A texture made from type.** The halftone statement turns a brand line into an event, with no
   heavy asset.
4. **Motion with one vocabulary.** Masks and inset wipes everywhere: lines rise, images wipe open,
   images swap. Nothing fades generically.
5. **A footer with attitude.** Tilted crossing bands reacting to scroll speed echo the slanted logo.

**Anti-patterns it avoids:** no carousels with arrows, no shadows or glass cards, no stock-icon
grids; the FAQ is hairline rows, not boxes.

## Credits

- Original: [trucknroll.com](https://trucknroll.com/) by **Locomotive**. Design and content are the
  intellectual property of their creators.
- Recognition: Awwwards Site of the Day, Developer Award.
- This study is an independent clean-room analysis. The rebuild uses a fictional company, AI-generated
  images and open-source fonts; it contains no original code, assets or copy.
