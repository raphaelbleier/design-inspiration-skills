---
title: Becane Paris
url: https://www.becaneparis.com/
studio: Period Paris
awards: [SOTD, Developer Award]
year: 2026
category: e-commerce
techniques: [webgl, hover-focus, scroll-curtain, text-reveal, smooth-scroll, floating-cards]
stack: [three, gsap, scrolltrigger, splittext, lenis, nextjs, shopify]
---

# Becane Paris — clean-room study

A fashion label's shop front reduced to one gesture: a single row of full-length, cut-out models
standing on an empty light-grey page. No hero photo, no grid of cards. Hover a figure and the others
fall back to a faint grey ghost while the chosen one steps forward and turns to a second pose. All UI
lives in small white or black label cards pinned to the viewport corners, set in an extended
Eurostile-style face at 8px uppercase. Scrolling lowers a dark veil over the row and the page ends on
a single giant manifesto paragraph.

Rebuild: [`design-inspiration-rebuilds/e-commerce/becane-paris`](https://github.com/raphaelbleier/design-inspiration-skills/tree/main/skills/design-inspiration-rebuilds/e-commerce/becane-paris) (fictional content, generated images, open-source fonts; installed with the optional `design-inspiration-rebuilds` skill). Run it with `npm install && npm run dev`.

## Design Tokens

| Role | Value |
|---|---|
| Page | `#f6f6f6` |
| Ink / black card | `#0a0a0a` |
| Cards | `#ffffff` |
| Muted text (counts, secondary links) | `#b2b2b2` |
| Veil on scroll | black at 0 → .65 opacity |

```css
:root {
  --bg: #f6f6f6; --ink: #0a0a0a; --mute: #b2b2b2; --card: #fff;
  --ease: cubic-bezier(.65, .05, 0, 1);
}
body { font: 400 8px/1.1 var(--ui); letter-spacing: .04em; text-transform: uppercase; }
h1   { font: 700 30px/1 var(--display); }
```

- **Type:** an extended grotesk (original: a custom Eurostile; substitutes: Michroma for UI, Syncopate
  700 for display). Everything is uppercase. UI is tiny (8px, tracking `.32px`), the only large type
  is the page title (30px) and the manifesto (about 33px, `line-height: 1`, centred, 14em measure).
- **Shape:** no radii, no shadows, no borders. Cards are flat rectangles (350 x 58 logo card, 350 x 28
  status bars, 233 x 28 product card) pinned 20px from the edges.
- **Colour:** neutral greys only. The clothes are the only colour on the page.

## Motion Spec

| What | Trigger | Animation | Duration / easing | Rebuild file |
|---|---|---|---|---|
| Smooth scroll | always | Lenis `{ lerp: .1, smoothWheel }` on the `gsap.ticker`, `lagSmoothing(0)` | — | `src/scroll.js` |
| Model row | always | WebGL planes in an orthographic pixel camera, row height 11vw, spacing 8vw | — | `src/row.js` |
| Hover focus | pointer near a figure | others desaturate and fade to 22%, hovered scales 1.06 and crossfades to pose B | per-frame lerp .12 | `src/row.js` |
| Product card | hover | name, `nn / 10` counter and a thumbnail update in the top-right card | instant | `src/main.js` |
| Scroll curtain | manifesto enters | black veil to .65, row drifts up 12vh, bottom card flips black to white | scrubbed; card .5s `cubic-bezier(.65,.05,0,1)` | `src/reveals.js` |
| Manifesto reveal | enters at 70% | SplitText lines in masks, `yPercent: 100 → 0` | .9s `power3.out`, stagger .06 | `src/reveals.js` |
| Narrow screens | drag | the row is wider than the screen and pans horizontally | — | `src/row.js` |

### Key excerpts

**Smooth scroll on the GSAP ticker**: `src/scroll.js`
```js
const lenis = reduce ? null : new Lenis({ lerp: 0.1, smoothWheel: true, autoRaf: false });
lenis?.on('scroll', ScrollTrigger.update);
gsap.ticker.lagSmoothing(0);
gsap.ticker.add((t) => { lenis?.raf(t * 1000); frameCallbacks.forEach((fn) => fn(t)); });
```
One loop drives scroll, ScrollTrigger and the WebGL render so they never drift.

**Dim, desaturate and crossfade in the fragment shader**: `src/row.js`
```glsl
vec4 a = texture2D(uA, vUv), b = texture2D(uB, vUv);
vec4 c = mix(a, b, uMix);                 // pose A -> pose B on hover
float g = dot(c.rgb, vec3(.299, .587, .114));
c.rgb = mix(vec3(g), c.rgb, uDim);        // desaturate when dimmed
c.a *= mix(.22, 1., uDim);                // and fade to 22%
gl_FragColor = c;
```

**Per-item hover state**: `src/row.js`
```js
const hov = S.hover === it.i, any = S.hover >= 0;
it.mix   += ((hov ? 1 : 0) - it.mix) * 0.12;
it.dim   += ((!any || hov ? 1 : 0) - it.dim) * 0.12;
it.scale += ((hov ? 1.06 : 1) - it.scale) * 0.12;
// ...
it.mesh.scale.set(h * 0.5, h, 1);          // plane is 1:2, h = 11vw * scale
```
Nothing is tweened with GSAP here: three exponential lerps per item, once per frame.

**Scroll curtain**: `src/reveals.js`
```js
ScrollTrigger.create({
  trigger: '.manifesto', start: 'top bottom', end: 'top top', scrub: true,
  onUpdate: (self) => {
    gsap.set('.dim', { opacity: self.progress * 0.65 });
    state.lift = self.progress * state.h * 0.12;     // row drifts up, read by the render loop
    document.body.classList.toggle('past-hero', self.progress > 0.5);
  },
});
```

**Masked line reveal**: `src/reveals.js`
```js
const split = SplitText.create('.mf', { type: 'lines', mask: 'lines', linesClass: 'ln' });
gsap.from(split.lines, {
  yPercent: 100, duration: 0.9, ease: 'power3.out', stagger: 0.06,
  scrollTrigger: { trigger: '.mf', start: 'top 70%', once: true },
});
```

`prefers-reduced-motion`: Lenis is not created, the manifesto is not split or animated and card
transitions are removed; hover focus still works.

## Why Award-Worthy

1. **One idea, nothing else.** The whole shop is a row of people. No banner, no grid, no carousel
   arrows: the product is the interface.
2. **Hover as editing.** Dimming the rest to a ghost makes every hover feel like a curator picking a
   look, and the pose swap rewards it.
3. **Tiny UI, huge manifesto.** 8px labels against one 33px paragraph give the page a strong scale
   contrast without any decoration.
4. **Neutral stage.** Greys only, so the garments carry all the colour.
5. **Cards as navigation.** Small flat cards in fixed corners keep the stage empty and still give a
   complete shop (cart, filters, count, discover) at all times.

**Anti-patterns it avoids:** no product grid with price tags on the landing view, no shadows or
radii, no decorative gradients, no scroll-jacking, no autoplaying carousel.

## Credits

- Original: [becaneparis.com](https://www.becaneparis.com/) by **Period Paris**. Design and content are
  the intellectual property of their creators.
- Recognition: Awwwards Site of the Day, Developer Award.
- This study is an independent clean-room analysis. The rebuild uses a fictional label, AI-generated
  images (listed in `images.json`) and open-source fonts; it contains no original code, assets or copy.
