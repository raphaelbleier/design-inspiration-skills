---
title: Sharplink
url: https://www.sharplink.com/
studio: Studio Freight
awards: [SOTD, Developer Award]
year: 2026
category: institutions
techniques: [webgl, shader, 3d-object, scroll-theme-switch, char-scrub, blur-in, smooth-scroll, dotted-grid]
stack: [three, gsap, scrolltrigger, lenis, nuxt]
---

# Sharplink — clean-room study

A listed crypto-treasury company presented like a piece of precision hardware. One chrome
crystal object travels through the whole page (centre of the hero, right column of the light
sections, a dashed wireframe inside the dark frame) while the page background flips between deep
navy and pale sky-blue as you scroll. Layout is held together by hairline **dotted grid lines**
and tiny blue square markers; type is a tight neo-grotesk with small uppercase tag buttons.

Rebuild: [`design-inspiration-rebuilds/institutions/sharplink`](https://github.com/raphaelbleier/design-inspiration-skills/tree/main/skills/design-inspiration-rebuilds/institutions/sharplink) (fictional content, generated images, open-source fonts; installed with the optional `design-inspiration-rebuilds` skill). Run it with `npm install && npm run dev`.

## Design Tokens

| Role | Value |
|---|---|
| Ink (dark theme page) | `#050608` |
| Paper (light theme page) | `#f7f7f5` |
| Sky (light gradient top) | `#c3d3e8` |
| Navy (footer / news cards) | `#0b1d3d` |
| Electric blue (markers, arrow tabs) | `#1a6bff` |

```css
:root{--ink:#050608;--paper:#f7f7f5;--sky:#c3d3e8;--blue:#1a6bff;--navy:#0b1d3d;
  --bg:var(--ink);--fg:#f3f3f3;--pad:28px;--dot:rgba(255,255,255,.25)}
body.is-light{--fg:#000;--dot:rgba(0,0,0,.28)}      /* one class flips the whole UI */
```

- **Type:** Archivo 500 for display (`clamp(48px, 6.2vw, 88px)`, `line-height .98`,
  `letter-spacing -.045em`); Archivo Narrow 500, 13px, `.08em` tracking, uppercase for tags,
  buttons and eyebrows. Body 16px.
- **Shape:** no radii, no shadows. Nav items are separate rectangles with a 2px gap; buttons are a
  label block plus a square blue arrow tab. Depth comes from translucent navy / blue panels with
  `backdrop-filter: blur`.
- **Grid:** 28px page padding; sections divided by 1px dotted rules with a 6px blue square at the
  left end of every rule.

## Motion Spec

| What | Trigger | Animation | Duration / easing | Rebuild file |
|---|---|---|---|---|
| Smooth scroll | always | Lenis `{ lerp: .09 }` driven by `gsap.ticker`, `lagSmoothing(0)` | — | `src/scroll.js` |
| Contour field | always, cursor | value-noise bands via `fract`, ~1px lines via `fwidth`, cursor adds a radial bump; fades toward the lower edge | continuous | `src/topo.js` |
| Theme switch | section enters (`#hero`, `#about`, `#investors`, `#why`, footer) | `body.is-light` toggles; shader `uTheme` eases toward 0/1 | lerp `.08` per frame | `src/motion.js` |
| Chrome crystal | scroll progress | two pyramids with split gap; moves centre -> right column, spins `p * 12` rad, wireframe fades in inside the dark frame | smoothstep, lerp `.08` | `src/crystal.js` |
| Dark frame | scroll | panel side margins 28px -> 0 | scrubbed, `ease: none` | `src/motion.js` |
| Character scrub | scroll | every character opacity `.18 -> 1`, stagger `.05` across the paragraph | scrub `.6` | `src/motion.js` |
| Blur-in copy | enters at 85% | `filter: blur(14px) -> 0` | `.6s` CSS transition | `src/motion.js` |
| Rise-in | enters at 88% | `y: 36 -> 0`, opacity `0 -> 1` | `.9s power3.out` | `src/motion.js` |
| Footer wordmark | scroll through footer | huge gradient-clipped wordmark rises from 40% | scrubbed | `src/motion.js` |
| Hero intro | load | headline, buttons, news card rise and fade | `1.2s power3.out`, stagger `.12` | `src/motion.js` |

### Key excerpts

**Smooth scroll on the GSAP ticker**: `src/scroll.js`
```js
const lenis = new Lenis({ lerp: 0.09, smoothWheel: true, autoRaf: false });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
```

**Contour lines with constant pixel width**: `src/topo.js`
```glsl
float f = n(p*2.2+vec2(uT*.03,0.))*.65 + n(p*4.4-uT*.02)*.35 + exp(-d*d*10.)*.25;
float lo = f*9.;
float e = min(fract(lo),1.-fract(lo))/fwidth(lo);
float line = 1.-smoothstep(0.,2.2,e);
// ...
vec3 bg = mix(darkBg, lightBg, uTheme);
```

**Section-driven theme**: `src/motion.js`
```js
const set = (light, wire = 0) => {
  document.body.classList.toggle('is-light', light);
  topo.theme = light ? 1 : 0;
  gsap.to(crystal, { wire, duration: .6 });
};
ScrollTrigger.create({ trigger: '#investors', start: 'top 50%', end: 'bottom 30%',
  onEnter: () => set(false, 1), onEnterBack: () => set(false, 1), onLeave: () => set(true) });
```

**Character scrub**: `src/motion.js`
```js
sc.innerHTML = sc.textContent.split(' ').map((w) =>
  `<span style="white-space:nowrap">${[...w].map((ch) => `<span class="c">${ch}</span>`).join('')}</span>`).join(' ');
gsap.to('.scrub .c', { opacity: 1, ease: 'none', stagger: .05,
  scrollTrigger: { trigger: '.scrub', start: 'top 80%', end: 'bottom 40%', scrub: .6 } });
```

**Crystal follows scroll**: `src/crystal.js`
```js
const tx = narrow ? 0 : THREE.MathUtils.lerp(0, 2.6, THREE.MathUtils.smoothstep(p, 0.02, 0.12));
s.x += (tx - s.x) * .08;
g.rotation.y = (reduce ? 0 : t * .35) + p * 12;
const split = Math.max(0, 1 - p * 14) * .25 + .02;
top.position.y = split; bot.position.y = -split;
```

`prefers-reduced-motion`: smooth scroll, shader drift, spin and all reveals are disabled; text is
fully visible.

## Why Award-Worthy

1. **One object as narrator.** A single 3D crystal changes position, spin and material (solid to
   wireframe) with scroll, tying six very different sections into one story.
2. **Two-theme page with one switch.** Dark navy and pale sky alternate; a single body class plus
   one shader uniform recolours text, rules, nav tags and background together.
3. **Technical drafting aesthetic.** Dotted rules, blue square markers and dashed isometric icons
   make a financial product feel engineered rather than speculative.
4. **Restrained type.** One grotesk at weight 500 with tight tracking, plus a narrow uppercase for
   UI, no decorative faces.
5. **Content-aware motion.** The character scrub and blur-in only gate reading, never hide navigation.

**Anti-patterns it avoids:** no rounded cards or drop shadows; no gradient-text hero (the gradient
is reserved for the closing wordmark); WebGL layers are `pointer-events: none`; no autoplaying
carousels.

## Credits

- Original: [sharplink.com](https://www.sharplink.com/) by **Studio Freight**. Design and content are
  the intellectual property of their creators.
- Recognition: Awwwards Site of the Day, Developer Award.
- This study is an independent clean-room analysis. The rebuild uses a fictional company
  (Anchorline), AI-generated images and open-source fonts; it contains no original code, assets or copy.
