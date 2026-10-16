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
move carries the opening: a giant wide wordmark on black, and below it a small portrait window of
a photo that opens to full-bleed as you scroll. After that the page is quiet: grotesk statements,
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
  tight tracking (`-.035em` on statements, `-.04em` on titles). The wordmark is a very wide heavy
  display face (substitute: Unbounded 800) set at ~11.6vw, letters spread edge to edge.
- **Scale:** statements `clamp(28px, 4.1vw, 60px)`, project titles up to `96px`, UI text 12-14px.
- **Shape:** no radii, no shadows, no colour. Images are hard-edged rectangles on white.

## Motion Spec

| What | Trigger | Animation | Duration / easing | Rebuild file |
|---|---|---|---|---|
| Smooth scroll | always | Lenis `{ lerp: .1, smoothWheel, syncTouch }` on the GSAP ticker | — | `src/scroll.js` |
| Loader | page load | black panel counts 0 → 100 %, slides up, wordmark letters rise from masks | 1.4s count, .9s `power3.inOut`, letters `power4.out` stagger .04 | `src/loader.js` |
| Hero window → full-bleed | scroll, pinned 100% | `clip-path` inset opens from a centred portrait window to the full stage while the image scales 1.25 → 1 | scrubbed, `scrub: .6` | `src/hero.js` |
| Header drop | first 40% of hero | nav row moves from under the wordmark to the top edge; small logo fades in later | scrubbed | `src/hero.js` |
| Statement reveal | enters at 85% | SplitText lines in masks rise `yPercent 105 → 0` | 1.1s `power3.out`, stagger .1 | `src/reveals.js` |
| Image wipe | enters at 88% | `clip-path` inset bottom-up | 1.2s `power3.inOut` | `src/reveals.js` |
| Project image open | scroll | image grows from a thin line, inner parallax ±12% | scrubbed | `src/works.js` |
| Bracket spread | scroll | `[ Title ]` brackets move apart as the title nears centre | scrubbed | `src/works.js` |
| All Work field | scroll | thumbnails drift at depth-based speeds, far ones at .35 opacity | scrubbed | `src/field.js` |
| Local clock | always | 12h time for the studio city in the header | 20s tick | `src/clock.js` |

### Key excerpts

**Hero window opens to full-bleed**: `src/hero.js`
```js
const from = mobile ? 'inset(52% 12% 0% 12%)' : 'inset(46% 39% 0% 39%)';
const tl = gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top',
  end: '+=100%', pin: true, scrub: 0.6 } });
tl.fromTo('.hero-img', { clipPath: from }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none' }, 0)
  .fromTo('.hero-img img', { scale: 1.25 }, { scale: 1, ease: 'none' }, 0)
  .to(['.hint', '.tagline'], { opacity: 0, duration: 0.3, ease: 'none' }, 0)
  .to('.wordmark', { yPercent: -30, ease: 'none' }, 0);
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

1. **One opening gesture.** The wordmark plus a photo window that opens to full-bleed sets the
   whole tone in one scroll.
2. **Restraint.** Black, white and photography only; the buildings supply all the colour.
3. **Typographic contrast.** An extra-wide display wordmark against a small, quiet grotesk.
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
