---
title: Units
url: https://units.gr/en/homepage/
studio: Big Horror Athens
awards: [SOTD]
year: 2026
category: hotel-restaurant
techniques: [webgl, bento-grid, scroll-pinning, horizontal-scroll, text-reveal, smooth-scroll, marquee, pixel-art]
stack: [three, gsap, scrolltrigger, splittext, lenis, mapbox, swiper, lottie]
---

# Units — clean-room study

A student-housing site that behaves like a **bento box**: a fixed rail of colour tiles on the left
and a stream of rounded cards on the right, each card one flat brand colour. Everything is
pastel-cream ground, primary-colour cards and black ink. The one WebGL moment is a **perspective
tunnel of rooms** (coloured wall panels and photo panels on a black grid) that you fly through.

Rebuild: [`design-inspiration-rebuilds/hotel-restaurant/units-gr`](https://github.com/raphaelbleier/design-inspiration-skills/tree/main/skills/design-inspiration-rebuilds/hotel-restaurant/units-gr) (fictional content, generated images, open-source fonts; installed with the optional `design-inspiration-rebuilds` skill). Run it with `npm install && npm run dev`.

## Design Tokens

| Role | Value |
|---|---|
| Page (warm cream) | `#f4e9e1` |
| Ink | `#000` |
| Blue / Amber / Orange / Green | `#0072e3` `#ffb200` `#ff6100` `#00aa3c` |
| Violet / Red / Tomato / Yellow | `#ab54f7` `#ea3737` `#ff5c38` `#ffdb08` |
| Tints (list cards) | `#ff8e0a` `#c79dfc` |

```css
:root {
  --ease: cubic-bezier(.16, 1, .3, 1);   /* expo.out, used for every reveal */
  --rail: 122px; --gap: 22px; --edge: 20px; --r: 30px;
}
main { margin-left: calc(var(--rail) + var(--edge) + var(--gap)); }
.card { border-radius: var(--r); padding: 30px; }   /* the whole site is cards */
```

- **Type:** a heavy grotesk with quirky ligatures for headings (original: Alfabet; substitute:
  Bricolage Grotesque 800, tracking `-.02em`, line-height `.95`), a neutral grotesk for body
  (original: Aeonik Pro; substitute: DM Sans).
- **Layout:** left rail of four full-colour nav tiles that share the column height (`flex: 1`), plus
  pill buttons below. No shadows, no gradients; separation is gap and colour only. Lists inside
  cards are separated by 1px black rules.
- **Mobile:** the rail collapses to a logo plus burger; the tiles become a full-screen menu.

## Motion Spec

| What | Trigger | Animation | Duration / easing | Rebuild file |
|---|---|---|---|---|
| Smooth scroll | always | Lenis `{ lerp: .1, smoothWheel }` on the gsap ticker | — | `src/scroll.js` |
| Load sequence | page load | hero image opens from an inset rounded clip, rail tiles pop in from the left | 1.4s / 1s `expo.out`, stagger .08 | `src/intro.js` |
| Offer modal | 0.9s after load | dark overlay, yellow card slides up; Lenis paused while open | .8s `expo.out` | `src/intro.js` |
| Heading reveal | enters at 85% | SplitText lines in a mask, `yPercent 105 → 0` | 1.2s `expo.out`, stagger .1 | `src/reveals.js` |
| Card entrance | enters at 90% | `y 60 → 0` + fade | 1.2s `expo.out` | `src/reveals.js` |
| Feature marquee | always | red pill, infinite linear row | 28s loop | `src/marquee.js` |
| Horizontal living track | scroll | wrapper pinned, row of cards translates left | scrub 1 | `src/living.js` |
| Room tunnel | click "Press to Start" | camera flies down a gridded corridor, pointer parallax | 9s `power2.inOut` | `src/tunnel.js` |
| Pixel icons | enters at 80% | lit cells of a 20×17 grid switch on in random order | 4ms stagger | `src/pixels.js` |
| Tile hover | hover | tile nudges 6px right and rounds further | .6s `expo.out` | `src/style.css` |
| Burger menu | click (mobile) | tile menu opens with a top-down inset clip | .8s `expo.out` | `src/nav.js` |

### Key excerpts

**Smooth scroll on the GSAP ticker**: `src/scroll.js`
```js
lenis = new Lenis({ lerp: 0.1, smoothWheel: true, autoRaf: false });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
```

**Masked line reveal**: `src/reveals.js`
```js
SplitText.create(el, {
  type: 'lines', mask: 'lines', autoSplit: true,
  onSplit: (self) => gsap.from(self.lines, {
    yPercent: 105, duration: 1.2, ease: 'expo.out', stagger: 0.1,
    scrollTrigger: { trigger: el, start: 'top 85%', once: true },
  }),
});
```

**Pinned horizontal card row**: `src/living.js`
```js
mm.add('(min-width: 901px)', () => {
  const dist = () => Math.max(0, track.scrollWidth - wrap.clientWidth);
  gsap.to(track, { x: () => -dist(), ease: 'none',
    scrollTrigger: { trigger: wrap, start: 'top 10px', end: () => '+=' + dist(), pin: true,
      scrub: 1, anticipatePin: 1, invalidateOnRefresh: true } });
});
```

**Room tunnel cells**: `src/tunnel.js`
```js
// 4 walls x (3 across, 30 along) cells of 2x2 units; random flat colour / photo / empty
if (l > 2 && r > 0.8) {                       // photo cell, never at the entrance
  mat = new THREE.MeshBasicMaterial({ color: PALETTE[...] });   // flat colour until texture loads
  loader.load(IMGS[...], (t) => { t.repeat.set(9 / 16, 1); t.offset.set(7 / 32, 0); mat.map = t; });
} else if (r > 0.55 && r <= 0.8) { mat = new THREE.MeshBasicMaterial({ color: PALETTE[...] }); }
// every cell edge goes into ONE LineSegments geometry (black grid)
gsap.to(state, { z: -50, duration: 9, ease: 'power2.inOut' });   // camera fly-through
```

**Pixel icon printing**: `src/pixels.js`
```js
const on = el.querySelectorAll('.on');
gsap.set(on, { opacity: 0 });
ScrollTrigger.create({ trigger: el, start: 'top 80%', once: true,
  onEnter: () => gsap.to(on, { opacity: 1, duration: 0.01,
    stagger: { each: 0.004, from: 'random' } }) });
```

`prefers-reduced-motion`: smooth scroll, pinning, reveals and the marquee are off; the tunnel stays a
static frame and content is simply visible.

## Why Award-Worthy

1. **A grid that is the brand.** Rounded flat-colour cards at one radius and one gap read as
   building blocks, matching the "unit" idea without any illustration needed.
2. **Colour as navigation.** The four rail tiles reuse the card colours, so you always know which
   section colour you are in.
3. **One 3D idea, kept honest.** The room tunnel is plain flat-shaded planes and lines: cheap,
   fast, on-brand and clearly a "walk through the rooms" metaphor.
4. **Playful details.** Pixel-art value icons, a ticker pill and a promo modal keep a serious
   housing product friendly.
5. **Consistent motion.** `expo.out` everywhere; reveals are masked lines, not generic fades.

**Anti-patterns it avoids:** no shadows or glass; no stock-gradient hero; no parallax on every
element; the tunnel never blocks scrolling.

## Credits

- Original: [units.gr](https://units.gr/en/homepage/) by **Big Horror Athens**. Design and content
  are the intellectual property of their creators.
- Recognition: Awwwards Site of the Day.
- This study is an independent clean-room analysis. The rebuild uses a fictional student-housing
  brand, AI-generated images and open-source fonts; it contains no original code, assets or copy.
