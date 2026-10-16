---
title: Bennett & Clive
url: https://bennettandclive.com/
studio: Spatzek Studio
awards: [SOTM Mar 2024, SOTD, Developer Award]
year: 2024
category: fashion
techniques: [scroll-scrub, odometer-text, blend-mode, clip-path-reveal, smooth-scroll, fullscreen-imagery]
stack: [gsap, scrolltrigger, lenis, nuxt]
---

# Bennett & Clive — clean-room study

A production company for fashion and beauty brands, presented with almost no chrome: full-screen
campaign imagery, one typeface, pure black and white. The signature is a **brand roll**. The name
of the current client sits top-left in giant type, the upcoming clients stack right-aligned under a
fixed wordmark row, and scrolling rolls the whole list up one line per step while the background
cross-fades. Later sections reuse the same oversized type and a `mix-blend-mode: difference` list
that inverts over photography.

Rebuild: [`design-inspiration-rebuilds/fashion/bennett-clive`](https://github.com/raphaelbleier/design-inspiration-skills/tree/main/skills/design-inspiration-rebuilds/fashion/bennett-clive) (fictional content, generated images, open-source fonts; installed with the optional `design-inspiration-rebuilds` skill). Run it with `npm install && npm run dev`.

## Design Tokens

| Role | Value |
|---|---|
| Ink | `#000000` |
| Page | `#ffffff` |
| Type over imagery | `#ffffff` (difference-blended where it crosses white) |
| Imagery | the only colour on the page |

```css
:root { --fs: 9.25vw; --lh: calc(var(--fs) * .77); --gut: 6px; }
.big { font-size: var(--fs); line-height: .77; letter-spacing: -.07em; text-transform: uppercase; }
```

- **Type:** one grotesk (original: a custom Inter build; substitute: Inter 700). Impact type is
  `133px` at 1440 (about `9.25vw`), `line-height: .77`, `letter-spacing: -.07em`, uppercase.
  Nav is `19px` 700 with `-.03em`; captions are `13px` 400.
- **Spacing:** a `6px` page gutter, no cards, no radii, no shadows. Layout is corner-anchored:
  text hugs the left, right and bottom edges.
- **Fixed marks:** `BENNETT  &  CLIVE` runs full width at mid-viewport as a blended caption row;
  the nav sits top-right. Both stay on screen for the whole page.

## Motion Spec

| What | Trigger | Animation | Duration / easing | Rebuild file |
|---|---|---|---|---|
| Smooth scroll | always | Lenis `{ lerp: .1, smoothWheel }` on `gsap.ticker`, `lagSmoothing(0)` | — | `src/scroll.js` |
| Brand roll | scroll through a 600vh sticky track | one float index `f = progress * (N-1)`; current name rolls like an odometer, upcoming names travel up one line per step | scrubbed, linear | `src/hero.js` |
| Background cross-fade | same scrub | layer opacity `1 - min(1, abs(f - i))` | scrubbed | `src/hero.js` |
| Services frame opens | scroll through a 400vh sticky track | image frame `clip-path: inset(50%)` to `inset(0)` | scrubbed, `power2.out` over the first 35% | `src/services.js` |
| Services list | same scrub | difference-blended list translates up through the frame; second photo cross-fades in at 60% | scrubbed, linear | `src/services.js` |
| Wordmark row | always | `mix-blend-mode: difference`, white ink, so it inverts on photography | — | `src/style.css` |
| Nav underline | state | active link has a 2px underline | .3s | `src/style.css` |

### Key excerpts

**Smooth scroll on the GSAP ticker**: `src/scroll.js`
```js
const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, autoRaf: false });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
```

**Brand roll, one scrubbed index**: `src/hero.js`
```js
const render = (f) => {
  const h = lh();
  for (let i = 0; i < N; i++) {
    layers[i].style.opacity = Math.max(0, 1 - Math.abs(f - i));          // cross-fade
    curs[i].style.transform = `translateY(${(i - f) * h}px)`;            // current: top-left odometer
    items[i].style.transform = `translateY(${(i - f - 1) * h}px)`;       // upcoming: right-aligned stack
  }
};
// ...
ScrollTrigger.create({ trigger: root, start: 'top top', end: 'bottom bottom', scrub: true,
  onUpdate: (self) => render(self.progress * (N - 1)) });
```
No per-item tweens: a single number drives text and imagery, so they can never drift apart.

**Impact type and fixed blended caption row**: `src/style.css`
```css
.big, .cur span, .list a { font-size: var(--fs); line-height: .77; letter-spacing: -.07em; text-transform: uppercase; }
.mark { position: fixed; top: 50vh; left: var(--gut); right: var(--gut); display: flex;
  justify-content: space-between; color: #fff; mix-blend-mode: difference; pointer-events: none; }
```

**Frame opening with a scrubbed timeline**: `src/services.js`
```js
tl.to(frame, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.35, ease: 'power2.out' }, 0)
  .fromTo(svc, { y: () => innerHeight * 0.45 }, { y: () => -dist(), duration: 0.85 }, 0.15)
  .to(frame.children[1], { opacity: 1, duration: 0.15 }, 0.6);
```

`prefers-reduced-motion`: smooth scroll and scrubbing are off; the first brand and the open frame
are shown statically.

## Why Award-Worthy

1. **One typographic gesture.** A single weight, tight tracking and sub-1 line-height make the
   client names the entire interface. No logos, no thumbnails.
2. **Imagery does the colour.** The page itself is black and white, so every campaign still
   arrives at full saturation.
3. **Scroll as a playlist.** A single scrubbed index turns scrolling into flipping through the
   portfolio, with type and picture locked together.
4. **Blend mode as a layout tool.** `difference` lets one fixed row and one list read correctly on
   white, on dark footage and on photos, with no per-section colour logic.
5. **Corner-anchored composition.** Text sits against the edges of the viewport and leaves the
   centre to the image.

**Anti-patterns it avoids:** no cards or grids of thumbnails, no carousels with arrows, no
gradients or shadows, no decorative colour, no copy beyond names and one line of positioning.

## Credits

- Original: [bennettandclive.com](https://bennettandclive.com/) by **Spatzek Studio**. Design and
  content are the intellectual property of their creators.
- Recognition: Awwwards Site of the Month (Mar 2024), Site of the Day, Developer Award.
- This study is an independent clean-room analysis. The rebuild uses a fictional company and
  clients, AI-generated images and open-source fonts; it contains no original code, assets or copy.
