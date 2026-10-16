---
title: Telha Clarke
url: https://telhaclarke.com.au/
studio: Greg Lallé
awards: [SOTD, Developer Award]
year: 2026
category: architecture
techniques: [scroll-pinning, clip-path-reveal, text-reveal, smooth-scroll, parallax, loader, live-clock]
stack: [gsap, scrolltrigger, splittext, lenis, wordpress, vite]
---

# Telha Clarke — clean-room study

An architecture and interior studio site that is almost entirely white space and photography. One
move carries the opening: a full-bleed photograph under a small header, which the page then slides over as you scroll. After that the page is quiet: grotesk statements,
bracketed project titles, and a floating field of thumbnails.

Rebuild: [`design-inspiration-rebuilds/architecture/telha-clarke`](https://github.com/raphaelbleier/design-inspiration-skills/tree/main/skills/design-inspiration-rebuilds/architecture/telha-clarke) (fictional content, generated images, open-source fonts; installed with the optional `design-inspiration-rebuilds` skill). Run it with `npm install && npm run dev`.

## Design Tokens

| Role | Value |
|---|---|
| Black (frame, footer) | `#000` |
| White (page) | `#fff` |
| Ink | `#111` |
| Grey (labels, hints) | `#b7b7b7` |
| Image placeholder | `#d9d6cf` |

```css
:root { --gut: 18px; --stage: clamp(60px, 12.4vw, 200px); }
```

- **Type:** a neo-grotesk at weight 400-500 (original: Europa Grotesk; substitute: Hanken Grotesk),
  tight tracking (`-.048em` on statements, `-.04em` on titles). The logo stays small in the header;
  the photography carries the opening, not a display wordmark.
- **Scale:** statements `clamp(28px, 4.1vw, 60px)`, project titles up to `96px`, UI text 12-14px.
- **Shape:** no radii, no shadows, no colour. Images are hard-edged rectangles on white.

## Motion Spec

| What | Trigger | Animation | Duration / easing | Rebuild file |
|---|---|---|---|---|
| Smooth scroll | always | Lenis `{ lerp: .1, smoothWheel, syncTouch }` on the GSAP ticker | — | `src/scroll.js` |
| Loader | page load | black panel counts 0 → 100 %, slides up, hero photo settles from scale 1.15 | 1.4s count, .9s `power3.inOut`, photo 1.6s `power3.out` | `src/loader.js` |
| Hero parallax | scroll | full-bleed photo drifts down 18% and scales 1.12 → 1 while the studio section slides over it; tagline and hint fade | scrubbed, `scrub: true` | `src/hero.js` |
| Statement reveal | enters at 85% | SplitText lines in masks rise `yPercent 105 → 0` | 1.1s `power3.out`, stagger .1 | `src/reveals.js` |
| Image wipe | enters at 88% | `clip-path` inset bottom-up | 1.2s `power3.inOut` | `src/reveals.js` |
| Project image open | scroll | image grows from a thin line, inner parallax ±12% | scrubbed | `src/works.js` |
| Bracket spread | scroll | `[ Title ]` brackets move apart as the title nears centre | scrubbed | `src/works.js` |
| All Work field | scroll | thumbnails drift at depth-based speeds, far ones at .35 opacity | scrubbed | `src/field.js` |
| Local clock | always | 12h time for the studio city in the header | 20s tick | `src/clock.js` |

### Key excerpts

**Full-bleed hero parallax**: `src/hero.js`
```js
const st = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
gsap.timeline({ scrollTrigger: st })
  .to('.hero-img img', { yPercent: 18, scale: 1.12, ease: 'none' }, 0)
  .to(['.hint', '.tagline'], { opacity: 0, duration: 0.3, ease: 'none' }, 0);
```

**Smooth scroll on the GSAP ticker**: `src/scroll.js`
```js
lenis = new Lenis({ lerp: 0.1, smoothWheel: true, syncTouch: true, touchMultiplier: 2, autoRaf: false });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
```

**Statement line reveal**: `src/reveals.js`
```js
SplitText.create(el, { type: 'lines', mask: 'lines', autoSplit: true, onSplit: (self) =>
  gsap.from(self.lines, { yPercent: 105, duration: 1.1, ease: 'power3.out', stagger: 0.1,
    scrollTrigger: { trigger: el, start: 'top 85%', once: true } }) });
```

**Bracket spread via a CSS variable**: `src/works.js`
```js
gsap.fromTo(title, { '--spread': 0 }, { '--spread': 1, ease: 'none',
  scrollTrigger: { trigger: title, start: 'top 95%', end: 'top 45%', scrub: 0.5 } });
// css: .work-title span { margin: 0 calc(1vw + var(--spread) * 5vw); }
```

**Depth-based image field**: `src/field.js`
```js
imgs.forEach((im) => {
  const d = +im.dataset.depth;
  gsap.fromTo(im, { yPercent: 60 * d }, { yPercent: -60 * d, ease: 'none',
    scrollTrigger: { trigger: '.allwork', start: 'top bottom', end: 'bottom top', scrub: true } });
});
```

`prefers-reduced-motion`: smooth scroll, pinning, reveals and parallax are disabled; content is visible.

## Why Award-Worthy

1. **One opening gesture.** A full-bleed photo that settles in after the loader, then drifts and
   scales back as the next section slides over it, sets the whole tone in one scroll.
2. **Restraint.** Black, white and photography only; the buildings supply all the colour.
3. **Typographic restraint.** One quiet grotesk, tightly tracked, at very different sizes.
4. **Brackets as a motif.** Project titles breathe open on scroll, a cheap detail that feels designed.
5. **Layered depth without WebGL.** The All Work field uses plain transforms and opacity.

**Anti-patterns it avoids:** no carousels, no hover-card clutter, no decorative colour, no
heavy shaders; images carry the content.

## Credits

- Original: [telhaclarke.com.au](https://telhaclarke.com.au/) by **Greg Lallé**. Design and content
  are the intellectual property of their creators.
- Recognition: Awwwards Site of the Day, Developer Award.
- This study is an independent clean-room analysis. The rebuild uses a fictional studio, AI-generated
  images and open-source fonts; it contains no original code, assets or copy.
