---
title: MindMarket
url: https://mindmarket.com/
studio: Louis Paquet
awards: [SOTM Dec 2025, SOTD, Developer Award]
year: 2025
category: art-illustration
techniques: [illustration, color-flood, scroll-pinning, text-reveal, sticky-card-stack, parallax, smooth-scroll]
stack: [gsap, scrolltrigger, lenis, astro, rive]
---

# MindMarket — clean-room study

A research-agency site that behaves like a children's picture book. There is no WebGL: the whole
identity is **flat, oversized character illustration** on full-bleed colour fields. Each section
is one flat colour (green, cream, yellow), and the scroll story floods one colour into the next
while the cartoon characters drift past at different speeds. Type is a single tight grotesk.

Rebuild: [`design-inspiration-rebuilds/art-illustration/mindmarket`](https://github.com/raphaelbleier/design-inspiration-skills/tree/main/skills/design-inspiration-rebuilds/art-illustration/mindmarket) (fictional content, generated images, open-source fonts; installed with the optional `design-inspiration-rebuilds` skill). Run it with `npm install && npm run dev`.

## Design Tokens

| Role | Value |
|---|---|
| Ink (text) | `#2c2e2a` |
| Green (hero, CTA band, cards) | `#8ed462` |
| Cream (flood, numbers section) | `#f4f0e4` |
| Yellow (footer) | `#f5e50f` |
| Coral / Blue / Lilac (illustration + cards, underline) | `#ff6f59` `#2b9bff` `#e8bff8` |

```css
:root{
  --green:#8ed462; --cream:#f4f0e4; --yellow:#f5e50f; --coral:#ff6f59; --blue:#2b9bff; --lilac:#e8bff8; --ink:#2c2e2a;
  --ease:cubic-bezier(.65,.05,0,1);
}
h1,h2{ font-weight:500; line-height:.95; letter-spacing:-.06em; }
```

- **Type:** Inter, weight 500 everywhere. Display type is huge (~124px at 1440, `line-height` just under 1) with
  negative tracking of about `-0.06em`; body copy is 17px. Hierarchy comes from size only, never from weight.
- **Shape:** white pill bars with a ~6px radius, 3.4rem radius on the stat cards, a rounded top edge on the footer.
  No shadows. Round green burger button and a round avatar on the quote button.
- **Accent device:** a hand-drawn wavy underline (lilac under a headline word, green under the footer word),
  drawn as an SVG stroke so it can animate.
- **Fixed chrome:** two floating white pills (nav, quote button) stay above every colour change.

## Motion Spec

| What | Trigger | Animation | Duration / easing | Rebuild file |
|---|---|---|---|---|
| Smooth scroll | always | Lenis `{ lerp: .1 }` on the GSAP ticker, anchor links use `lenis.scrollTo` | 1.4s anchor | `src/scroll.js` |
| Colour flood | scroll through pinned scene | a 140vmax cream circle scales .18 → 1 from 60% height, flooding the green | scrubbed, `power2.in` | `src/scene.js` |
| Character drift | same scrub | each illustration moves from +45vh to -18vh with its own speed factor and a small rotation | scrubbed, linear | `src/scene.js` |
| Message card | same scrub | white card rises from below the fold | scrubbed, `power3.out` | `src/scene.js` |
| Headline reveal | enters at 88% | words clipped in `overflow:hidden`, inner span `yPercent 110 → 0` | .9s `power3.out`, stagger .06 | `src/reveals.js` |
| Squiggle underline | enters at 85% | SVG path `stroke-dashoffset` len → 0 | 1.2s `power2.inOut` | `src/reveals.js` |
| Stat card stack | scroll | cards are `position:sticky`; the covered card scales .94 and tilts -2deg | scrubbed | `src/stack.js` |
| Menu | click | dropdown opens via `clip-path` inset, burger bars rotate into a cross | .6s `cubic-bezier(.65,.05,0,1)` | `src/menu.js` |
| Button hover | hover | arrow disc scales 1.15 and rotates -45deg | .6s same curve | `src/style.css` |

### Key excerpts

**Colour flood with drifting characters**: `src/scene.js`
```js
const tl = gsap.timeline({ defaults: { ease: 'none' },
  scrollTrigger: { trigger: '#scene', start: 'top top', end: '+=180%', scrub: 0.6, pin: true } });
tl.fromTo('.blob', { scale: 0.18 }, { scale: 1, ease: 'power2.in', duration: 1 }, 0)
  .fromTo('.card', { yPercent: 100 }, { yPercent: 0, ease: 'power3.out', duration: 0.6 }, 0.4);
stage.querySelectorAll('.fl').forEach((f) => {
  const s = +f.dataset.speed;                      // per-character speed factor
  tl.fromTo(f, { y: () => innerHeight * 0.45 * s, rotate: -8 * s },
    { y: () => -innerHeight * 0.18 * s, rotate: 6 * s, duration: 1 }, 0);
});
```
One pinned timeline drives colour, cards and every character, so the illustration never feels pasted on.

**Flood circle**: `src/style.css`
```css
.blob{ position:absolute; left:50%; top:60%; width:140vmax; aspect-ratio:1;
  margin:-70vmax 0 0 -70vmax; border-radius:50%; background:var(--cream); transform:scale(.18); }
```
Oversized and centred by negative margin, so scaling only needs `transform` (no layout).

**Smooth scroll on the ticker**: `src/scroll.js`
```js
const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, autoRaf: false });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
```

**Word reveal and squiggle draw**: `src/reveals.js`
```js
gsap.from(words, { yPercent: 110, duration: 0.9, ease: 'power3.out', stagger: 0.06,
  scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
// ...
const len = p.getTotalLength();
gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
gsap.to(p, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut', delay: 0.4,
  scrollTrigger: { trigger: p.closest('.ul'), start: 'top 85%', once: true } });
```

**Sticky card stack**: `src/stack.js`
```js
cards.slice(0, -1).forEach((c, i) => {
  gsap.to(c, { scale: 0.94, rotate: -2, ease: 'none',
    scrollTrigger: { trigger: cards[i + 1], start: 'top 85%', end: 'top 15%', scrub: true } });
});
```
Stacking is pure CSS (`position:sticky; top:7rem`); GSAP only adds the scale and tilt on the covered card.

`prefers-reduced-motion`: smooth scroll, pinning, reveals and the stack tilt are off; the flood circle is shown fully expanded.

## Why Award-Worthy

1. **Illustration is the interface.** Big flat characters replace stock photography and carry the brand voice;
   the layout simply makes room for them.
2. **Colour as navigation.** Green, cream, yellow: every section change is a colour change, and the flood
   transition makes it a moment rather than a cut.
3. **One typographic voice.** A single weight at extreme sizes with tight tracking reads confident and friendly.
4. **Depth without effects.** Per-character parallax and a sticky card stack give layered depth with no shadows or WebGL.
5. **Small hand-drawn accents.** The wavy underline draws in, so the page feels made by hand despite a rigid grid.

**Anti-patterns it avoids:** no stock photos, no gradients or glassmorphism, no weight changes for hierarchy,
no auto-playing motion that blocks reading.

## Credits

- Original: [mindmarket.com](https://mindmarket.com/) by **Louis Paquet**. Design and content are the
  intellectual property of their creators.
- Recognition: Awwwards Site of the Month (Dec 2025), Site of the Day, Developer Award.
- This study is an independent clean-room analysis. The rebuild uses a fictional agency, AI-generated
  images and open-source fonts; it contains no original code, assets or copy.
