---
title: Ponpon Mania
url: https://ponpon-mania.com/
studio: Patrick Heng, Justine Soulié
awards: [SOTM Oct 2025, SOTD, Developer Award]
year: 2025
category: games-entertainment
techniques: [webgl, shader, grain-gradient, page-transitions, carousel, drag-interaction, smooth-scroll, parallax, clip-path-reveal]
stack: [three, gsap, scrolltrigger, lenis, nuxt, vue, fontsource]
---

# Ponpon Mania — clean-room study

An interactive comic for a cartoon hamster, presented like a record collection. There is no
conventional page: a flat lavender landing, a sprayed orange-and-pink WebGL backdrop behind a
tilted carousel of "album covers", and an about page that scrolls from a giant illustration into
a starfield. Everything is held together by one fat wordmark, one ink black (`#171717`) and a
single soft curve.

Rebuild: [`design-inspiration-rebuilds/games-entertainment/ponpon-mania`](https://github.com/raphaelbleier/design-inspiration-skills/tree/main/skills/design-inspiration-rebuilds/games-entertainment/ponpon-mania) (fictional content, generated images, open-source fonts; installed with the optional `design-inspiration-rebuilds` skill). Run it with `npm install && npm run dev`.

## Design Tokens

| Role | Value |
|---|---|
| Ink (header, player, dark section) | `#171717` |
| Cream / peach (light text on dark, header on home) | `#fff5f0` / `#feece3` |
| Home lavender | `#7f7fff` |
| Orange (chapters + about) | `#fb7a00` |
| Pink blob | `#ee8fb8` |
| Chapter chip tints | `#ffc6ac` `#ffb399` |

```css
:root {
  --ink: #171717; --cream: #fff5f0; --peach: #feece3;
  --lav: #7f7fff; --orange: #fb7a00; --pink: #ee8fb8;
  --ease: cubic-bezier(.4, 0, .2, 1);   /* the only UI curve */
}
html { font-size: 62.5%; }               /* original works in 10px rem */
```

- **Type:** Libre Franklin (free on Google Fonts) does all UI and headlines: weight 800 for nav and
  buttons, 900 with `letter-spacing: -.03em` and `line-height: ~1` for the about headline. The
  two-line lowercase wordmark is a chunky custom lettering (substitute: Bagel Fat One).
- **Shape:** pills everywhere. The player is a 310-376 x 60-90 px capsule, nav links get a 1.5px outline pill with
  a 2 degree tilt when active, the primary button is a 204 x 62 px ink capsule.
- **Colour logic:** the header is ink on orange and cream on lavender and dark; it flips with a
  `.4s` colour transition.
- **Illustration:** thick black outline, flat fills, paper grain. Covers have a crumpled-plastic
  sheen. The 3D feel comes from CSS/WebGL tilt, not shading.

## Motion Spec

| What | Trigger | Animation | Duration / easing | Rebuild file |
|---|---|---|---|---|
| Sprayed blob background | always, cursor | domain-warped fbm noise thresholded to two flat colours; grain dithers the edge so it looks airbrushed; cursor offsets the field | continuous, mouse lerp .05 | `src/bg.js` |
| View palette morph | route change | shader colours, edge softness and grain tween: lavender flat, orange/pink sprayed, soft orange clouds | 1.2s `power2.inOut` | `src/bg.js` |
| Curtain page transition | link click | dark band with wavy edges sweeps up over the screen, view swaps under it, band exits | 0.7s + 0.7s `power3.inOut` | `src/router.js` |
| Sticker | always, cursor | text ring spins; the badge drifts opposite to the cursor | 18s linear; quickTo .9s `power3.out` | `src/home.js` |
| Read-now button | hover | tilts toward the pointer, scales 1.06, springs back | .4s `power3.out`; leave .9s `elastic.out(1,.5)` | `src/home.js` |
| Cover carousel | drag / arrows / click | covers sit on a fan: x offset, 9 degree z-rotation, 16 degree y-tilt, scale .78 for neighbours | .9s `power3.out` | `src/chapters.js` |
| Player pill | chapter change | title and timecode swap; prev/next disable at the ends | instant | `src/chapters.js` |
| Reader | click cover / play | cream layer opens as a circle from the play button; page pops in with a small rotation | .9s `power3.inOut`; page `back.out(1.2)` | `src/chapters.js` |
| About headline | enter | lines rise out of an overflow mask | 1s `power3.out`, stagger .12 | `src/about.js` |
| Hero illustration | scroll | rises from 40vh to -30vh while the page scrolls | scrubbed (scrub 1) | `src/about.js` |
| Dark section edge | scroll | the diagonal top edge flattens to 0 as the section arrives | scrubbed | `src/about.js` |
| Starfield | always | 140 twinkling pin stars and 16 teal glows drift upward | continuous | `src/stars.js` |
| Smooth scroll | about page | Lenis on the wrapper, `lerp: .1`, driven by `gsap.ticker` | — | `src/about.js` |

### Key excerpts

**Sprayed blob edge**: `src/bg.js`
```glsl
vec2 p = (uv - 0.5) * vec2(uRes.x / uRes.y, 1.0) * 0.75 + uTime * 0.035 + uMouse * 0.06;
vec2 q = vec2(fbm(p + 1.7), fbm(p + 8.3));
float n = fbm(p + 1.6 * q);                              // domain warp = organic blob shapes
float g = hash(gl_FragCoord.xy) - 0.5;                   // per-pixel grain
float t = (n - 0.5) / max(uW, 0.001);
float e = smoothstep(-1.0, 1.0, t + g * uGrain * 2.0);   // small uW + big grain = airbrush edge
vec3 col = mix(uA, uB, e);
```
The same shader is flat lavender (`uW .5`, same colours), sprayed (`uW .05`, grain 1) or soft clouds (`uW .9`, grain .06).

**Palette morph per view**: `src/bg.js`
```js
export const PALETTES = {
  home:     { a: '#7f7fff', b: '#7f7fff', c: '#7f7fff', w: 0.5,  grain: 0.0 },
  chapters: { a: '#fb7a00', b: '#ee8fb8', c: '#fb7a00', w: 0.05, grain: 1.0 },
  about:    { a: '#fb7a00', b: '#ff8c1a', c: '#f57300', w: 0.9,  grain: 0.06 },
};
// ...
gsap.to(U[u].value, { r: c.r, g: c.g, b: c.b, duration: d, ease: 'power2.inOut', overwrite: 'auto' });
gsap.to(U.uW, { value: p.w, duration: d, ease: 'power2.inOut', overwrite: 'auto' });
```

**Curtain transition**: `src/router.js`
```js
// curtain = 500vh SVG, solid band between two wavy edges; -35% covers the viewport, -76% clears it
gsap.timeline({ onComplete: () => { gsap.set(curtain, { yPercent: 0 }); busy = false; } })
  .to(curtain, { yPercent: -35, duration: 0.7, ease: 'power3.inOut' })
  .add(() => swap(to))
  .to(curtain, { yPercent: -76, duration: 0.7, ease: 'power3.inOut' }, '+=0.1');
```

**Cover carousel fan**: `src/chapters.js`
```js
covers.forEach((c, i) => {
  const d = i - cur;
  gsap.to(c, {
    x: d * s * 1.12, y: Math.abs(d) * innerHeight * 0.02, rotation: d * 9, rotationY: -d * 16,
    scale: d === 0 ? 1 : 0.78, opacity: Math.abs(d) > 2 ? 0 : 1, zIndex: 10 - Math.abs(d),
    duration: animate ? 0.9 : 0, ease: 'power3.out', overwrite: 'auto',
  });
});
```

**Button tilt toward the cursor**: `src/home.js`
```js
btn.addEventListener('pointermove', (e) => {
  const r = btn.getBoundingClientRect();
  const dx = (e.clientX - r.left) / r.width - 0.5;
  gsap.to(btn, { rotate: dx * 12, scale: 1.06, duration: 0.4, ease: 'power3.out', overwrite: 'auto' });
});
btn.addEventListener('pointerleave', () =>
  gsap.to(btn, { rotate: 0, scale: 1, duration: 0.9, ease: 'elastic.out(1, .5)', overwrite: 'auto' }));
```

`prefers-reduced-motion`: the curtain is skipped (views swap instantly), palette tweens and shader
drift stop, Lenis is not created and scroll-linked effects are not built.

## Why Award-Worthy

1. **A comic that behaves like a record shelf.** Covers, a play pill, track numbers: the metaphor
   makes an unfamiliar format instantly operable, and drag/arrows feel natural.
2. **One backdrop shader, three personalities.** The same airbrush gradient is flat on the
   landing, sprayed on the shelf and soft on the about page, so the world feels continuous while
   each page has its own mood.
3. **Tilted, never flat.** Neighbour covers lean in z and y, buttons lean toward the cursor, the
   active nav link is rotated 2 degrees. Small off-axis angles keep a hand-made, toy-like feeling.
4. **Restraint in colour.** One ink black, one cream, and a saturated pair (orange, pink) plus a
   lavender landing. Nothing else competes with the illustration.
5. **A transition with a shape.** The wavy curtain is the same gesture on every route, so
   navigation reads as turning a page.

**Anti-patterns it avoids:** no scrollbar chrome or traditional menu; no drop shadows on UI; no
stock easing variety (one curve); no WebGL that blocks reading; no auto-playing text carousels.

## Credits

- Original: [ponpon-mania.com](https://ponpon-mania.com/) by **Patrick Heng, Justine Soulié**. Design and
  content are the intellectual property of their creators.
- Recognition: Awwwards Site of the Month (Oct 2025), Site of the Day, Developer Award.
- This study is an independent clean-room analysis. The rebuild uses a fictional character,
  AI-generated images and open-source fonts; it contains no original code, assets or copy.
