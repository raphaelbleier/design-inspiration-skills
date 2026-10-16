---
title: Pasticcino Bag World Tour 2026
url: https://weekend-mm-2026-pasticcino-bag-master.monogrid.io/en/
studio: MONOGRID
awards: [SOTD]
year: 2026
category: art-illustration
techniques: [smooth-scroll, scroll-pinning, parallax, clip-path-reveal, illustrated-scenes, hotspots, page-transitions]
stack: [gsap, scrolltrigger, lenis]
---

# Pasticcino Bag World Tour 2026 — clean-room study

A brand campaign told as a painted journey: a small striped coin pouch travels from a train
compartment through Italian rooms and landscapes. Every "page" is an oil-painted illustration
with a rough brushed frame, the cursor tilts the scene, and scrolling dollies from one painting
to the next. Interface chrome is warm paper, olive and brown, with extra-wide heavy type.

Rebuild: [`design-inspiration-rebuilds/art-illustration/pasticcino-world-tour`](https://github.com/raphaelbleier/design-inspiration-skills/tree/main/skills/design-inspiration-rebuilds/art-illustration/pasticcino-world-tour) (fictional content, generated images, open-source fonts; installed with the optional `design-inspiration-rebuilds` skill). Run it with `npm install && npm run dev`.

## Design Tokens

| Role | Value |
|---|---|
| Frame / wood brown | `#6b4423` |
| Ochre (scene fallback) | `#c9a46a` |
| Olive (cards, intro) | `#46501a` |
| Deep olive (type shadow) | `#232a0e` |
| Cream (type, buttons) | `#dfdcc8` |
| Paper (cards) | `#d8cba0` |
| Ink strip | `#2c2a1a` |

```css
:root {
  --brown: #6b4423; --ochre: #c9a46a; --olive: #46501a; --olive-d: #232a0e;
  --cream: #dfdcc8; --paper: #d8cba0; --ink: #2c2a1a;
  --ease: cubic-bezier(.65, .05, 0, 1);   /* hover / button curve */
}
```

- **Type:** a wide heavy grotesk (original looks like an expanded grotesque; substitute: Archivo at
  `font-stretch: 125%`, weight 800), uppercase, with a hard 4px offset shadow in deep olive.
  Kickers ("THE", "BEGINS", "CHAPTER 01") are small, bold, tracked `.5em`.
- **Frame:** a fixed brown border run through an SVG `feTurbulence` + `feDisplacementMap` filter so
  it reads as a dry-brush edge. It sits above scenes and below overlays.
- **Shapes:** buttons are scalloped pills (clip-path), the menu and sound buttons are wooden ovals,
  cards are paper rotated about `-1.4deg` with a dark pouch-pattern strip top and bottom.

## Motion Spec

| What | Trigger | Animation | Duration / easing | Rebuild file |
|---|---|---|---|---|
| Smooth scroll | always | Lenis `{ lerp: .1 }` on the GSAP ticker, `lagSmoothing(0)` | — | `src/scroll.js` |
| Scene parallax | pointer move | oversized painting (inset -4%) moves opposite to the cursor, max about 3% of viewport | 1.2s `power3.out` (quickTo) | `src/parallax.js` |
| Card tilt | pointer move | intro/paper cards rotate ±2.2deg and drift ±14px | .9s `power3.out` (quickTo) | `src/tilt.js` |
| Gate sequence | click "Start now" | CTA fades, olive intro card wipes in, holds, gate wipes up | 1.1s `power3.out`, hold 2.2s, 1.2s `power3.inOut` | `src/gate.js` |
| Scene journey | scroll (pinned, 100% per chapter) | next painting fades in while dollying scale 1.22 → 1; rail fill scrubs | scrub 1, linear | `src/journey.js` |
| Chapter title | chapter changes | ellipse clip-path wipe from the baseline + 35% y drift | .9s `power2.inOut` | `src/chapter.js` |
| Hotspot → card | click | overlay fades, card drops from y 60 | .5s fade, .9s `back.out(1.2)` | `src/cards.js` |
| Hotspot pulse | always | ring scales 1 → 1.9 and fades | 2s ease-out, loop | `src/style.css` |
| Menu | click | circular clip-path from the button, links rise | .8s `power3.out`; links `back.out(1.2)` stagger .07 | `src/menu.js` |
| Hover states | hover | buttons lift and rotate -1.5deg | .75s `cubic-bezier(.65,.05,0,1)` | `src/style.css` |

### Key excerpts

**Smooth scroll on the GSAP ticker**: `src/scroll.js`
```js
lenis = new Lenis({ lerp: 0.1, smoothWheel: true, autoRaf: false });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.lagSmoothing(0);
gsap.ticker.add((t) => lenis.raf(t * 1000));   // gsap seconds -> lenis ms
```

**Pinned painting crossfade with dolly**: `src/journey.js`
```js
const tl = gsap.timeline({ defaults: { ease: 'none' } });
scenes.forEach((s, i) => {
  if (i === 0) return;
  tl.fromTo(s, { opacity: 0, scale: 1.22 }, { opacity: 1, scale: 1, duration: 1 }, i - 1)
    .set(scenes[i - 1], { opacity: 0 }, i);
});
ScrollTrigger.create({
  animation: tl, trigger: stage, start: 'top top', end: `+=${steps * 100}%`,
  pin: true, scrub: 1,
  onUpdate: (self) => { /* rail fill + chapter index from self.progress */ },
});
```

**Cursor parallax on the paintings**: `src/parallax.js`
```js
const setters = bgs.map((b) => [gsap.quickTo(b, 'x', { duration: 1.2, ease: 'power3.out' }),
  gsap.quickTo(b, 'y', { duration: 1.2, ease: 'power3.out' })]);
addEventListener('pointermove', (e) => {
  const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
  setters.forEach(([sx, sy]) => { sx(-nx * innerWidth * 0.032); sy(-ny * innerHeight * 0.032); });
});
```

**Brushed frame**: `src/style.css`
```css
.frame { position: fixed; inset: 0; z-index: 30; pointer-events: none;
  border: clamp(10px, 1.4vw, 22px) solid var(--brown); filter: url(#rough); }
/* <feTurbulence baseFrequency=".035" numOctaves="3"/> + <feDisplacementMap scale="26"/> */
```

**Menu circle from the button**: `src/menu.js`
```js
gsap.fromTo(menu, { clipPath: `circle(0px at ${origin()})` },
  { clipPath: `circle(150vmax at ${origin()})`, duration: 0.8, ease: 'power3.out' });
gsap.fromTo(list.children, { yPercent: 110, rotate: 4 },
  { yPercent: 0, rotate: 0, duration: 0.9, ease: 'back.out(1.2)', stagger: 0.07, delay: 0.25 });
```

`prefers-reduced-motion`: smooth scroll, parallax, tilt and pulse are off; transitions shortened to
near zero. Content stays reachable via the menu.

## Why Award-Worthy

1. **Illustration is the interface.** Every screen is a full-bleed painting; UI is reduced to a
   few tactile objects (wooden buttons, paper cards), so the brand story is never a layer on top.
2. **A tangible frame.** A single displaced border gives the whole site a hand-made edge without
   any per-screen decoration.
3. **Depth from flat art.** Oversized paintings, cursor parallax and a scrubbed dolly make 2D images
   feel like rooms you walk through.
4. **Restricted palette.** Brown, ochre, olive, cream: the type and cards inherit the paintings' colours.
5. **Chaptered pacing.** One wheel gesture advances one painting; the numbered chapter title and rail
   always show where you are, and hotspots reward exploration with small notes.

**Anti-patterns it avoids:** no glassmorphism or gradients on UI, no generic fade-up reveals,
no scroll hijack without a visible progress indicator, no mixed illustration styles.

## Credits

- Original: [Pasticcino Bag World Tour 2026](https://weekend-mm-2026-pasticcino-bag-master.monogrid.io/en/) by **MONOGRID**. Design and content are
  the intellectual property of their creators.
- Recognition: Awwwards Site of the Day.
- This study is an independent clean-room analysis. The rebuild uses a fictional brand, AI-generated
  images (listed in `images.json`) and open-source fonts; it contains no original code, assets or copy.
