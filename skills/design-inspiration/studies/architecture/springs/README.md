---
title: Springs
url: https://springs.estate/
studio: Vide Infra
awards: [SOTD, Developer Award]
year: 2026
category: architecture
techniques: [webgl, tilted-card-field, smooth-scroll, scroll-pinning, text-reveal, parallax, tab-crossfade, counters]
stack: [three, gsap, scrolltrigger, splittext, lenis]
---

# Springs — clean-room study

A real-estate site for a wellness-led residential development, built around one signature: a
full-bleed **WebGL field of portrait photo cards tilted about 30 degrees**, drifting slowly along
their own axis and speeding up with scroll. Over it sits a teal-to-forest gradient with an olive
glow in the bottom-left corner, one light serif for every headline, and a small humanist sans for
captions. The rest of the page is calm: pinned tabs, huge serif section titles, quiet parallax.

Rebuild: [`design-inspiration-rebuilds/architecture/springs`](https://github.com/raphaelbleier/design-inspiration-skills/tree/main/skills/design-inspiration-rebuilds/architecture/springs) (fictional content, generated images, open-source fonts; installed with the optional `design-inspiration-rebuilds` skill). Run it with `npm install && npm run dev`.

## Design Tokens

| Role | Value |
|---|---|
| Page / cream panels | `#f5e8d1` |
| Text sand (on green) | `#e0d1b6` |
| Deep forest (base) | `#0d3a2e` |
| Forest 2 / teal | `#12503a` / `#0b4a52` |
| Olive glow | `#8d8f2a` |

```css
:root {
  --cream: #f5e8d1; --sand: #e0d1b6; --forest: #0d3a2e; --teal: #0b4a52; --olive: #8d8f2a;
  --serif: 'Newsreader', Georgia, serif;     /* original: a light display serif */
  --sans: 'Figtree', Helvetica, sans-serif;  /* original: a humanist grotesk */
}
```

- **Type scale (measured):** hero title `100px / 120px`, `-2px` tracking; section giants `180px / 160px`,
  `-3.6px`; statements `40px / 50px`; body `20px / 22px`, `-.4px`; captions `10px / 14px`,
  `.8px` uppercase. Everything serif is weight light, nothing is bold.
- **Colour logic:** sand type on green, forest type on cream. Cream panels interrupt the green
  twice (intro, residences); the fixed bar flips colour over them.
- **Shape:** no radii except the cookie pill and outline buttons (full pill). No shadows.
- **Hero tint:** `linear-gradient(200deg, teal .62 → green .55 → forest .72)` plus a radial olive
  glow from the bottom-left. The photos stay visible but unified.

## Motion Spec

| What | Trigger | Animation | Duration / easing | Rebuild file |
|---|---|---|---|---|
| Smooth scroll | always | Lenis `{ lerp: .09 }` on the GSAP ticker (original: virtual scroller with `data-scroll-sticky`) | — | `src/scroll.js` |
| Tilted card field | always, wheel, pointer | Three.js ortho scene, cards 280x390 in a group rotated `-.52rad`, drift `.35px/frame + |velocity| * 1.6`, pointer parallax ±14px | continuous | `src/hero.js` |
| Loader | page load | word fades in, panel lifts `yPercent -100`, hero title rises | 1s `power4.inOut` | `src/main.js` |
| Headline reveal | enters at 85% | SplitText words in overflow mask, `yPercent 110 → 0` | 1.3s `power4.out`, stagger .06 | `src/reveals.js` |
| Fade-up | enters at 90% | `y 24 → 0` + opacity | .9s `power3.out` | `src/reveals.js` |
| Wellness tabs | scroll in pinned section (300%) | index from progress; image wipes in via `clip-path: inset`, text rises 16px | 1s expo-out / .8s | `src/wellness.js` |
| Parallax images | scroll | inner image `yPercent ±(speed*100)`, scrub .6, image pre-scaled 1.18 | scrubbed | `src/parallax.js` |
| Distance counters | enters at 90% | 0 → 3 / 9 / 16, snapped to integers | 1.6s `power2.out` | `src/reveals.js` |
| Menu | click | full-screen panel opens as `circle()` clip-path from the burger; links rise | .9s `power3.inOut`; links 1s `power4.out` | `src/menu.js` |
| Bar colour | scroll over cream sections | class toggle, colour transition | .5s expo-out | `src/main.js` |

### Key excerpts

**Tilted card field**: `src/hero.js`
```js
const CARD_W = 280, CARD_H = 390, GAP = 44, TILT = -0.52;   // radians
// ...
group.rotation.z = TILT;
// staggered columns: odd columns are shifted by half a card
mesh.userData = { x: c * stepX, y: r * stepY + (c % 2 ? stepY / 2 : 0) };
// ...
const target = 0.35 + Math.abs(state.velocity) * 1.6;      // scroll speeds the drift up
speed += (target - speed) * 0.08;
offset = (offset + speed) % span;
```
One rotated group drifts along its local axis; each card wraps modulo the column height, so the
field never ends.

**Cover-fit in the shader**: `src/hero.js`
```glsl
float ta = uAspect;                       // texture w/h
float ca = 0.7179;                        // card w/h
if (ta > ca) uv.x = (uv.x - .5) * (ca / ta) + .5; else uv.y = (uv.y - .5) * (ta / ca) + .5;
vec3 tex = texture2D(uTex, uv).rgb;
gl_FragColor = vec4(mix(uColor, tex, uHas * uMix), 1.0);   // placeholder colour fades to photo
```

**Smooth scroll on the GSAP ticker**: `src/scroll.js`
```js
lenis = new Lenis({ lerp: 0.09, smoothWheel: true, autoRaf: false });
lenis.on('scroll', (e) => { state.velocity = e.velocity; ScrollTrigger.update(); });
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
```
Scroll velocity is exported so the WebGL layer can react to it in the same frame loop.

**Masked word reveal**: `src/reveals.js`
```js
const split = SplitText.create(el, { type: 'words', wordsClass: 'w' });
// each word gets an inner <i> inside an overflow:hidden .word
gsap.set(inner, { yPercent: 110 });
gsap.to(inner, { yPercent: 0, duration: 1.3, ease: 'power4.out', stagger: 0.06,
  scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
```

**Pinned tabs from scroll progress**: `src/wellness.js`
```js
ScrollTrigger.create({
  trigger: '#wellness', start: 'top top', end: '+=300%', pin: '.wellness__pin',
  onUpdate: (s) => set(Math.min(3, Math.floor(s.progress * 4))),
});
```
The same `set(i)` is used by click, so scroll and tabs never disagree.

`prefers-reduced-motion`: smooth scroll, drift, pinning, reveals and parallax are off; the hero
renders one still frame.

## Why Award-Worthy

1. **One photographic gesture.** A tilted, drifting wall of images says "place, light, nature"
   before a word is read, and it reacts to scroll so the page feels alive from frame one.
2. **Restraint in colour.** Greens, sand and cream only; the gradient unifies mixed photography
   into one mood.
3. **Single-voice typography.** A light serif at extreme sizes against tiny caps captions. The
   scale jumps (10px to 180px) create hierarchy without weight or colour.
4. **Calm motion.** Long expo-out easings, masked word reveals, slow drift. Nothing bounces.
5. **Content as lifestyle.** Section titles ("Essence of Self-Care") sell a feeling; the hard
   facts (3, 9, 16 minutes) arrive as big counters instead of a spec list.

**Anti-patterns it avoids:** no stock-hero video, no bright CTA colour, no heavy weights, no
carousels with arrows; the WebGL layer never blocks input.

## Credits

- Original: [springs.estate](https://springs.estate/) by **Vide Infra**. Design and content are the
  intellectual property of their creators.
- Recognition: Awwwards Site of the Day, Developer Award.
- This study is an independent clean-room analysis. The rebuild uses a fictional development,
  AI-generated images and open-source fonts; it contains no original code, assets or copy.
