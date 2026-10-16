---
title: David Whyte Experience
url: https://davidwhyte.com/experience/
studio: Immersive Garden
awards: [SOTM Dec 2024, SOTD]
year: 2024
category: culture-education
techniques: [webgl, shader, fog, ink-mask, text-reveal, smooth-scroll, parallax, custom-cursor]
stack: [three, gsap, scrolltrigger, splittext, lenis]
---

# David Whyte Experience — clean-room study

A membership site for a living poet, built as a quiet reading room instead of a paywall page. One
fixed **WebGL backdrop** carries the whole identity: pale grey mist, a torn black **ink cloud**
that holds the poems in white, and a soft dark blob that trails the cursor. Content is a calm
column of light serif headings, hairline rules and small sans captions.

Rebuild: [`design-inspiration-rebuilds/culture-education/david-whyte-experience`](https://github.com/raphaelbleier/design-inspiration-skills/tree/main/skills/design-inspiration-rebuilds/culture-education/david-whyte-experience) (fictional content, generated images, open-source fonts; installed with the optional `design-inspiration-rebuilds` skill). Run it with `npm install && npm run dev`.

## Design Tokens

| Role | Value |
|---|---|
| Mist (page, shader base) | `#e6e7e1` |
| Mist glow | `#f4f4f1` |
| Ink | `#0b0b0c` |
| Cursor blob | `#212121` at up to 50% |
| Hairlines | `rgba(0,0,0,.25)` |

```css
:root {
  --mist: #e6e7e1; --ink: #0b0b0c;
  --serif: 'Newsreader', serif;   /* original: Canela Text, weight ~250, tracking -.025em */
  --sans: 'DM Sans', sans-serif;  /* original: Roobert, 12-14px captions */
  --ease: cubic-bezier(.22, .61, .36, 1);
}
.blend { color: #fff; mix-blend-mode: difference; }   /* dark on mist, white on ink */
```

- **Type:** one light serif for everything that is read (display `clamp(3rem, 8.4vw, 8.5rem)`,
  `line-height: .98`, `letter-spacing: -.035em`; titles ~4.6rem; FAQ questions ~2rem) and a small
  grotesk for captions and links. No bold anywhere.
- **Colour:** monochrome. No accent colour; the only "colour" is the photography (muted
  watercolour-like cut-outs with feathered edges).
- **Shape:** no radii, no shadows, 1px hairlines for lists. Images are masked with radial gradients so
  they dissolve into the mist like wet paper.

## Motion Spec

| What | Trigger | Animation | Duration / easing | Rebuild file |
|---|---|---|---|---|
| Smooth scroll | always | Lenis `{ lerp: .09 }` on the GSAP ticker, `lagSmoothing(0)` | — | `src/scroll.js` |
| Mist + ink + blob backdrop | always | one fragment shader: fbm mist, fbm-eaten rectangle (ink cloud) with white wisps on the rim, cursor-trailing dark blob | continuous | `src/fog.js` |
| Ink panel per section | section crosses 55% | ink opacity, blob opacity and the rectangle's vertical extent tween toward `data-ink`, `data-blob`, `data-rect` | 1.2-1.4s `power2.inOut` / `power3.out` | `src/fog.js` |
| Heading reveal | enters at 88% | SplitText line masks, `yPercent: 105 → 0` | 1.3s `power3.out`, stagger .12 | `src/reveals.js` |
| Poem reading | scroll | lines go `opacity .12 → 1` one after another while the poem block stays sticky in the ink | scrubbed | `src/reveals.js` |
| Hero landscape tiles | scroll | cut-out images drift at different speeds | scrubbed parallax | `src/reveals.js` |
| Cursor ring | pointer move | hairline ring follows with lag, scales 1.6 over links | `quickTo` .5s `power3` | `src/cursor.js` |
| FAQ accordion | click | answer opens via `grid-template-rows 0fr → 1fr`, "View" becomes "Close" | .8s `cubic-bezier(.22,.61,.36,1)` | `src/faq.js` |

### Key excerpts

**Ink cloud: rectangle eaten by noise**: `src/fog.js`
```glsl
vec2 d2 = abs(q - c) - h;
float d = length(max(d2, 0.)) + min(max(d2.x, d2.y), 0.);   // box sdf in aspect space
float n = fbm(q * 3.2 + vec2(0., -t * .05));
float edge = d + (n - .42) * .32;                            // noise displaces the edge
float ink = (1.0 - smoothstep(-.015, .03, edge)) * uInk;
float rim = smoothstep(-.2, .0, edge) * (1. - smoothstep(.0, .05, edge));
float wisp = smoothstep(.52, .72, fbm(q * 5.5 + vec2(t * .04, t * .02)));
vec3 inkCol = mix(vec3(.012), vec3(.93), wisp * rim * .9);   // white smoke only near the rim
```

**Section-driven backdrop state**: `src/fog.js`
```js
document.querySelectorAll('[data-ink]').forEach((sec) => {
  const [y0, y1] = (sec.dataset.rect || '.25,.78').split(',').map(Number);
  const go = () => {
    gsap.to(u.uInk, { value: +sec.dataset.ink, duration: 1.2, ease: 'power2.inOut' });
    gsap.to(u.uBlob, { value: +sec.dataset.blob, duration: 1.4, ease: 'power2.inOut' });
    if (sec.dataset.ink === '1') gsap.to(u.uY.value, { x: y0, y: y1, duration: 1.4, ease: 'power3.out' });
  };
  ScrollTrigger.create({ trigger: sec, start: 'top 55%', end: 'bottom 55%', onEnter: go, onEnterBack: go });
});
```
The page content never touches the canvas; markup only declares what the backdrop should look like.

**Text that works on mist and ink**: `src/style.css`
```css
#fog { position: fixed; inset: 0; z-index: -1; pointer-events: none; }
.blend { color: #fff; mix-blend-mode: difference; }
```
The canvas sits at `z-index: -1` and `main` creates no stacking context, otherwise the blend would have no backdrop.

**Heading line-mask reveal**: `src/reveals.js`
```js
const split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'ln' });
gsap.from(split.lines, { yPercent: 105, duration: 1.3, ease: 'power3.out', stagger: 0.12,
  scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
```

**Smooth scroll on the GSAP ticker**: `src/scroll.js`
```js
lenis = new Lenis({ lerp: 0.09, smoothWheel: true, autoRaf: false });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.lagSmoothing(0);
gsap.ticker.add((t) => {
  if (lenis) lenis.raf(t * 1000);
  frameCallbacks.forEach((fn) => fn(t));   // shader renders in the same tick
});
```

`prefers-reduced-motion`: Lenis, reveals, parallax and shader drift are off; text is simply visible.

## Why Award-Worthy

1. **One backdrop, no sections-as-slides.** A single shader changes state per section, so the page
   feels like one continuous atmosphere rather than stacked blocks.
2. **Restraint.** Monochrome, one light serif, hairlines. The mood (fog, ink, poetry) is carried by
   the surface, not by decoration.
3. **Text and image share one logic.** Difference blending makes copy readable on both mist and ink,
   and feathered cut-out images read as part of the same wet-paper world.
4. **Slow, consistent motion.** Long eases, lagging cursor ring, sticky poem lines that light up as
   you read. Nothing snaps.
5. **A paywall that does not feel like one.** FAQ and offer are quiet list rows in the same system.

**Anti-patterns it avoids:** no drop shadows or cards with borders, no accent colour, no loud
hover effects, no generic fade-up (headings rise out of masks); the canvas never intercepts input.

## Credits

- Original: [davidwhyte.com/experience](https://davidwhyte.com/experience/) by **Immersive Garden**. Design and
  content are the intellectual property of their creators.
- Recognition: Awwwards Site of the Month (Dec 2024), Site of the Day.
- This study is an independent clean-room analysis. The rebuild uses a fictional poet, invented poems,
  AI-generated images and open-source fonts; it contains no original code, assets, copy or likeness.
