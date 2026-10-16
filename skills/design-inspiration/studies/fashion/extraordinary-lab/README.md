---
title: GQ & AP The Extraordinary Lab
url: https://www.gq.com/sponsored/story/the-extraordinary-lab
studio: Immersive Garden
awards: [SOTM Mar 2026, SOTD, Developer Award]
year: 2026
category: fashion
techniques: [webgl, camera-path, scroll-driven, chromatic-aberration, wireframe, text-reveal, smooth-scroll, generative-audio]
stack: [three, gsap, scrolltrigger, lenis, vite]
---

# GQ & AP The Extraordinary Lab — clean-room study

A sponsored editorial story that is not a page but a **flight through a blueprint**. The
whole screen is one black WebGL space of white hairline drawings (floor plans, sketches,
technical plates) floating in perspective. Scrolling moves a camera through it while short
chapters of light, uppercase type appear over the drawing. A sound gate opens the experience.

Rebuild: [`design-inspiration-rebuilds/fashion/extraordinary-lab`](https://github.com/raphaelbleier/design-inspiration-skills/tree/main/skills/design-inspiration-rebuilds/fashion/extraordinary-lab) (fictional content, generated images, open-source fonts; installed with the optional `design-inspiration-rebuilds` skill). Run it with `npm install && npm run dev`.

## Design Tokens

| Role | Value |
|---|---|
| Background | `#000000` |
| Line / type | `#ffffff`, secondary `rgba(255,255,255,.55)` |
| Aberration fringes | red `rgba(255,40,80,.5)`, blue `rgba(40,160,255,.5)` |

```css
:root {
  --bg: #000; --ink: #fff; --dim: rgba(255,255,255,.55);
  --ease: cubic-bezier(.22, 1, .36, 1);          /* expo-like out, used for UI */
}
.gate h1 { font-weight: 200; text-transform: uppercase; line-height: .95;
  text-shadow: -2px 0 rgba(255,40,80,.55), 2px 0 rgba(40,160,255,.55); }   /* CSS echo of the RGB split */
```

- **Type:** a very light geometric grotesk (original: GT America thin; substitute Hanken Grotesk
  200) in uppercase for titles, 500-weight tiny tracked caps for UI labels, and one high-contrast
  garamond italic (EB Garamond) for single accent words and the partner mark.
- **Palette:** pure black and white only. Colour appears solely as the red/blue edge fringe of
  the lens effect.
- **Shape:** no cards, no radii, no shadows. 1px white frames around buttons and images.

## Motion Spec

| What | Trigger | Animation | Duration / easing | Rebuild file |
|---|---|---|---|---|
| Smooth scroll | always | Lenis `{ lerp: .08 }` on `gsap.ticker`, locked until the gate closes | — | `src/scroll.js` |
| Camera flight | scroll 0 → 1 | camera rides a CatmullRom spline, looks 3% ahead on the same curve, damped `.06` per frame, pointer parallax ±.35 | continuous | `src/scene.js` |
| Blueprint world | always | 44 sketch plates + 26 edge-only boxes + ground grid, `FogExp2 .028` fades distance to black | — | `src/scene.js` |
| Procedural sketches | load | canvas hairlines (plans, gears, sections, scribble) used as plate textures | — | `src/sketch.js` |
| Chromatic aberration | always, scroll velocity | RGB split grows with radius and with scroll speed; grain and vignette in the same pass | split `.0016 + vel * .02` | `src/post.js` |
| Sound gate | click anywhere | gate fades, scroll unlocks, drone fades in | gate 1.2s, audio 2s | `src/audio.js` |
| Title intro | load | title lines rise and fade | 1.6s `expo.out`, stagger .15 | `src/main.js` |
| Chapter text | enters at 75% | blur 6px → 0, `y: 24 → 0`, reverses on scroll up | 1.2s `expo.out`, stagger .12 | `src/chapters.js` |
| Figure reveal | enters at 85% | `clip-path: inset(0 0 100% 0)` opens downward | 1.3s `expo.out` | `src/chapters.js` |

### Key excerpts

**Camera on a spline**: `src/scene.js`
```js
const path = new THREE.CatmullRomCurve3([
  [0, 0, 6], [-1.5, 0.6, -20], [2.5, -0.4, -48], [-2, 1, -76], [1.5, -.2, -100], [0, 0, -124],
].map((p) => new THREE.Vector3(...p)));
// ...
state.cur += (state.target - state.cur) * 0.06;          // damped scroll progress
camera.position.copy(path.getPoint(Math.min(state.cur, .995)));
camera.position.x += state.mx * 0.7; camera.position.y -= state.my * 0.5;
camera.lookAt(path.getPoint(Math.min(state.cur + .03, 1)));
```
Scroll progress is a single number; the whole story is one curve.

**Chromatic aberration pass**: `src/post.js`
```glsl
vec2 d = vUv - .5;
float k = uSplit * (.4 + dot(d,d) * 6.);          // split grows toward the edges
float r = texture2D(tDiffuse, vUv + d * k).r;
float g = texture2D(tDiffuse, vUv).g;
float b = texture2D(tDiffuse, vUv - d * k).b;
```

**Velocity-driven split**: `src/scene.js`
```js
state.vel = Math.abs(state.cur - prev) * 60;
ca.uniforms.uSplit.value = 0.0016 + Math.min(state.vel * 0.02, 0.012);
```
Fast scrolling tears the colour channels apart, stopping heals them.

**Chapter reveal**: `src/chapters.js`
```js
gsap.set(items, { opacity: 0, y: 24, filter: 'blur(6px)' });
gsap.to(items, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.2, ease: 'expo.out', stagger: 0.12,
  scrollTrigger: { trigger: ch, start: 'top 75%', toggleActions: 'play none none reverse' } });
```

**Sound gate**: `src/audio.js`
```js
const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 220;
[55, 55.7, 110.2].forEach((f, i) => { /* detuned sines into the lowpass */ });
lfo.frequency.value = .08;                       // slow breathing on master gain
gsap.to(master.gain, { value: on ? .35 : 0, duration: 2, ease: 'power2.out' });
```

`prefers-reduced-motion`: Lenis, damping and all reveals are off; the camera still follows scroll
but jumps directly to the target.

## Why Award-Worthy

1. **The interface is the world.** No page chrome competes with the scene; a single fixed canvas
   holds the identity and the text sits on top of it.
2. **Monochrome discipline.** Only black and white line work, so the lens fringe is the sole
   colour and reads as light, not decoration.
3. **Scroll as camera.** One progress value drives a spline flight, which makes pacing trivial to
   tune and feels like film rather than a page.
4. **Light, uppercase type with one serif accent.** Thin weights echo the hairline drawings.
5. **Sound as a gate.** A single deliberate click starts audio and scroll together, which sets the
   tone before any content appears.

**Anti-patterns it avoids:** no cards or boxes of copy, no colour gradients, no parallax
sections stacked on a normal page, no autoplaying audio without consent.

## Credits

- Original: [GQ & AP The Extraordinary Lab](https://www.gq.com/sponsored/story/the-extraordinary-lab) by
  **Immersive Garden**. Design and content are the intellectual property of their creators.
- Recognition: Awwwards Site of the Month (Mar 2026), Site of the Day, Developer Award.
- This study is an independent clean-room analysis. The rebuild uses a fictional brand and story,
  procedural drawings, AI-generated images and open-source fonts; it contains no original code,
  assets or copy.
