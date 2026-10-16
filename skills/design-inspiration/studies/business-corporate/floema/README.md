---
title: Floema
url: https://www.floema.com/en
studio: Bürocratik
awards: [SOTM May 2026, SOTD, Developer Award]
year: 2026
category: business-corporate
techniques: [pinned-slideshow, clip-path-wipe, cursor-parallax, text-reveal, smooth-scroll, hover-preview]
stack: [gsap, scrolltrigger, splittext, lenis, three]
---

# Floema — clean-room study

A corporate site for a maker of outdoor furniture and signage that behaves like a product
catalogue with a film's pacing. A cream page, near-black ink and one soft acid yellow carry the
whole identity; product cut-outs float around a single sentence, a pinned full-screen slideshow
walks through five product worlds, and a huge cropped logo mark closes the page on yellow.

Rebuild: [`design-inspiration-rebuilds/business-corporate/floema`](https://github.com/raphaelbleier/design-inspiration-skills/tree/main/skills/design-inspiration-rebuilds/business-corporate/floema) (fictional content, generated images, open-source fonts; installed with the optional `design-inspiration-rebuilds` skill). Run it with `npm install && npm run dev`.

## Design Tokens

| Role | Value |
|---|---|
| Cream (page) | `#f2efea` |
| Ink (text, logo) | `#241f21` |
| Yellow (hover, footer, menu) | `#e9e778` |
| Deep green (quote panel) | `#042d2b` |
| Collection tags | `#f76c46` coral, `#c6af88` sand, `#85a1c5` blue, `#bacfa3` sage, `#d2cdc4` stone |

```css
:root {
  --cream: #f2efea; --ink: #241f21; --yellow: #e9e778; --green: #042d2b;
  --ease: cubic-bezier(.65, .05, 0, 1);
}
.h-big { font-size: 3.575rem; letter-spacing: -.04em; line-height: 1.05; font-weight: 400; }
```

- **Type:** one humanist geometric sans (original: a commercial face; substitute: Outfit) at
  weight 400 only. Display size is ~57px with `-0.04em` tracking and `1.05` line height; the
  manifesto steps up to ~51px. No bold anywhere: hierarchy comes from size and colour.
- **Navigation:** white pill links that touch each other (negative 1px margin) at 13px uppercase;
  the logo and pills turn white over dark slides.
- **Shape:** pills and circles for controls, ~14px radius on the catalogue cards, no shadows on
  the page itself. Product images are flat cut-outs on tinted blocks.
- **Spacing:** 2rem side gutter, generous empty cream between sections.

## Motion Spec

| What | Trigger | Animation | Duration / easing | Rebuild file |
|---|---|---|---|---|
| Smooth scroll | always | Lenis `{ lerp: .1, smoothWheel }` on the GSAP ticker, `lagSmoothing(0)` | — | `src/scroll.js` |
| Hero floaters intro | load | cards scale .6 → 1 and fade, headline rises 40% | 1.1s `power3.out`, stagger .08 | `src/hero.js` |
| Cursor parallax | pointer move | each card offsets by mouse position × its depth value | `quickTo` .9s `power3.out` | `src/hero.js` |
| Hero scroll drift | scroll 0 → 100vh | cards rise at different speeds per depth | scrub .6 | `src/hero.js` |
| Pinned slideshow | scroll, 5 × 100vh | next image wipes up via `clip-path`, inner image scale 1.2 → 1, copy swaps, counter 01 → 05 | scrubbed, `power2.inOut` | `src/slides.js` |
| Manifesto reveal | enters at 85% | SplitText lines in masks, `yPercent 110 → 0` | 1.1s `power3.out`, stagger .1 | `src/reveals.js` |
| Header recolour | slideshow / quote active | logo and menu icon switch ink → white | .5s default curve | `src/slides.js`, `src/reveals.js` |
| Collection hover | pointer over a row | other rows dim to .25; each row carries an inline thumbnail | opacity .4s `--ease` | `src/style.css` |
| Menu (small screens) | click | yellow panel wipes down with `clip-path` | .8s `cubic-bezier(.65,.05,0,1)` | `src/menu.js` |

### Key excerpts

**Smooth scroll on the GSAP ticker**: `src/scroll.js`
```js
lenis = new Lenis({ lerp: 0.1, smoothWheel: true, autoRaf: false });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));   // gsap seconds -> lenis ms
gsap.ticker.lagSmoothing(0);
```
One frame loop keeps the pinned stage and ScrollTrigger in sync with Lenis.

**Pinned slideshow wipe**: `src/slides.js`
```js
slides.forEach((s, i) => { s.style.zIndex = i; if (i) gsap.set(s, { clipPath: 'inset(100% 0% 0% 0%)' }); });
// ...
scrollTrigger: { trigger: '.stage', start: 'top top',
  end: () => `+=${innerHeight * (n - 1) * 1.1}`, pin: true, scrub: 0.5, anticipatePin: 1 }
// ...
tl.to(slides[i], { clipPath: 'inset(0% 0% 0% 0%)', duration: 1 }, i - 1)
  .to(slides[i].querySelector('img'), { scale: 1, duration: 1 }, i - 1)
  .fromTo(slides[i].querySelector('.slide-copy'), { yPercent: 25, autoAlpha: 0 },
          { yPercent: 0, autoAlpha: 1, duration: 0.6 }, i - 0.6);
```
Each slide is a stacked layer; the timeline is one unit of time per slide, scrubbed by scroll.

**Cursor parallax with depth**: `src/hero.js`
```js
const setters = cards.map((c) => ({
  d: +c.dataset.d,
  x: gsap.quickTo(c, 'x', { duration: 0.9, ease: 'power3.out' }),
  y: gsap.quickTo(c, 'y', { duration: 0.9, ease: 'power3.out' }),
}));
addEventListener('pointermove', (e) => {
  const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
  setters.forEach((s) => { s.x(nx * s.d * 28); s.y(ny * s.d * 28); });
});
```
A per-card `data-d` (0.6 – 1.8) is the whole depth system.

**Masked line reveal**: `src/reveals.js`
```js
SplitText.create(el, {
  type: 'lines', mask: 'lines', autoSplit: true,
  onSplit: (self) => gsap.from(self.lines, {
    yPercent: 110, duration: 1.1, ease: 'power3.out', stagger: 0.1,
    scrollTrigger: { trigger: el, start: 'top 85%', once: true },
  }),
});
```
`autoSplit` re-splits on resize and the animation is rebuilt from `onSplit`.

**Dimming siblings on hover**: `src/style.css`
```css
.coll:hover h3, .coll:hover svg { opacity: .25; }
.coll li:hover h3, .coll li:hover svg { opacity: 1; }
```

`prefers-reduced-motion`: smooth scroll, pinning, parallax and reveals are not initialised;
content is simply visible.

## Why Award-Worthy

1. **Catalogue as cinema.** The five product worlds are one pinned full-screen sequence with a
   counter, tag chip and download card, so a long product range reads as a short film.
2. **Restraint in palette and type.** One weight, one size family, cream and ink with a single
   yellow. Colour is saved for product tags and the footer, so it signals instead of decorating.
3. **Playful but ordered hero.** Floating cut-outs with depth-scaled parallax make the page feel
   alive without hiding the one sentence that matters.
4. **A collections list that previews.** Big type rows with counts, dimming siblings and
   inline thumbnails turn navigation into a small interaction.
5. **A closing brand gesture.** The logo mark cropped huge on yellow gives the footer an identity
   instead of a link dump.

**Anti-patterns it avoids:** no carousels with arrows for the hero story; no shadows or glass;
no bold weights; no decorative gradients; reveals only on headlines, never on every block.

## Credits

- Original: [floema.com](https://www.floema.com/en) by **Bürocratik**. Design and content are the
  intellectual property of their creators.
- Recognition: Awwwards Site of the Month (May 2026), Site of the Day, Developer Award.
- This study is an independent clean-room analysis. The rebuild uses a fictional brand, images
  generated from prompts and open-source fonts; it contains no original code, assets or copy.
