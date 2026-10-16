---
title: Léo Parpeix Portfolio 2026
url: https://www.leoparpeix.com/
studio: Léo Parpeix
awards: [SOTD, Developer Award]
year: 2026
category: experimental
techniques: [webgl, 3d-mascot, intro-loader, drag-carousel, custom-cursor, text-reveal, smooth-scroll]
stack: [three, gsap, scrolltrigger, splittext, lenis, vite]
---

# Léo Parpeix Portfolio 2026 — clean-room study

A designer's portfolio that stays almost completely flat — one off-white page, one near-black
green ink, one yellow accent — and puts all its personality into two things: a **huge uppercase
three-line title** and a small **3D bee** that follows the cursor (click to throw it a fruit).
The work list is a stack of horizontal, draggable carousels with a yellow "DRAG" pill as cursor
and a quiet one-line data row under each.

Rebuild: [`design-inspiration-rebuilds/experimental/leo-parpeix`](https://github.com/raphaelbleier/design-inspiration-skills/tree/main/skills/design-inspiration-rebuilds/experimental/leo-parpeix) (fictional content, generated images, open-source fonts; installed with the optional `design-inspiration-rebuilds` skill). Run it with `npm install && npm run dev`.

## Design Tokens

| Role | Value |
|---|---|
| Page | `#f7f7f7` |
| Ink (all text) | `rgb(2, 32, 22)` ≈ `#022016` |
| Accent (drag pill) | `#f6e61a` yellow |
| Bee fruit | `#ff5a14` orange |
| Muted meta | `#9aa39e` |

```css
:root { --bg: #f7f7f7; --ink: #022016; --yellow: #f6e61a; --orange: #ff5a14;
        --ease: cubic-bezier(.76, 0, .24, 1); --pad: 40px; }
```

- **Type:** two families. Display: a heavy grotesk, uppercase, `162px` / `line-height .9` at 1440
  (original custom "title"; substitute Archivo 800). Everything else: a neutral grotesk at 14px
  (UI, meta) and 34px (statements), weight 400 (substitute Inter Tight).
- **Layout:** `40px` page padding; header = name, role at x≈256, nav right-aligned. Carousel slides
  are `72.6vw` wide with a `1.4vw` gap, so the neighbours peek in from both sides.
- No shadows, no borders, no rounded corners except the intro card and the pill.

## Motion Spec

| What | Trigger | Animation | Duration / easing | Rebuild file |
|---|---|---|---|---|
| Smooth scroll | always | Lenis `lerp: .1` on the GSAP ticker, `lagSmoothing(0)` | — | `src/scroll.js` |
| Intro card | load | white rounded card rotates -8deg → 0, then scales until it floods the page; overlay fades; hero lines rise from masks | 1s `power3.inOut`; .9s `expo.inOut`; 1.1s `expo.out`, stagger .12 | `src/loader.js` |
| 3D bee | always, cursor | low-poly bee in an orthographic pixel-space scene chases the cursor with a damped spring, wings flap, body bobs | continuous | `src/bee.js` |
| Feed the bee | click in hero | orange fruit falls with gravity, bounces once; bee flies to it and eats it (scale → 0) | gravity 1800 px/s² | `src/bee.js` |
| Statement reveal | enters at 85% | SplitText line masks, `yPercent 110 → 0` | 1s `expo.out`, stagger .08 | `src/reveals.js` |
| Project carousel | drag | pointer drag with edge resistance, throw by release velocity, snap to nearest slide | .9s `power3.out` | `src/carousel.js` |
| DRAG cursor | hover carousel | yellow pill follows the pointer, scales .6 → 1 on enter, .8 while dragging | .35s `power3` follow | `src/carousel.js` |
| Menu | click `····` | circular clip-path grows from the button; links rise | .8s `power3.inOut`; links `expo.out` | `src/menu.js` |

### Key excerpts

**Smooth scroll on the GSAP ticker**: `src/scroll.js`
```js
lenis = new Lenis({ lerp: 0.1, smoothWheel: true, autoRaf: false });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.lagSmoothing(0);
gsap.ticker.add((t) => { lenis.raf(t * 1000); frame.forEach((fn) => fn(t)); });
```
The bee's render function is registered in the same `frame` set, so scroll and WebGL never drift.

**Intro card flood**: `src/loader.js`
```js
gsap.timeline()
  .to('.card', { rotate: 0, duration: 1, ease: 'power3.inOut' })
  .to('.card', { scale: 8, borderRadius: 0, duration: 0.9, ease: 'expo.inOut' }, '>-0.1')
  .to(loader, { autoAlpha: 0, duration: 0.3 }, '>-0.15')
  .to(lines, { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.12 }, '<');
```

**Bee spring and fruit**: `src/bee.js`
```js
// critically damped spring: k = 55, c = 2 * sqrt(k)
const k = 55, c = 2 * Math.sqrt(k);
vel.x += ((tx - pos.x) * k - vel.x * c) * dt;
vel.y += ((ty - pos.y) * k - vel.y * c) * dt;
// ...
if (f) { f.vy += 1800 * dt; f.y += f.vy * dt;
  if (f.y > floor) { f.y = floor; f.vy = f.bounced ? 0 : -f.vy * 0.4; f.bounced = true; } }
const flap = Math.sin(t * Math.PI * 2 * 38) * 0.7;
```
The target is the fruit when one exists, else the cursor with a small offset.

**Line-mask text reveal**: `src/reveals.js`
```js
SplitText.create(el, { type: 'lines', mask: 'lines', autoSplit: true,
  onSplit: (self) => gsap.from(self.lines, {
    yPercent: 110, duration: 1, ease: 'expo.out', stagger: 0.08,
    scrollTrigger: { trigger: el, start: 'top 85%', once: true } }) });
```

**Drag, throw and snap**: `src/carousel.js`
```js
x = gsap.utils.clamp(bound() - 60, 60, startPos + e.clientX - startX); set(x);   // soft edges
// on release
i = gsap.utils.clamp(0, slides.length - 1, Math.round(-(x + v * 0.25 * 60) / step()));
gsap.to({ p: x }, { p: -i * step(), duration: 0.9, ease: 'power3.out',
  onUpdate() { x = this.targets()[0].p; set(x); } });
```

`prefers-reduced-motion`: smooth scroll, intro card, bee and reveals are disabled; content is visible.

## Why Award-Worthy

1. **Restraint plus one toy.** A flat three-colour page makes the single playful object, the bee,
   the memorable part. It is interactive (follow, feed) without ever blocking content.
2. **Typographic scale as the hero.** Three stacked uppercase words at ~11vw carry the first
   screen; no image is needed.
3. **Work shown as a drag gesture.** Peeking neighbours plus a branded cursor pill teach the
   interaction without a label, and the data row stays small and readable.
4. **Consistent motion language.** One expo/power3 family for every transition, masks for text
   instead of generic fades.

**Anti-patterns it avoids:** no heavy section backgrounds, no parallax soup, no autoplaying
carousels, no cookie-cutter card grid for the work list.

## Credits

- Original: [leoparpeix.com](https://www.leoparpeix.com/) by **Léo Parpeix**. Design and content
  are the intellectual property of their creator.
- Recognition: Awwwards Site of the Day, Developer Award.
- This study is an independent clean-room analysis. The rebuild uses a fictional designer and
  fictional projects, AI-generated images and open-source fonts; it contains no original code,
  assets, copy or likeness.
