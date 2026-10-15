---
title: Igloo Inc
url: https://www.igloo.inc
studio: abeto
awards: [SOTY 2024, SOTD, Developer Award]
year: 2024
category: design-agencies
techniques: [webgl, shader, virtual-scroll, infinite-scroll-loop, scene-transitions, chromatic-aberration, particles, msdf-text, camera-timeline, spatial-audio]
stack: [three, gsap, customease, svelte, vite, ktx2, draco]
---

# Igloo Inc — clean-room study

A brand site with no DOM content: one fullscreen WebGL2 canvas draws everything, and native scroll
is switched off. A virtual scroll loops endlessly through three worlds (an igloo on a snowy valley,
an archive of ice shards, a fall through plasma portals into a round room) and the signature is the
**frost wipe** that hands one world over to the next: a diagonal ice cut with spectral colour
fringes and velocity-driven glitch. The look is one cool grey-blue snow palette, one mono typeface
and tiny white HUD labels.

Rebuild: [`rebuild/`](rebuild/) (fictional brand, generated images, open-source fonts).
Run it with `npm install && npm run dev`.

Method note: the original has no CSS to measure. Values come from its shipped bundles and from
screenshots, so the type scale in particular is approximated. Detail overlays and the mobile layout
were read from code only.

## Design Tokens

| Role | Value |
|---|---|
| Page and canvas background | `#a0a5b1` |
| HUD text, logo, plexus lines | `#ffffff` |
| Detail title | `#3c3c54` |
| Project title / project text | `#67707e` / `#a1aab7` |
| Archive background gradient | `#09121f` to `#6b7685`, diagonal |
| Fog and snow tints | `#e1e6f1` `#d1d6e3` `#afb6c7` `#b5d5ff` `#d7ebfa` |
| Warm fringe (portal edges only) | `#cda05e` `#ab8349` `#904619` |

```css
:root {
  --bg: #a0a5b1; --text: #ffffff; --title: #3c3c54;
  --grad-a: #09121f; --grad-b: #6b7685;
  --gutter: 125px; --top: 90px;           /* desktop */
  --e3: cubic-bezier(.6, 0, 0, 1);         /* the site's main curve (inOut3) */
}
body.small  { --gutter: 50px; --top: 45px; }   /* width < 1600 or height < 800 */
body.mobile { --gutter: 25px; --top: 25px; }   /* width < 640 or height < 640 */
html, body { overflow: hidden; touch-action: none; }
```

- **Type:** IBM Plex Mono (original: the same, rendered as MSDF inside WebGL; free on Google Fonts),
  weights 400 and 500, uppercase, about 12px with a 1.1 line height. The logo is a custom wide
  rounded-square lettering; substitute Orbitron or Michroma.
- **Type scale:** in the original, text is sized in world units of an orthographic UI scene (size
  `.09`, line height `.8`), not px. The CSS value above is inferred from 1440px screenshots.
- **Layout logic:** no fluid root. Margins switch by breakpoint flags (`small`, `mobile`) and every
  label hangs from a corner gutter.
- **Shape:** no radii, no borders, no CSS shadows. HUD frames are 1px white corner brackets. Depth
  comes from fog, a shadow map, glow on brick seams and a vignette.
- **Colour:** a monochrome cool world. Rainbow fringes come from the chromatic-aberration pass, not
  from design colours.

## Motion Spec

