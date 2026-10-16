---
title: Akaru
url: https://www.akaru.fr/
studio: Akaru
awards: [SOTM Apr 2024, SOTD]
year: 2024
category: e-commerce
techniques: [webgl, smooth-scroll, horizontal-scroll, scroll-pinning, text-reveal, split-screen, color-blocking]
stack: [three, gsap, scrolltrigger, lenis]
---

# Akaru — clean-room study

A web-agency site built on **flat colour blocking**: a warm off-white page and four muted
pastels (blue, mauve, sage, terracotta) that return as vertical strips, as full-screen expertise
panels and as the dots in the nav. Type is a monumental ultra-condensed wordmark that opens the
page at half width and closes it, full-bleed and cropped, in the footer. One WebGL object, a black
award trophy, is the only 3D moment.

Rebuild: [`design-inspiration-rebuilds/e-commerce/akaru`](https://github.com/raphaelbleier/design-inspiration-skills/tree/main/skills/design-inspiration-rebuilds/e-commerce/akaru) (fictional content, generated images, open-source fonts; installed with the optional `design-inspiration-rebuilds` skill). Run it with `npm install && npm run dev`.

## Design Tokens

| Role | Value |
|---|---|
| Page (cream) | `#f0efeb` |
| Ink / dark sections | `#0e0e0e` |
| Blue | `#bfcad7` |
| Mauve | `#b78f9f` |
| Sage | `#7a9480` |
| Terracotta | `#e8905f` |

```css
:root {
  --cream: #f0efeb; --ink: #0e0e0e;
  --blue: #bfcad7; --pink: #b78f9f; --sage: #7a9480; --orange: #e8905f;
  --ease: cubic-bezier(.65, .05, 0, 1);
  --pad: 1.8rem;
}
```

- **Type:** a neo-grotesk for body and headings (original: Alliance Neue; substitute: Instrument
  Sans) at regular weight with negative tracking (`-.04em` on headings), tiny uppercase labels
  (~10px) in a second grotesk (substitute: Space Grotesk). The wordmark is an ultra-condensed
  heavy display face (substitute: Anton) at `line-height: .8`.
- **Shapes:** pill buttons (1px outline, uppercase label, one dot), hairline rules, no shadows,
  no radii elsewhere. Photos sit edge-to-edge in colour fields.
- **Layout:** the hero is a 50/50 split; the colour strips on the right are cropped by the viewport
  edge, hinting at more.

## Motion Spec

| What | Trigger | Animation | Duration / easing | Rebuild file |
|---|---|---|---|---|
| Smooth scroll | always | Lenis `{ lerp: .1, smoothWheel }` on the `gsap.ticker`, `lagSmoothing(0)` | — | `src/scroll.js` |
| Hero strips | load | colour strips slide in from the right, staggered | 1.4s `power4.out`, stagger .12 | `src/hero.js` |
| Strip hover | hover | hovered strip widens 36% to 52% | .7s `cubic-bezier(.65,.05,0,1)` | `src/hero.js` |
| Bar pills | scroll past 60vh | logo, "contact" pill and menu pill fade down in | .5s custom curve | `src/hero.js` |
| Mask reveals | enters at 88% | text rises out of an overflow mask | 1.1s `power4.out` | `src/reveals.js` |
| Project parallax | scroll | stacked photos drift inside their frames (`yPercent -8 to 8`, scale 1.18) | scrubbed | `src/reveals.js` |
| Award counter | enters at 60% | `(0)` counts to `(35)` | 1.6s `power2.out` | `src/reveals.js` |
| Trophy | scroll, cursor | black slab with brass inlay turns one full revolution over the section, tilts toward the cursor | scrub, lerp .06 | `src/trophy.js` |
| Expertise panels | scroll (pinned) | five full-width colour panels slide horizontally; bottom index highlights the current one | scrub 1, linear | `src/expertises.js` |
| Menu | click | circle clip-path grows from the button; links rise from masks | .9s `power3.inOut`; links .9s `power4.out`, stagger .07 | `src/menu.js` |
| Footer wordmark | scroll | giant wordmark rises into place | scrubbed | `src/reveals.js` |

### Key excerpts

**Smooth scroll on the GSAP ticker**: `src/scroll.js`
```js
lenis = new Lenis({ lerp: 0.1, smoothWheel: true, autoRaf: false });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.lagSmoothing(0);
gsap.ticker.add((t) => lenis.raf(t * 1000));   // gsap seconds -> lenis ms
```

**Pinned horizontal expertise panels**: `src/expertises.js`
```js
gsap.to(track, {
  x: () => -(track.scrollWidth - innerWidth), ease: 'none',
  scrollTrigger: {
    trigger: '.expertises', pin: true, scrub: 1, start: 'top top',
    end: () => '+=' + (track.scrollWidth - innerWidth) * 1.2, invalidateOnRefresh: true,
    onUpdate: (s) => items.forEach((li, i) =>
      li.classList.toggle('on', i === Math.min(n - 1, Math.round(s.progress * (n - 1))))),
  },
});
```
Scroll distance is 1.2x the travel, so each panel lingers; the index follows `progress`.

**Hero strips in and hover widen**: `src/hero.js`
```js
gsap.from(strips, { xPercent: 110, duration: 1.4, ease: 'power4.out', stagger: 0.12 });
// ...
s.addEventListener('mouseenter', () =>
  gsap.to(s, { width: '52%', duration: 0.7, ease: 'cubic-bezier(.65,.05,0,1)' }));
```

**Scroll-spun trophy**: `src/trophy.js`
```js
const spin = { y: 0.5 };
gsap.to(spin, { y: 0.5 + Math.PI * 2, ease: 'none',
  scrollTrigger: { trigger: '.awards', start: 'top bottom', end: 'bottom top', scrub: true } });
// ...
m.x += (m.tx - m.x) * 0.06; m.y += (m.ty - m.y) * 0.06;   // cursor tilt, eased
g.rotation.y = spin.y + m.x * 0.8;
g.rotation.x = 0.12 + m.y * 0.4;
```

**Menu circle from the button**: `src/menu.js`
```js
gsap.set(menu, { visibility: 'visible', clipPath: `circle(0px at ${origin()})` });
gsap.to(menu, { clipPath: `circle(150% at ${origin()})`, duration: 0.9, ease: 'power3.inOut' });
gsap.fromTo(links.map((a) => a.firstChild), { yPercent: 110 },
  { yPercent: 0, duration: 0.9, ease: 'power4.out', stagger: 0.07, delay: 0.3 });
```

`prefers-reduced-motion`: smooth scroll, pinning, reveals and the trophy spin are disabled; the
expertise panels become a native horizontal scroller.

## Why Award-Worthy

1. **A palette of four pastels and nothing else.** The same colours colour the nav dots, hero
   strips and expertise panels, so the identity is learned in the first screen.
2. **Scale contrast.** A wordmark the size of the viewport against 10px uppercase labels; no middle
   size competes.
3. **The wordmark bookends the page.** It opens at half width and returns full-bleed and cropped
   in the footer, a simple loop that makes the scroll feel designed.
4. **One 3D object, used sparingly.** The trophy turns with scroll in the awards section only, so
   WebGL supports the story (we win awards) instead of decorating it.
5. **Pills and hairlines as the whole UI kit.** Every control shares one shape and one curve.

**Anti-patterns it avoids:** no drop shadows or gradients; no stock-icon sets; no carousel dots or
arrows (the panels are scroll-driven); the WebGL canvas never captures pointer events.

## Credits

- Original: [akaru.fr](https://www.akaru.fr/) by **Akaru**. Design and content are the
  intellectual property of their creators.
- Recognition: Awwwards Site of the Month (Apr 2024), Site of the Day.
- This study is an independent clean-room analysis. The rebuild uses a fictional agency, AI-generated
  images and open-source fonts; it contains no original code, assets or copy.
