---
title: Slosh Seltzer
url: https://sloshseltzer.com/
studio: Active Theory
awards: [SOTM Jun 2024, SOTD, Developer Award]
year: 2024
category: food-drink
techniques: [webgl, age-gate, scroll-scrub, text-reveal, 3d-product, particles, smooth-scroll, marquee]
stack: [three, gsap, scrolltrigger, splittext, lenis, vite]
---

# Slosh Seltzer — clean-room study

A fake seltzer brand ("in-house maximalist design exploration") that behaves like a party. An
age gate leads into a flat saturated world where a 3D **aluminium can** is the hero: pop the tab,
foam erupts, huge condensed type swells from ghost to solid, a pile of **3D fruit** rains onto
yellow, and four colour bands scroll behind a spinning can that changes flavour. Pink, green,
orange, yellow, blue and cream, no gradients, no shadows, doodles everywhere.

Rebuild: [`design-inspiration-rebuilds/food-drink/slosh-seltzer`](https://github.com/raphaelbleier/design-inspiration-skills/tree/main/skills/design-inspiration-rebuilds/food-drink/slosh-seltzer) (fictional brand "Fizzo Spritz", placeholder image slots, open-source fonts; installed with the optional `design-inspiration-rebuilds` skill). Run it with `npm install && npm run dev`.

## Design Tokens

| Role | Value |
|---|---|
| Pink (gate, "good times" section, type on colour) | `#FFC1FF` |
| Red (type on pink, CTA) | `#FF0837` |
| Green (hero, outro CTA) | `#00A165` |
| Blue (cups section, party) | `#0069D8` |
| Orange (type on yellow, can) | `#FF5F00` |
| Yellow (taste section) | `#FFC800` |
| Cream (neutral sections) | `#ECE4D5` |

```css
:root {
  --red: #FF0837; --pink: #FFC1FF; --green: #00A165; --blue: #0069D8;
  --orange: #FF5F00; --cream: #ECE4D5; --yellow: #FFC800;
  --ink: var(--pink);                       /* fixed chrome takes the section's ink colour */
  --display: 'Anton', sans-serif;           /* original: Steelfish ExtraBold */
  --mono: 'DM Mono', monospace;             /* original: FK Grotesk Mono */
}
```

- **Type:** one ultra-condensed heavy display face, uppercase, `line-height: .8`, sizes driven by
  `min(vw, vh)` so a headline always fills the viewport (`min(22vw, 32vh)` hero, `min(17vw, 31vh)`
  "good times"). A tiny uppercase mono carries all small print and the vertical side labels.
- **Colour rule:** each section is one flat background with exactly one ink colour, never two
  neighbouring sections alike; the type colour is the *previous* theme colour (red on pink, orange
  on yellow, blue on cream).
- **Section edges:** a wavy mask (`mask-image` SVG path, 3.6vw tall) joins sections like a liquid line.
- **Texture:** hand-drawn doodles (star, bolt, smiley, squiggle) scattered per section, each drifting.
- **Chrome:** fixed centre logo and four vertical mono labels ("0 grams sugar", "4 flavors" ...) that
  recolour to the section ink.

## Motion Spec

| What | Trigger | Animation | Duration / easing | Rebuild file |
|---|---|---|---|---|
| Smooth scroll | always | Lenis `{ lerp: .1, smoothWheel, syncTouch }` on the GSAP ticker, locked until the gate is passed | — | `src/scroll.js` |
| Age gate wipe | click "I'm ready to party" | gate content fades, green `clip-path: circle(0 -> 150% at 50% 62%)` covers the pink | 1s `power3.inOut` | `src/gate.js` |
| Hero intro | after the gate | title words slide in from opposite edges, can scales in, tag/arrow pop with stagger | 1.1s `power4.out`; can `back.out(1.6)` | `src/gate.js`, `src/can.js` |
| Can pop | click tab or scroll 60px | tab hinge lifts -0.9 rad, dark opening appears, can spins one turn | .25s / .9s `power3.out` | `src/can.js` |
| Foam eruption | on pop | 90 pink circles fired into an upward cone, scale 0 -> 1, then bob | .9-1.3s `power3.out`, stagger over .5s | `src/foam.js` |
| "Good times flowing" | scroll scrub | chars rise from a ghost tint to red; FLOWING skews -14deg and scales 1.45x while line one exits | scrubbed .6 | `src/reveals.js` |
| Bubbles | scroll | 70 translucent dots rise at random speeds | scrubbed | `src/reveals.js` |
| Falling fruit | scroll scrub | 18 3D fruit drop into a pile with a bounce, each spinning out of its fall | `bounce.out`, staggered windows | `src/fruit.js` |
| Cup section | scroll + pointer | image rises with rotation, tilts +-5deg with the pointer | scrubbed; quickTo .6s | `src/reveals.js` |
| Flavor bands | scroll scrub (420vh) | four rows slide in opposite directions; the lying can spins 5 turns and swaps flavour at 25/50/75% with a pop | `none`; `back.out(2)` .6s | `src/reveals.js`, `src/can.js` |
| Outro | scroll | outlined "SIP SIP HOORAY" marquee, hands image opens with `clip-path: inset(0 50% -> 0)` | scrubbed | `src/reveals.js` |
| Chrome theme | section crosses 50% | logo and side labels recolour | .5s | `src/theme.js` |

### Key excerpts

**One canvas, objects pinned to DOM anchors**: `src/gl.js`
```js
export const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -3000, 3000);   // 1 unit = 1 CSS px
export function place(obj, el, dx = 0, dy = 0) {
  const r = el.getBoundingClientRect();
  obj.position.set(r.left + r.width / 2 - size.w / 2 + dx, size.h / 2 - (r.top + r.height / 2) - dy, 0);
  return r;
}
```
Layout stays in CSS; every frame the 3D can or pile is moved onto its anchor, so it scrolls with Lenis for free.

**Procedural can with a label texture**: `src/can.js`
```js
const bodyMat = new THREE.MeshStandardMaterial({ map: labelTexture(flavor), metalness: 0.55, roughness: 0.32 });
spin.add(new THREE.Mesh(new THREE.CylinderGeometry(R, R * 0.96, H, 64, 1, true), bodyMat));
const lid = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.9, R * 0.97, 0.08, 64), silver);
const tab = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.035, bevelEnabled: false }), silver);
```
The flavour swap just redraws the canvas texture; the tab outline is a `Shape` with a hole.

**Pop sequence**: `src/can.js`
```js
gsap.timeline()
  .to(hero.hinge.rotation, { x: -0.9, duration: 0.25, ease: 'power2.out' })
  .add(() => { hero.opening.visible = true; }, 0.1)
  .to(hero.spin.rotation, { y: -Math.PI * 2, duration: 0.9, ease: 'power3.out' }, 0)
  .to(state, { pop: 1, duration: 0.01 }, 0.18);
```

**Fruit pile driven by scroll progress, no physics**: `src/fruit.js`
```js
const t = Math.min(1, Math.max(0, (state.fruit - it.win) / 0.4));   // staggered window per fruit
const e = bounce(t);                                               // gsap 'bounce.out'
it.mesh.position.set(restX * (0.4 + 0.6 * e), restY + (1 - e) * size.h * 1.15, it.z);
it.mesh.rotation.set((1 - t) * it.spin * 3, (1 - t) * it.spin * 2, it.x + (1 - t) * it.spin);
```
Scrubbing a deterministic fall is scroll-reversible and costs nothing per frame.

**Ghost-to-solid headline**: `src/reveals.js`
```js
gsap.set([A, B], { opacity: 0.35, color: '#EBB0EB', yPercent: 30 });
gsap.timeline({ scrollTrigger: scrub('#flow', 'top 70%', 'bottom bottom') })
  .to(A, { yPercent: 0, opacity: 1, color: '#FF0837', stagger: 0.02, duration: 0.2 }, 0)
  .to('#flowB', { skewX: -14, scale: 1.45, transformOrigin: '50% 100%', duration: 0.4, ease: 'power2.in' }, 0.5);
```

`prefers-reduced-motion`: no Lenis, no scrubs, sections are normal height, the can is popped and the fruit
pile is already in place.

## Why Award-Worthy

1. **A real object as the hero.** The can is modelled, lit and pop-able, then reused as the spinning
   centrepiece of the band section. One 3D asset carries the whole story.
2. **Colour as structure.** Seven flat colours, one per section, with the type in the neighbour's colour.
   Navigation by colour change alone.
3. **Type that fills the screen.** Condensed caps sized in `vh` and `vw` so headlines are always as big
   as the viewport allows; the ghost-to-solid scrub gives each phrase a beat.
4. **Playful interaction with a payoff.** The age gate is a joke, the pop is a real event (tab, foam,
   spin), and the fruit rains in time with the scroll.
5. **Tiny supporting detail.** Doodles, vertical mono labels, wavy section edges and a rotating badge
   make flat colour feel hand-made.

**Anti-patterns it avoids:** no gradients or drop shadows; no generic fade-up reveals; no stock
carousel; the WebGL canvas never captures input (`pointer-events: none`) and the pop is also available
as a plain button.

## Credits

- Original: [sloshseltzer.com](https://sloshseltzer.com/) by **Active Theory**. Design and content are
  the intellectual property of their creators.
- Recognition: Awwwards Site of the Month (Jun 2024), Site of the Day, Developer Award.
- This study is an independent clean-room analysis. The rebuild uses a fictional brand, placeholder image
  slots and open-source fonts; it contains no original code, assets or copy.
