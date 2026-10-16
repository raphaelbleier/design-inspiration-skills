---
title: Why Zero
url: https://why.zero.university/
studio: Sindhur Dutta
awards: [SOTM Sep 2026, SOTD, Developer Award]
year: 2026
category: culture-education
techniques: [webgl, shader, wheel-driven-stages, preloader, gesture-input, glassmorphism, cursor-trail]
stack: [three, gsap, custom-glsl]
---

# Why Zero — clean-room study

A single-viewport, game-like admissions site for a school that promises "human infrastructure to
get hired". The page never scrolls: wheel or swipe moves you through temperature **stages**
(-100 to 0) while a full-screen WebGL surface of cracked, frosted green ice thaws into calm water.
The interface is a HUD (audio, XP, stage readout) rather than a website, and the main input is a
gesture: **draw a zero** with the pointer.

Rebuild: [`design-inspiration-rebuilds/culture-education/why-zero`](https://github.com/raphaelbleier/design-inspiration-skills/tree/main/skills/design-inspiration-rebuilds/culture-education/why-zero) (fictional content, generated images, open-source fonts; installed with the optional `design-inspiration-rebuilds` skill). Run it with `npm install && npm run dev`.

## Design Tokens

| Role | Value |
|---|---|
| Deep teal (loader, panels) | `#17463d` |
| Ice teal (page base) | `#2f8f76` |
| Mint highlight (thawed water, cracks) | `#c6efe1` |
| Ink | `#ffffff`, secondary at 50-70% alpha |

```css
:root { --teal:#2f8f76; --deep:#17463d; --mint:#c6efe1; --ease:cubic-bezier(.16,1,.3,1); }
.glass { background: rgba(255,255,255,.12); backdrop-filter: blur(14px) saturate(1.4);
  border: 1px solid rgba(255,255,255,.28); box-shadow: inset 0 1px 0 rgba(255,255,255,.35); border-radius: 100px; }
```

- **Type:** a chunky square-ish grotesk for display and the loader digits (original: Supply Sans
  family; substitute: Space Grotesk 700), a mono for every label and HUD value (JetBrains Mono),
  a neutral sans for body copy (Inter Tight). Loader digits are 100px, display up to ~6.4rem at
  line-height .92 and -.04em tracking.
- **Colour:** one hue (green-teal) in three values. The whole palette is the gradient of the
  shader; UI is white on top of it.
- **Chrome:** pill-shaped frosted-glass chips for audio, XP and the scroll hint. Layers in the
  original (fill, highlight, edge-light, inner-glow) are collapsed into one translucent fill plus an
  inset top highlight.

## Motion Spec

| What | Trigger | Animation | Duration / easing | Rebuild file |
|---|---|---|---|---|
| Odometer preloader | load | two 0-9 digit stacks roll 00 to 99, then the overlay slides up | 2.2s `power2.inOut`; exit 1s `expo.inOut` | `src/loader.js` |
| Ice surface | always | voronoi cracks warped by fbm, noisy frost line, vertical thawed gradient | continuous | `src/ice.js` |
| Thaw with progress | stage progress | `uTemp` 0 to 1 moves the frost line from full coverage to none | follows eased stage value | `src/ice.js` |
| Stage track | wheel / swipe / keys | target moves by `deltaY * .0016`, eased value follows, snaps to integer after 180ms idle | lerp .08 per 60fps frame | `src/stages.js` |
| Stage panel transition | stage change | outgoing/incoming panels fade, drift 60px, blur up to 8px | follows the eased value | `src/stages.js` |
| Draw a zero | pointer drag | trail painted to a 256px canvas texture, fades 6% per frame, brightens the ice | per frame | `src/draw.js` |
| Zero recognised | pointer up | winding >= 300 degrees and loop closed: +50 XP, shader flash, "0" pop | 1s `power3.out`, shader burst decays x .94 per frame | `src/main.js` |
| Next-stage ring | progress | SVG ring dash offset shows progress to the next stage | scrubbed | `src/main.js` |
| Audio chip | always | polyline waveform oscillates | continuous | `src/main.js` |

### Key excerpts

**Frost line that thaws with progress**: `src/ice.js`
```glsl
float frostLine=-.15+1.3*uTemp+(fbm(p*4.)-.5)*.35;   // noisy edge
float frost=smoothstep(frostLine-.04,frostLine+.04,uv.y);
vec3 water=mix(deep,mint,pow(1.-uv.y,2.2)*.9);
vec3 ice=mix(deep*.85,mint,mottled*.55+.1)+crack*vec3(.75,1.,.9)*(.28+uBurst);
vec3 col=mix(water,ice,frost);
```

**Cracks from voronoi edge distance**: `src/ice.js`
```glsl
vec2 w=p*5.+vec2(fbm(p*2.+uTime*.03),fbm(p*2.+7.))*.9 + t*.25;   // t = cursor trail
vec2 v=vor(w);                                   // v.x = distance to nearest cell edge
float crack=1.-smoothstep(0.,.07+t*.05,v.x);     // trail widens the cracks
```

**Page that never scrolls**: `src/stages.js`
```js
addEventListener('wheel', (e) => bump(e.deltaY * 0.0016), { passive: true });
// ...
cur += (target - cur) * (1 - Math.pow(0.92, dt * 60));   // frame-rate independent lerp
panels.forEach((p, i) => {
  const d = Math.min(1, Math.abs(cur - i)), s = Math.sign(i - cur);
  p.style.opacity = 1 - d;
  p.style.transform = `translateY(${s * d * 60}px)`;
  p.style.filter = d > 0.01 ? `blur(${d * 8}px)` : 'none';
});
```

**Zero detection**: `src/draw.js`
```js
// winding angle around the centroid, summed over the path
let d = a - a0;
if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI;
wind += d;
// ...
return Math.abs(wind) > (300 * Math.PI) / 180 && end < diag * 0.22 && diag > 30;
```

**Odometer preloader**: `src/loader.js`
```js
gsap.timeline({ onComplete: () => { el.remove(); done(); } })
  .to(o, { v: 99, duration: 2.2, ease: 'power2.inOut', onUpdate() {
    const n = Math.round(o.v);
    gsap.set(ins[0], { yPercent: -Math.floor(n / 10) * 10 });   // tens
    gsap.set(ins[1], { yPercent: -(n % 10) * 10 });             // ones
  } })
  .to(el, { yPercent: -100, duration: 1, ease: 'expo.inOut' }, '+=.25');
```

`prefers-reduced-motion`: the preloader is skipped and the shader and waveform are static; stage
changes still work from wheel, swipe and arrow keys.

## Why Award-Worthy

1. **The site is an object, not a page.** One viewport, a HUD and a progress readout turn
   admissions into a small game. Scroll becomes a physical quantity (temperature), not a document.
2. **One shader, one story.** The ice thawing as you progress is the entire narrative: the surface
   state is the progress bar, so no separate chrome is needed.
3. **Input as brand.** Drawing a zero is the name of the school, performed by the visitor, and it
   feeds XP, the shader and the UI at once.
4. **Restraint in colour and copy.** A single green-teal hue and very short copy per stage keep a
   heavy WebGL surface legible.
5. **Polish in the in-betweens.** The odometer loader, glass chips and eased, snapping stage
   motion make small states feel designed.

**Anti-patterns it avoids:** no long scrolling page with sections; no stock photography behind
the hero; no menu bar of links; the WebGL layer never blocks the controls.

## Credits

- Original: [why.zero.university](https://why.zero.university/) by **Sindhur Dutta**. Design and
  content are the intellectual property of their creators.
- Recognition: Awwwards Site of the Month (Sep 2026), Site of the Day, Developer Award.
- This study is an independent clean-room analysis. The rebuild uses a fictional institute,
  AI-generated images and open-source fonts; it contains no original code, assets or copy.
