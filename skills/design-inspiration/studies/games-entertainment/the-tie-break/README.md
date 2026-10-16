---
title: The Tie-break!
url: https://thetiebreak.merci-michel.com/
studio: Merci Michel
awards: [SOTD, Developer Award]
year: 2026
category: games-entertainment
techniques: [webgl, shader, game-as-landing-page, ripple, camera-shake, image-reveal, procedural-audio]
stack: [three, gsap, vite, glsl]
---

# The Tie-break! — clean-room study

A sportswear campaign delivered as a playable **Pong-style tennis game** instead of a scrolling
page. The viewport is the court: a blurred, grainy lookbook photo fills the screen, white court
lines are drawn on top of it, and every rally event (hit, goal, countdown) is answered by a
shader ripple and a small camera shake. Each point ends with a circular **iris** that opens at the
ball and reveals a sharp product photo underneath the blur. The page is not a document: it never
scrolls, it is a phase machine.

Rebuild: [`design-inspiration-rebuilds/games-entertainment/the-tie-break`](https://github.com/raphaelbleier/design-inspiration-skills/tree/main/skills/design-inspiration-rebuilds/games-entertainment/the-tie-break) (fictional content, generated images, open-source fonts; installed with the optional `design-inspiration-rebuilds` skill). Run it with `npm install && npm run dev`.

## Design Tokens

| Role | Value |
|---|---|
| White (type, lines, paddles, ball) | `#ffffff` |
| Ink (blue-black text on light) | `#142a48` |
| Navy (plate fallback, loading) | `#05152d` |
| Photo palette | cobalt, cream, crimson, pale lilac-grey (blurred plates) |

```css
:root {
  --white:#fff; --ink:#142a48; --navy:#05152d;
  --serif:'Instrument Serif',serif; --sans:'Work Sans',system-ui,sans-serif;
  --out-expo:cubic-bezier(.19,1,.22,1);
  --spring:cubic-bezier(.19,1.51,.29,.99);
  --io-quad:cubic-bezier(.455,.03,.515,.955);
}
/* Poster scaling: every size is in em, root font-size is set from JS.
   10px * min(vw/1920, vh/1080) landscape, min(vw/402, vh/732) portrait. */
```

- **Type:** a light humanist sans (Work Sans 300/500, original is a similar grotesk) for UI and
  labels, a high-contrast italic serif (Instrument Serif) for big headlines and score digits.
- **Colour is borrowed from the photo.** UI is pure white; all chroma comes from the blurred
  plate behind it, so each point changes the mood of the whole screen.
- **No breakpoints:** the layout scales as a poster (landscape 1920x1080, portrait 402x732) and
  portrait gets its own rotated court.

## Motion Spec

| What | Trigger | Animation | Duration / easing | Rebuild file |
|---|---|---|---|---|
| Phase machine | click / game events | preloader, home, 4 intro steps, 3-2-1, play, reveal, end; page never scrolls | intro auto-advances every 5s | `src/main.js` |
| Court line draw-in | after preloader | each segment grows a to b with per-line stagger; net stubs lengthen while playing | 2.2s linear master, per-line `power3.out` | `src/fx/lines.js` |
| Line colour | always | overlay blend with white, lines pick up the photo's hue | — | `src/fx/lines.js` |
| Blurred plate + grain | always | pre-blurred photo, 4% over-scale, slow sine drift, live film grain, cross-fade after each point | grain 12 fps, drift period ~60s | `src/fx/background.js` |
| Hit / countdown ripple | paddle hit, 3-2-1 | three exp rings expand and push the UV outward | 800ms / 900ms `power2.out` | `src/fx/ripples.js` |
| Camera shake | hit, countdown, goal | random per-frame offset of the whole stage, linear decay | 300ms, amp .01 / .00585 / .1 | `src/fx/shake.js` |
| Point iris reveal | goal | circle opens at the ball, sharp photo zooms 3 to 1, radial displacement wave, 3-step glow edge | 2.1s progress, 2.2s zoom, `power3.out` | `src/fx/iris.js` |
| Iris out | continue | inverted mask grows from screen centre, game returns | 1.1s `power3.out` | `src/fx/iris.js` |
| Rally physics | play | ball speed .6 + .045 per hit (max 1.3), exit angle from paddle offset, predictive bot with per-point error | frame-rate normalised, dt <= 50ms | `src/game/pong.js` |
| Countdown pop | start | digit scales 1.8 to 1 then 1 to .5 | 450ms `cubic-bezier(.19,1,.22,1)` | `src/main.js` |
| Poster scaling | resize | root font-size from min(vw/W, vh/H) | — | `src/scale.js` |
| UI feedback | click, hit | synthesised Web Audio blips, no sample files | 50-300ms | `src/ui/audio.js` |

### Key excerpts

**Court lines, overlay-blended**: `src/fx/lines.js`
```glsl
float segLine(vec2 p, vec4 s){
  vec2 a = s.xy, b = s.zw, ba = b - a;
  float h = clamp(dot(p - a, ba) / dot(ba, ba), 0., 1.);
  float d = length(p - a - ba * h);
  return 1. - smoothstep(uLineTh * .5 - .5, uLineTh * .5 + .5, d);   // AA 2px segment
}
vec3 overlayBlend(vec3 b, vec3 s){
  return mix(2. * b * s, 1. - 2. * (1. - b) * (1. - s), step(.5, b));
}
```
Lines are distance fields, so they can grow from a to b by animating the endpoint.

**Ripple rings**: `src/fx/ripples.js`
```glsl
float d = length(p - r.xy) / H;
float rad = r.z * r.w * .09 * 2.2;
float w = exp(-28. * abs(d - rad)) + .5 * exp(-22. * abs(d - rad * .7)) + .3 * exp(-22. * abs(d - rad * .45));
return w * smoothstep(0., .08, r.z) * (1. - r.z);
```
Three concentric rings, faded in and out by progress; the sum also refracts the UV.

**Iris reveal mask and wave**: `src/fx/iris.js`
```glsl
vec3 r = uIrisP * 1.08 - IR_OFF;
float m = (smoothstep(r.x + .02, r.x - .02, d) + smoothstep(r.y + .02, r.y - .02, d)
         + smoothstep(r.z + .02, r.z - .02, d)) / 3.;          // soft 3-step edge
float wave = sin(dr * 35. - uTime * 6.) * exp(-abs(dr) * 40. / uIrisThick);
```
```js
gsap.to(s, { z: 1, duration: 2.2, ease: 'power3.out' })        // image zoom 3 -> 1
return gsap.to(s, { p: 1, duration: 2.1, ease: 'power3.out' }).then()
```

**Predictive bot**: `src/game/pong.js`
```js
const t = (1 - st.a) / Math.max(.05, st.speed * Math.cos(st.ang))
bot.tgt = fold(st.b + st.speed * Math.sin(st.ang) * (L.fl / L.fw) * t) + bot.err
// ...
function newPoint() { bot.maxV = rnd(.55, .9); bot.diff = rnd(.07, .17) }   // difficulty re-rolled per point
```
`fold` is a triangle wave that mirrors the trajectory off the side walls.

**Camera shake on the DOM stage**: `src/fx/shake.js`
```js
gsap.to(s, { a: 0, duration: .3, ease: 'none', onUpdate: tick, onComplete: tick })
// ...
const px = s.a * innerHeight * .35
el.style.transform = `translate(${(Math.random() - .5) * 2 * px}px,${(Math.random() - .5) * 2 * px}px) scale(1.012)`
```

`prefers-reduced-motion`: ripples and shake are skipped, the iris becomes a 0.35s wipe, line draw-in
and intro auto-advance are shortened or slowed.

## Why Award-Worthy

1. **The product is the interaction.** A campaign for sportswear is a game you actually play; the
   brand message arrives only at the end, after you have earned the attention.
2. **One shader pass carries the whole feel.** Photo, grain, court lines, ripples and iris are one
   fragment shader, so every effect composites with the others and costs one draw call.
3. **Reward per point.** The iris turns each goal into a small reveal of a sharp photograph under
   the blurred game, a loop that ties play to content.
4. **Feedback on every event.** Hit, countdown and goal each get their own ripple size and shake
   amplitude; the game feels physical without any 3D scene.
5. **Poster scaling.** An em-based UI driven by one root font-size keeps type and court in exact
   proportion on every screen, with a separately designed portrait court for phones.

**Anti-patterns it avoids:** no scrolling page hiding the content, no separate "game" section
bolted onto a brochure site, no sample-based audio payload, no UI chrome competing with the court,
no breakpoints that reflow the composition.

## Credits

- Original: [thetiebreak.merci-michel.com](https://thetiebreak.merci-michel.com/) by **Merci
  Michel**. Design and content are the intellectual property of their creators.
- Recognition: Awwwards Site of the Day, Developer Award.
- This study is an independent clean-room analysis. The rebuild uses invented brand names and copy,
  AI-generated images and open-source fonts; it contains no original code, assets or copy.