| What | Trigger | Animation | Duration / easing | Rebuild code |
|---|---|---|---|---|
| Custom eases | everywhere | nine CustomEase curves (`inOut1`-`inOut5`, `entry_ease`, `entry_ease_2`, `entry_ease_3`, `igloo_ease_1`) plus delta-time lerp helpers | `inOut3` = `M0,0 C.6,0 0,1 1,1` | `rebuild/src/eases.js` |
| Virtual infinite scroll | wheel, arrows, touch | no native scroll; target clamped to +/-750px-equivalent, two chained lerps (`.075` capped, then `.15`), loop via modulo over igloo / cubes / entry | continuous | `rebuild/src/scroll.js` |
| Idle auto-centre | 1.4s without input | tween to the nearest scene hero point; distance-scaled duration plus 2s when centring a scene | `inOut3` | `rebuild/src/scroll.js` |
| Scene layout and tokens | boot | scene heights (2.35 / 2 / 5.5), transition span, palette and copy in one config | n/a | `rebuild/src/config.js` |
| Intro | first load | `uIntro` 0 to 1, then a timed reveal from the plexus-covered aerial view down to the hero; scroll locked until it ends | 1s `inOut3`, then about 6-8s timeline | `rebuild/src/igloo.js` |
| Igloo assembly | scroll progress | exploded glowing bricks scrub into a clean igloo; camera drops in, manifesto fades in at 25-80% | 14s `power2.out` camera, scrubbed | `rebuild/src/igloo.js` |
| Falling snow | always | one `Points` object, motion fully in the vertex shader | continuous | `rebuild/src/snow.js` |
| Plexus lines | always | drifting nodes joined by hairlines, small crosses and numeric labels | continuous | `rebuild/src/plexus.js` |
| Portal fall | scroll progress 0-.52 | camera falls through three portals (peaks at .28 / .375 / .465), FOV 22 to 30, up-vector rotates to pi | 9.2s mapped to progress, `entry_ease*` and `power*` curves | `rebuild/src/entry.js` |
| Particle mascot | entering the room | particle cloud morphs from noise into the mascot shape | scrubbed | `rebuild/src/mascot-particles.js` |
| Archive shards | hover / click | refractive shard per project, ripple splat on hover, click opens the detail | velocity-reactive | `rebuild/src/cubes.js` |
| Frost wipe (signature) | scene handover | fullscreen-triangle shader mixes two render targets: diagonal cut displaced by an ice texture, 5-step chromatic aberration, scene parallax `.4 * power2In`, glitch from scroll velocity | wheel-driven `uProgress` 0 to 1 | `rebuild/src/transition.js` |
| Ice data texture | boot | procedural stand-in for the baked frost map (R ice cut, G and B displacement) | n/a | `rebuild/src/frost-texture.js` |
| HUD | scroll location | four corner groups, scramble text, scroll hint hides after 25% of the igloo height, bracket label "CLICK TO EXPLORE" in the room | `--e3` fades | `rebuild/src/hud.js` |
| Detail overlay | click shard | overlay with summary, socials and visit link; own wheel handler; close returns home | hash route `#/portfolio/<slug>` | `rebuild/src/detail.js` |
| Plate helpers | all scenes | shared vertex plate, noise and grade GLSL, cover sizing | n/a | `rebuild/src/scene-utils.js` |
| Sound | toggle | muted by default; synthesised Web Audio graph, volumes follow scroll progress | on unmute | `rebuild/src/audio.js` |
| Boot and render loop | always | fonts, scenes, compositor, `gsap.ticker` loop, adaptive DPR cap | per frame | `rebuild/src/main.js` |
| Hover and fades | hover | every UI transition uses the default curve | `cubic-bezier(.6,0,0,1)` | `rebuild/src/style.css` |

`prefers-reduced-motion`: the rebuild skips the timed intro and the glitch, and settles scroll
without the long tweens.

## Why Award-Worthy

1. **A scroll loop with no scroll.** Three worlds chain into an endless loop and each settles on its
   own hero moment when you stop. It behaves like film, not like a page.
2. **The transition is the brand.** A frost cut with spectral fringes and velocity-driven glitch fits
   ice and crypto, and it composites real scene render targets instead of cross-fading.
3. **Narrative continuity.** The camera falls from the igloo through portals into a room where the
   mascot assembles from particles. Every beat is scrubbed by scroll, so the visitor sets the pace.
4. **Restraint.** One cool palette, one mono face, tiny uppercase labels with `//////` markers and
   brackets. It reads as a sci-fi interface without colour noise.
5. **Performance discipline.** One canvas, a capped and adaptive pixel ratio, compressed textures and
   meshes, and decoding in workers.

**Anti-patterns it avoids:** no hamburger menu; no cards or boxed UI; no DOM-over-canvas sync jitter
(the UI lives in the canvas); no scroll-listener parallax; no nav chrome beyond four corner labels;
no stock hero video.

## Credits

- Original: [igloo.inc](https://www.igloo.inc) by **abeto**. Design and content are the
  intellectual property of their creators.
- Recognition: Awwwards Site of the Year 2024, Site of the Day, Developer Award.
- This study is an independent clean-room analysis. The rebuild uses an invented brand, AI-generated
  images and open-source fonts; it contains no original code, assets or copy.
