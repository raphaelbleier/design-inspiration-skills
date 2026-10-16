---
title: Oryzo AI
url: https://oryzo.ai/
studio: Lusion
awards: [SOTM Apr 2026, SOTD, Developer Award]
year: 2026
category: art-illustration
techniques: [webgl, product-3d, scroll-choreography, scroll-pinning, text-reveal, smooth-scroll, horizontal-scroll, satire]
stack: [three, gsap, scrolltrigger, splittext, lenis]
---

# Oryzo AI — clean-room study

A joke product site for a cork coaster, played completely straight: one real 3D coaster floats
through the whole page while a deadpan "AI breakthrough" story unfolds around it. The craft is in
the choreography: the object changes pose per section, a dashed frame sweeps over a giant word and
blurs it, and a pinned horizontal gallery closes the product story. Warm espresso background with
an orange glow from the bottom-left, cream type, one orange accent.

Rebuild: [`design-inspiration-rebuilds/art-illustration/oryzo-ai`](https://github.com/raphaelbleier/design-inspiration-skills/tree/main/skills/design-inspiration-rebuilds/art-illustration/oryzo-ai) (fictional content, generated images, open-source fonts; installed with the optional `design-inspiration-rebuilds` skill). Run it with `npm install && npm run dev`.

## Design Tokens

| Role | Value |
|---|---|
| Page (espresso) | `#17100b` |
| Ink (dark text, product panels) | `#100904` |
| Cream (text, footer panel) | `#ffedd7` |
| Orange (accent, numbers, model tag) | `#dc5000` |
| Glow (bottom-left radial) | `#6a3a20` to `#3a2112` to transparent |

```css
:root { --cream:#ffedd7; --ink:#100904; --orange:#dc5000; --ease:cubic-bezier(.22,1,.36,1); }
body::before { /* the signature glow */
  background: radial-gradient(90vmax 70vmax at 0% 105%, #6a3a20 0%, #3a2112 38%, transparent 70%);
}
```

- **Type:** one grotesk (original: Halyard Display; substitute: Hanken Grotesk) at 500 for display
  and 700 for the giant word. Hero `109px / .9`, tracking `-.018em`; giant word about `15vw`,
  tracking `-.045em`. Small labels are 11 to 12px uppercase 600. A serif italic (Literata) appears
  once for a punchline; a mono (DM Mono) for data readouts.
- **Shape:** dashed 1px hairlines, pill buttons, 4 to 6px image radii, no shadows. A cream scroll
  thumb is fixed on the right edge.

## Motion Spec

| What | Trigger | Animation | Duration / easing | Rebuild file |
|---|---|---|---|---|
| Smooth scroll | always | Lenis `{ lerp: .1 }` on the GSAP ticker, `lagSmoothing(0)` | n/a | `src/scroll.js` |
| Coaster | always, cursor | procedural cork coaster (lathe + speckle map), bob + cursor tilt | continuous | `src/disc.js` |
| Pose per section | scroll | each `data-pose` section scrubs x, y, tilt, spin, scale between poses | scrub .6, `none` | `src/disc.js` |
| Text reveal | enters at 88% | SplitText lines, `yPercent 40 > 0`, opacity, `blur(12px) > 0` | 1.1s `power3.out`, stagger .08 | `src/reveals.js` |
| Wearable frame | pinned 320vh | dashed frame sweeps across the giant word, blurred glowing copy inside; coaster follows | scrub .4 | `src/wear.js` |
| Product gallery | pinned | flex track translates horizontally | scrub .5, linear | `src/hscroll.js` |
| Count-ups | enters at 85% | numbers count from 0 | 1.6s `power2.out` | `src/features.js` |
| Temperature toggle | click | heat bars re-shape | .9s expo-out | `src/features.js` |
| Flip encryption | click | coin rotates `rotateX(180deg)` to show scrambled text | 1s expo-out | `src/features.js` |
| Progress thumb | scroll | right-edge cream bar tracks page progress | linear | `src/scroll.js` |

### Key excerpts

**Pose choreography**: `src/disc.js`
```js
els.forEach((el) => {
  const [x, y, tilt, spin, s] = el.dataset.pose.split(',').map(Number);
  const to = { x, y, tilt, spin, s };
  gsap.fromTo(pose, { ...prev }, { ...to, ease: 'none', immediateRender: false,
    scrollTrigger: { trigger: el, start: 'top 85%', end: 'top 25%', scrub: 0.6 } });
  prev = to;
});
```
One shared state object, one scrubbed `fromTo` per section: poses are authored in the HTML.

**Cork material**: `src/disc.js`
```js
const prof = [[0,-0.11],[1,-0.11],[1,0.11],[0.8,0.11],[0.74,0.04],[0,0.04]]
  .map(([r, y]) => new THREE.Vector2(r, y));
const geo = new THREE.LatheGeometry(prof, 96);
const mat = new THREE.MeshStandardMaterial({ map: tex, bumpMap: tex, bumpScale: 2.2, roughness: 0.92 });
// ...
if (Math.abs(N.getY(i)) > 0.5) UV.setXY(i, P.getX(i) * 0.5 + 0.5, P.getZ(i) * 0.5 + 0.5);
```
A recessed lathe profile; the same canvas speckle drives colour and bump; planar UVs avoid pinching.

**Blurred window over the word**: `src/wear.js`
```js
gsap.set(frame, { x: pose.x * innerWidth / 2 });
const f = frame.getBoundingClientRect(), m = main.getBoundingClientRect();
blur.style.left = `${m.left - f.left - 1}px`;   // copy stays glued to the original word
blur.style.top = `${m.top - f.top - 1}px`;
```
The frame clips (`overflow: hidden`) a blurred duplicate; it reads the same `pose.x` as the coaster.

**Line reveal**: `src/reveals.js`
```js
gsap.from(s.lines, { yPercent: 40, opacity: 0, filter: 'blur(12px)',
  duration: 1.1, ease: 'power3.out', stagger: 0.08,
  scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
```

**Horizontal gallery**: `src/hscroll.js`
```js
gsap.to(track, { x: () => -dist(), ease: 'none',
  scrollTrigger: { trigger: sec, start: 'top top', end: () => '+=' + (dist() + innerHeight * 0.5),
    pin: '.hpin', scrub: 0.5, invalidateOnRefresh: true } });
```

`prefers-reduced-motion`: Lenis, pose scrubbing, pinning and reveals are off; the gallery stacks vertically.

## Why Award-Worthy

1. **One object carries the page.** A single real-time coaster changes pose per section, so the
   product is never out of sight and the story needs no stock imagery.
2. **Deadpan copy meets serious craft.** The AI satire is written like a launch keynote; the
   visuals never wink, which is what makes it land.
3. **Type as set piece.** The blurred glowing window sweeping over a giant word is a cheap trick
   (clip plus duplicate) with a premium look.
4. **Tight palette.** Espresso, cream and one orange; the corner glow gives depth without gradients elsewhere.
5. **Interactive jokes.** Flip encryption, temperature toggle and the count-ups reward poking.

**Anti-patterns it avoids:** no generic fade-up reveals (blur plus mask instead), no shadows or
glass, no carousel dots, and the canvas never blocks input (`pointer-events: none`).

## Credits

- Original: [oryzo.ai](https://oryzo.ai/) by **Lusion**. Design and content are the intellectual
  property of their creators.
- Recognition: Awwwards Site of the Month (Apr 2026), Site of the Day, Developer Award.
- This study is an independent clean-room analysis. The rebuild uses a fictional product,
  AI-generated images and open-source fonts; it contains no original code, assets or copy.
