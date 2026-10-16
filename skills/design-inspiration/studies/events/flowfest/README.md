---
title: Flowfest 2025
url: https://www.flowfest.co.uk/
studio: Dennis Snellenberg
awards: [SOTD, Developer Award]
year: 2025
category: events
techniques: [scroll-pinning, text-reveal, smooth-scroll, parallax, svg-shapes, sticker-ui, scroll-scrub]
stack: [gsap, scrolltrigger, splittext, lenis, webflow]
---

# Flowfest 2025 — clean-room study

A one-day community festival site for web designers, dressed as a 1970s gig poster. No WebGL: the
identity is flat colour, thick ink outlines and a hard offset shadow on everything, plus one cheerful
sun mascot that follows you down the page. The speaker grid imitates a design tool (corner handles,
tag chips, named cursors), which is the in-joke for the audience.

Rebuild: [`design-inspiration-rebuilds/events/flowfest`](https://github.com/raphaelbleier/design-inspiration-skills/tree/main/skills/design-inspiration-rebuilds/events/flowfest) (fictional content, generated images, open-source fonts; installed with the optional `design-inspiration-rebuilds` skill). Run it with `npm install && npm run dev`.

## Design Tokens

| Role | Value |
|---|---|
| Cream (page) | `#f3ecd2` |
| Ink (text, every outline) | `#121212` |
| Paper (cards, inputs) | `#fffefb` |
| Pink (CTA, panel) | `#f489a3` |
| Orange | `#fb7230` |
| Amber / Yellow (bands, cards) | `#f4a113` `#f1bc10` |

```css
:root {
  --cream: #f3ecd2; --ink: #121212; --paper: #fffefb;
  --pink: #f489a3; --orange: #fb7230; --amber: #f4a113; --yellow: #f1bc10;
  --shadow: 0 .25rem 0 rgba(0,0,0,.15);   /* hard offset shadow, no blur, on every pill and card */
  --r: 10rem;                              /* buttons are full pills */
}
```

- **Type:** a fat bubbly retro display (original is a licensed face; substitutes: Bagel Fat One for the
  logo/H1, Shrikhand for H2 and the sticker) over Quicksand body at 14px. H1 is ~85px / line-height
  .9 / `-0.01em`, with a thick cream stroke (`-webkit-text-stroke` + `paint-order: stroke fill`) so
  it reads as a die-cut sticker; H2 ~71px white on colour.
- **Shape:** 1px–2px ink outlines everywhere, radii from `.6rem` (inputs) to `4rem` (panel) to a full
  pill (buttons). Depth is only the flat `0 .25rem 0` shadow.
- **Rainbow bands:** pink / yellow / amber / orange stripes with ink hairlines between them, used as
  hero corner arcs and as the wavy ribbons across the ticket panel.

## Motion Spec

| What | Trigger | Animation | Duration / easing | Rebuild file |
|---|---|---|---|---|
| Smooth scroll | always | Lenis `{ lerp: .1 }` driven by `gsap.ticker`, `lagSmoothing(0)` | — | `src/scroll.js` |
| Hero intro | load | badge scales in, H1 lines rise from a mask, sticker rotates in with overshoot, arcs slide from the corners, photos stack up | lines `back.out(1.4)` .9s stagger .12; sticker `elastic.out(1,.6)` .8s | `src/hero.js` |
| Photo stack fan | scroll | the 3 stacked hero photos spread sideways and rotate | scrubbed | `src/hero.js` |
| Speaker cards | enters at 88% | tilted pop-in (`rotate ±4`, `y 80`) | .9s `back.out(1.3)` | `src/speakers.js` |
| Column drift | scroll | each card moves by its own offset (`data-lag`) | scrubbed | `src/speakers.js` |
| Name pill hover | hover | cursor-style name chip jumps and tilts | .5s `elastic.out(1,.5)` | `src/speakers.js` |
| Heading reveal | enters at 88% | SplitText lines in masks rise | .9s `power3.out`, stagger .1 | `src/speakers.js` |
| Love section | scroll, pinned 330vh | tweet cards fly in tilted and stack; the giant word splits apart | scrubbed .6, `power2.out` per card | `src/love.js` |
| Wavy ribbons | scroll | two stroked paths drift in opposite directions behind the CTA | scrubbed ±90 units | `src/waves.js` |
| Sun mascot | scroll | fixed mascot spins 720° over the page; footer sun rises | scrubbed .5 | `src/sun.js` |
| Hover states | hover | pills drop 3px into their shadow | .35s `cubic-bezier(.65,.05,0,1)` | `src/style.css` |

### Key excerpts

**Wavy ribbons from one path**: `src/waves.js`
```js
const COLORS = ['#fb7230', '#f1bc10', '#f4a113', '#fb7230'];
const WIDTHS = [360, 270, 180, 90];            // one path, stroked wide to narrow
// ...
WIDTHS.forEach((w, i) => {
  [[w + 5, '#121212'], [w, COLORS[i]]].forEach(([sw, stroke]) => {   // ink outline stroke under each colour
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d); p.setAttribute('fill', 'none');
    p.setAttribute('stroke', stroke); p.setAttribute('stroke-width', sw);
    g.appendChild(p);
  });
});
gsap.fromTo('.w-a', { x: 90 }, { x: -90, ease: 'none', scrollTrigger: st });
```
The ink hairlines come for free from the slightly wider black stroke under every colour.

**Rainbow arcs from box-shadow rings**: `src/style.css`
```css
.arc { background: var(--orange); --b: 3.4rem; --o: 2px;
  box-shadow: 0 0 0 var(--o) var(--ink), 0 0 0 var(--b) var(--amber),
    0 0 0 calc(var(--b) + var(--o)) var(--ink), 0 0 0 calc(var(--b)*2) var(--yellow),
    0 0 0 calc(var(--b)*2 + var(--o)) var(--ink), 0 0 0 calc(var(--b)*3) var(--pink),
    0 0 0 calc(var(--b)*3 + var(--o)) var(--ink); }
.arc-r { right: -9rem; top: -8rem; border-radius: 0 0 0 5rem; }   /* box mostly off-screen */
```

**Pinned love section with stacking cards**: `src/love.js`
```js
const tl = gsap.timeline({ defaults: { ease: 'none' },
  scrollTrigger: { trigger: '.love', start: 'top top', end: 'bottom bottom', scrub: 0.6 } });
gsap.set(cards, { y: '140vh', rotate: (i) => (i % 2 ? 8 : -8) });
cards.forEach((c, i) => {
  tl.to(c, { y: i * 18, rotate: (i - 1) * 2.5, ease: 'power2.out', duration: 1 }, i * 0.9);
});
tl.to('.lw1', { x: '-12vw', duration: 2.6 }, 0).to('.lw2', { x: '12vw', duration: 2.6 }, 0);
```
Pinning is plain CSS (`position: sticky` in a 330vh section); the timeline only scrubs inside it.

**Sticker hero headline**: `src/hero.js`
```js
const split = SplitText.create('.hero .h1', { type: 'lines', mask: 'lines', linesClass: 'line' });
tl.from('.badge', { scale: 0, rotate: -20, duration: 0.7, transformOrigin: '10% 50%' })
  .from(split.lines, { yPercent: 110, duration: 0.9, stagger: 0.12 }, '-=.3')
  .from('.sticker', { rotate: -12, scale: 0.4, opacity: 0, duration: 0.8,
    ease: 'elastic.out(1,.6)' }, '-=.4');
```

**Smooth scroll on the GSAP ticker**: `src/scroll.js`
```js
const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, autoRaf: false });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));   // gsap time is seconds, lenis wants ms
gsap.ticker.lagSmoothing(0);
```

`prefers-reduced-motion`: Lenis is not created, intro and scrubs are skipped, cards sit stacked in place.

## Why Award-Worthy

1. **Theme as interface.** The audience is designers, so the speaker grid is a fake design canvas:
   selection handles, tag chips, named cursors. The joke is the navigation.
2. **One look, no exceptions.** Ink outline, flat hard shadow, pill buttons, five warm colours. Nothing
   needs a gradient or blur to feel rich.
3. **A mascot with a job.** The sun follows the scroll, spins with it and finally rises in the footer,
   tying start and end of the page together.
4. **Playful but readable.** Display type is wild, body copy is a calm rounded sans at normal size,
   so the fun never costs legibility.
5. **Cheap, robust effects.** Stacked strokes, box-shadow rings and CSS sticky pinning carry the
   visuals; GSAP only adds the tilt and overshoot.

**Anti-patterns it avoids:** no WebGL, no stock-photo hero, no blur or glassmorphism, no generic
fade-up; every reveal tilts or overshoots like a sticker being slapped on.

## Credits

- Original: [flowfest.co.uk](https://www.flowfest.co.uk/) by **Dennis Snellenberg**. Design and content
  are the intellectual property of their creators.
- Recognition: Awwwards Site of the Day, Developer Award.
- This study is an independent clean-room analysis. The rebuild uses a fictional festival, AI-generated
  images and open-source fonts; it contains no original code, assets or copy.
