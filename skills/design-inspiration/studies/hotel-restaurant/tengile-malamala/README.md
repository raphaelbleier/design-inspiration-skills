---
title: Tengile Malamala Collection
url: https://tengilemalamala.com/
studio: DashDigital
awards: [SOTD, Developer Award]
year: 2026
category: hotel-restaurant
techniques: [parallax, text-reveal, smooth-scroll, scroll-pinning, image-cloud, cursor-label, clip-path-wipe, marquee]
stack: [gsap, scrolltrigger, splittext, lenis, nextjs]
---

# Tengile Malamala Collection — clean-room study

A safari-lodge collection site that stays quiet on purpose. A full-bleed wildlife film opens under a
light, huge serif headline split across two staggered lines; everything after that is a warm paper
background, olive ink and small white pills. The signature is restraint plus a handful of precise
moves: headline lines that drift at different scroll speeds, a cursor label ("Play Video", "Next")
instead of buttons, a clip-path wipe gallery, and a pinned image cloud that blooms and orbits around
a single call to action.

Rebuild: [`design-inspiration-rebuilds/hotel-restaurant/tengile-malamala`](https://github.com/raphaelbleier/design-inspiration-skills/tree/main/skills/design-inspiration-rebuilds/hotel-restaurant/tengile-malamala) (fictional content, generated images, open-source fonts; installed with the optional `design-inspiration-rebuilds` skill). Run it with `npm install && npm run dev`.

## Design Tokens

| Role | Value |
|---|---|
| Page (warm paper) | `#f5eee9` |
| Card / pill white | `#fbf8f6` |
| Ink (text, footer) | `#373f1d` |
| Green (quote, accents) | `#5c6e21` |
| Beige (pill hover, image placeholder) | `#e3e1d4` |
| Grey (secondary label) | `#a5a593` |

```css
:root {
  --bg: #f5eee9; --paper: #fbf8f6; --ink: #373f1d; --green: #5c6e21; --beige: #e3e1d4; --grey: #a5a593;
  --e1: cubic-bezier(.165, .84, .44, 1);   /* hover + reveal */
  --e2: cubic-bezier(.19, 1, .22, 1);      /* expo-out, panels */
  --e3: cubic-bezier(.25, .46, .45, .94);
  --pad: 16px;                              /* one page gutter, edge-to-edge grids */
}
```

- **Type:** a light, slightly calligraphic serif (original: PP Fragment, weight 310; substitute:
  Newsreader Variable at 300) for every headline and card title, and Inter for all UI text.
  Suptitles are Inter 500, 14px, uppercase, `letter-spacing: -.01em`.
- **Scale:** section headings `28px` (`32px` from 1024) at `line-height: 1.15`; hero title
  `clamp(56px, 9vw, 140px)` uppercase, `line-height: .95`.
- **Shape:** 16px gutters, 2px radii on pills, fully round arrow pill, no shadows, no borders.
  Cards are plain 4:5 images with the title underneath; the pill overlay appears only on hover.

## Motion Spec

| What | Trigger | Animation | Duration / easing | Rebuild file |
|---|---|---|---|---|
| Smooth scroll | always | Lenis `{ lerp: .1, smoothWheel }`, driven by `gsap.ticker`, `lagSmoothing(0)` | — | `src/scroll.js` |
| Hero intro | load | cover scale 1.2 → 1; title lines rise + blur 12px → 0; description blur-in | 1.8s / 1.4s `expo.out`, stagger .18 | `src/hero.js` |
| Hero parallax | scroll through hero | the two title lines drift at different speeds (−18% / −42%), cover image moves 8% | scrubbed | `src/hero.js` |
| Header swap | scroll past hero | white wordmark fades up, ink monogram fades in, links turn ink | .5s `--e1` | `src/hero.js`, `src/style.css` |
| Cursor label | hover on hero / gallery | white pill follows pointer ("Play Video", "Next", "Prev" by half) | `quickTo` .45s `power3.out` | `src/cursor.js` |
| Text reveal | enters at 85% | SplitText lines in masks rise from 105% | 1.4s `expo.out`, stagger .09 | `src/reveals.js` |
| Image reveal + parallax | enters at 88% | `clip-path` opens from the bottom, inner scale 1.25 → 1; inner image drifts ±8% while scrolling | 1.3s / 1.6s `expo.out`; scrubbed | `src/reveals.js` |
| Card hover | hover | image scales 1.05, tag pills fade/rise in | 1.2s / .5s `--e1` | `src/style.css` |
| Gallery wipe | click (half decides direction) | incoming slide `clip-path` from the side, counter-scale 1.2 → 1 | 1.1s `expo.inOut` | `src/gallery.js` |
| Image cloud | scroll, pinned 250vh | five images bloom out from the centre on an ellipse, then orbit +70° | scrubbed, `expo.out` bloom | `src/cloud.js` |
| Marquee | scroll | oversized serif words slide left with scroll | scrub .6 | `src/reveals.js` |
| Menu | click | side panel opens with `clip-path`, links rise from masks, backdrop fades | 1s `expo.out`; links .9s stagger .05 | `src/menu.js` |

### Key excerpts

**Hero lines at different speeds**: `src/hero.js`
```js
gsap.from('.hl', { yPercent: 40, opacity: 0, filter: 'blur(12px)', duration: 1.4,
  ease: 'expo.out', stagger: 0.18, delay: 0.2 });
// ...
const sc = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
gsap.to('.hl--1', { yPercent: -18, ease: 'none', scrollTrigger: sc });
gsap.to('.hl--2', { yPercent: -42, ease: 'none', scrollTrigger: sc });
gsap.to('.hero__img', { yPercent: 8, ease: 'none', scrollTrigger: sc });
```
Two lines, two speeds: the headline peels apart as you leave the hero.

**Masked line reveal**: `src/reveals.js`
```js
SplitText.create(el, {
  type: 'lines', mask: 'lines', autoSplit: true, linesClass: 'ln',
  onSplit: (self) => gsap.from(self.lines, {
    yPercent: 105, duration: 1.4, ease: 'expo.out', stagger: 0.09,
    scrollTrigger: { trigger: el, start: 'top 85%', once: true },
  }),
});
```
`autoSplit` re-splits on resize, so the animation is created inside `onSplit`.

**Directional clip-path gallery wipe**: `src/gallery.js`
```js
const from = dir > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)';
// ...
b.classList.add('is-in');
gsap.fromTo(b, { clipPath: from }, { clipPath: 'inset(0 0 0 0)', duration: 1.1,
  ease: 'expo.inOut', onComplete: done });
gsap.fromTo(b.firstElementChild, { scale: 1.2 }, { scale: 1, duration: 1.4, ease: 'expo.out' });
```

**Pinned image cloud (bloom, then orbit)**: `src/cloud.js`
```js
function place(p) {
  const k = ease(Math.min(p / 0.45, 1));                           // bloom: 0 -> 1 over first 45%
  const orbit = Math.max(0, (p - 0.45) / 0.55) * (70 * Math.PI) / 180;
  const rx = innerWidth * 0.38 * (1 + 0.12 * Math.max(0, p - 0.45)), ry = innerHeight * 0.34;
  imgs.forEach((el, i) => {
    const a = base[i] + orbit;
    gsap.set(el, { xPercent: -50, yPercent: -50, x: Math.cos(a) * rx * k, y: Math.sin(a) * ry * k,
      scale: 0.2 + 0.8 * k, opacity: Math.min(1, k * 2) });
  });
}
// ...
ScrollTrigger.create({ trigger: '.cloud', start: 'top top', end: '+=250%', pin: true, scrub: true,
  onUpdate: (s) => place(s.progress) });
```

**Cursor label**: `src/cursor.js`
```js
const x = gsap.quickTo(c, 'x', { duration: 0.45, ease: 'power3.out' });
const y = gsap.quickTo(c, 'y', { duration: 0.45, ease: 'power3.out' });
window.addEventListener('pointermove', (e) => { x(e.clientX); y(e.clientY); });
// ...
label.textContent = e.clientX - r.left < r.width / 2 ? 'Prev' : 'Next';
```

`prefers-reduced-motion`: smooth scroll, parallax, reveals, pinning and the gallery wipe are disabled;
content is simply visible and the cloud is shown in its settled layout.

## Why Award-Worthy

1. **Luxury through restraint.** One light serif, two neutrals, one olive. Nothing competes with
   the photography, which is the product.
2. **A headline that moves like a photograph.** Two staggered lines at different parallax speeds
   give the opening depth without any WebGL.
3. **Cursor as interface.** "Play Video" / "Next" / "Prev" labels follow the pointer, so images
   behave as controls and no button chrome is needed.
4. **One curve family.** Expo-out for reveals and panels, one smooth ease for hovers; every motion
   feels like the same hand.
5. **A pinned finale that earns its scroll.** The image cloud blooms around the conservation
   message and slowly orbits, turning a link into a moment.

**Anti-patterns it avoids:** no shadows or gradients, no carousels with arrows and dots, no
bounce easing, no stock iconography; text reveals are masked, never plain fade-ups.

## Credits

- Original: [tengilemalamala.com](https://tengilemalamala.com/) by **DashDigital**. Design and content
  are the intellectual property of their creators.
- Recognition: Awwwards Site of the Day, Developer Award.
- This study is an independent clean-room analysis. The rebuild uses a fictional property, AI-generated
  images and open-source fonts; it contains no original code, assets or copy.
