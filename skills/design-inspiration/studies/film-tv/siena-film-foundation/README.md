---
title: Siena Film Foundation
url: https://siena.film
studio: Niccolò Miranda / G-NS Studio
awards: [SOTM Mar 2025, SOTD, Developer Award]
year: 2025
category: film-tv
techniques: [webgl, shader, custom-scroll, velocity-blur, text-rollover, page-transitions, smooth-scroll, css-3d, css-only-menu, film-grain]
stack: [ogl, gsap, scrolltrigger, splittext, lenis, taxi, howler, webflow]
---

# Siena Film Foundation — clean-room study

A film-production house site built around one metaphor: the **cinema ticket**. The nav is a
perforated ticket with punched holes, credits sit in dashed-border ticket cells, and the call to
action is an "EXPLORE" ticket. Behind the DOM, one persistent **WebGL canvas** redraws every
slide image with an arch mask, gold colour-dodge, vignette, velocity blur and film grain. The
palette is three colours (black, warm cream, one signal red) and the type is one quirky display
face at huge scale against a tiny letter-spaced serif.

Rebuild: [`design-inspiration-rebuilds/film-tv/siena-film-foundation`](https://github.com/raphaelbleier/design-inspiration-skills/tree/main/skills/design-inspiration-rebuilds/film-tv/siena-film-foundation) (fictional content, generated images, open-source fonts; installed with the optional `design-inspiration-rebuilds` skill). Run it with `npm install && npm run dev`.

## Design Tokens

| Role | Value |
|---|---|
| Black (body, display text on cream) | `#000` |
| Cream (text on dark, ticket, case-study page) | `#faf7ef` |
| Red (contact page, accent) | `#ff0f00` |
| Gold (toggle highlight, shader dodge tint `vec3(1., .86, 0.)`) | `#ffc700` |
| Panel grey / muted text | `#222` / `#bababa` |
| Hairline (30% cream) / menu hover | `#faf7ef4d` / `#d6d3cc` |

```css
:root {
  --black: #000; --white: #faf7ef; --red: #ff0f00; --gold: #ffc700;
  --text-h1: 5.6rem; --text-h2: 3.2rem; --text-h4: 2rem; --text-eyeb-small: .6rem;
  --gx: 3rem; --gy: 3rem; --roll-gx: 3.8rem; --sgx: 2.1rem;
  --rounded-xs: 6px; --rounded-md: 12px; --rounded-full: 100rem;
  --easeOutQuint: cubic-bezier(.23, 1, .32, 1);
  --customEase: cubic-bezier(.19, 1, .22, 1);   /* the hero ease, expo-out equivalent */
  --panels-duration: .9s;
}
/* No fluid root: html is 16px at 390, 768 and 1440. Mobile is done per component, not on :root. */
```

- **Type:** the display face (original: Neue Brucke, a wide quirky grotesk with cut-out letterforms;
  substitute: Bricolage Grotesque 800, slightly condensed) is always uppercase with tight tracking.
  Body and buttons use a neutral grotesk (original: NB International; substitute: Inter). Eyebrows use
  a serif small-caps look at `9.6px`, `letter-spacing: .35em` (original: P22 Parrish Roman;
  substitute: Cormorant Garamond 600).
- **Impact type:** home slide title `5.6rem` (89.6px), `line-height: .77em`, `letter-spacing: -2.69px`,
  `max-width: 8ch`; 48px at 390. Lines almost touch.
- **Spacing & shape:** rem tokens only, so there is no layout shift. Radii `6px` ticket, `12px` panels,
  full pills. Slides use a hand-cut arch mask with a corner radius of about 40px.
- **Depth:** no box-shadows. The "shadow" is a vignette baked into the shader plus a gradient behind
  the nav. Borders are 1px dashed (ticket, credit cells) or 1px solid hairlines (title tables).

## Motion Spec

| What | Trigger | Animation | Duration / easing | Rebuild file |
|---|---|---|---|---|
| Smooth scroll | case, about, contact pages | Lenis `{ duration: 1, smoothWheel, touchMultiplier: 2 }`, driven by `gsap.ticker` (no autoRaf); home/work have no native scroll | expo-out `1 - 2^(-10t)`; `scrollTo` .8s | `src/scroll.js` |
| Slide roll (home) / slider (work) | wheel, drag, arrow keys | `target += speed`, `speed *= .85`, `current` lerps to `target`, snaps to the nearest slide when slow | lerp .05 desktop / .09 touch, snap .1 | `src/slider.js` |
| Velocity blur | roll speed | one smoothed speed value feeds both the shader blur and CSS text blur | lerp .1 | `src/slider.js`, `src/shaders.js` |
| Arch slides | always | each DOM image mirrored by a WebGL plane: arch mask, cover-fit, parallax, gold dodge, vignette | continuous | `src/shaders.js`, `src/gl.js` |
| Work cards | slider position | 9-tap gaussian blur plus dimming by distance from centre; speed adds motion blur | per frame | `src/shaders.js`, `src/pages/work.js` |
| Footage mode | toggle click | focus uniforms tween; active card grows, others fade, two staggered rows of stills fly in | .8s `expo.out` | `src/pages/work.js` |
| Post pass | always | barrel bulge .1, animated grain .07, speed-scaled glow .5, soft vertical blur at the edges | continuous | `src/shaders.js`, `src/gl.js` |
| Title rollover | 2s after settle, then every 6s while idle | per-character slot-machine spin, paused while the user scrolls | 2s `expo.out`, stagger .04 random | `src/rollover.js` |
| Page transition | link click | wrapper fades out, GL alpha to 0, swap, fade in with a page-specific delay; the canvas persists | out .2s, in .8s (delay 1.4 / .6 / 0) | `src/router.js` |
| Logo colour flip | scroll under a `data-color` block | `mix`-style black/cream toggle via IntersectionObserver `rootMargin: 0 0 -90% 0` | instant | `src/router.js` |
| Menu | checkbox | `:has(input:checked)`; panels `grid-template-rows: 0fr to 1fr`, lines `scaleX`, burger to X | .9s panels, 1.1s lines, `--customEase` | `src/styles/chrome.css` |
| About sphere wall | scroll (sticky) | 36 CSS-3D tiles fly from depth -3000 into a bulging wall; timeline seeked by a lerped scroll value | linear, `lvalue` lerp .1 | `src/pages/about.js` |
| Cursor | pointer | 100px outlined circle labelled "SCROLL"; prev/next zones, pressed state, hidden over `data-cursor=hide` | follow | `src/cursor.js` |
| Ticket nav | page change | meta row swaps per page; punched holes and clipped corners | .8s chevron | `src/ticket.js` |
| Preloader | first visit only | video plus a button after 3.5s; remembered for 1 hour | — | `src/preloader.js` |

### Key excerpts

**Slide controller (speed, lerp, snap)**: `src/slider.js`
```js
const cfg = { scrollSpeed: 0.001, damp: 0.85, snapFactor: 0.1, snapThreshold: 0.25, lerp: 0.05, lerpTouch: 0.09, mouse: 0.5, touch: 5.5 };
const k = (f, dt) => 1 - Math.pow(1 - f, dt * 60);       // frame-rate independent lerp
// ...
update(dt) {
  this.target += this.speed * Math.min(dt * 60, 3);
  this.speed *= Math.pow(cfg.damp, dt * 60);
  if (!this.dragging && Math.abs(this.speed) < 0.0012) {    // slow enough: snap to the nearest slide
    const r = Math.round(this.target);
    this.target += (r - this.target) * k(cfg.snapFactor, dt);
  }
  this.current += (this.target - this.current) * k(this.touch ? cfg.lerpTouch : cfg.lerp, dt);
  this.vel = (this.current - prev) / Math.max(dt * 60, 0.001);
  this.lspeed += (Math.min(Math.abs(this.vel), 0.2) - this.lspeed) * k(0.1, dt);   // feeds blur
  // ...
}
```
Input only adds an impulse to `speed`; damping, snapping and the lerp do the rest, so wheel, drag and keys feel identical.

**Slot-machine title rollover**: `src/rollover.js`
```js
// each char: two identical stacked copies, so every loop is seamless
inner.innerHTML = `<span>${c}</span><span>${c}</span>`;
// ...
const tls = chars.map((c) => gsap.timeline({ paused: true })
  .to(c, { yPercent: -50, ease: 'none', duration: 1, repeat: gsap.utils.random(8, 14, 1) }));
// ...
play() {
  gsap.to(tls, { progress: 1, duration: 2, ease: 'expo.out',
    stagger: { each: 0.04, ease: 'none', from: 'random' },
    onComplete: () => tls.forEach((t) => t.progress(0)) });   // reset is invisible
}
```
Progress 1 lands exactly on the original letter, so the spin ends on the right text.

**Home slide fragment (arch, parallax, gold dodge)**: `src/shaders.js`
```glsl
vec2 uv = coverUV(v_uv, u_size, u_img, 1.1);
uv.y -= clamp(u_offset, -1.5, 1.5) * .07;                       // parallax
vec2 d = vec2(0., (.5 + u_speed * 7.) / u_size.y);              // vertical motion blur
vec3 col = blur9(u_tex, uv, d);
float grad = smoothstep(.5, .1, abs(v_uv.y - .5));              // darkens top and bottom
col *= mix(.58, 1., grad);
col *= 1. - smoothstep(0., 1., abs(u_offset)) * .55;            // neighbours peek in darker
float g = 1. - smoothstep(0., .9, length(v_uv - vec2(0., 1.)));
vec3 gold = vec3(1., .86, 0.);
col = mix(col, col / max(vec3(1.) - gold * g * .3, .05), .65);  // colour-dodge, top-left
outColor = vec4(col, mask(40., 5.) * u_alpha);                  // hand-cut arch
```

**Post pass (bulge, grain, speed glow)**: `src/shaders.js`
```glsl
const float BULGE = .1, NOISE = .07, FILM = .5;
vec2 d = v_uv - .5;
vec2 uv = .5 + d * (1. + BULGE * .1 * dot(d, d));               // barrel distortion, ~1% at the edges
// ...
for (int i = 0; i < 6; i++) { float a = float(i) * 1.0472; glow += texture(tMap, uv + vec2(cos(a), sin(a)) * 14. / u_res).rgb; }
col += glow / 6. * clamp(u_speed, 0., 1.) * FILM * .35;         // glow grows with roll speed
col += (hash(v_uv * u_res) - .5) * NOISE * 1.6;                 // animated grain
outColor = vec4(col * u_alpha, 1.);                             // u_alpha = page fade
```

**Lenis on the shared ticker**: `src/scroll.js`
```js
lenis = new Lenis({ duration: 1, smoothWheel: !reduced, orientation: 'vertical',
  touchMultiplier: 2, easing: expoOut });                       // t => t === 1 ? 1 : 1 - 2^(-10t)
lenis.on('scroll', ScrollTrigger.update);
tick = (t) => lenis.raf(t * 1000);
gsap.ticker.add(tick);
gsap.ticker.lagSmoothing(0);
```

**Quiet page transition**: `src/router.js`
```js
const enterDelay = { home: 1.4, work: 1.4, case: 0.6, about: 0.6, contact: 0, policy: 0.2, 404: 0 };
// leave
await Promise.all([
  gsap.to(app, { autoAlpha: 0, duration: 0.2, ease: 'power1.out' }),
  gsap.to(GL.state, { alpha: 0, duration: 0.2 }),
]);
// ... swap content, reset scroll ...
gsap.to(app, { autoAlpha: 1, duration: 0.8, delay, ease: 'power1.out' });
gsap.to(GL.state, { alpha: 1, duration: 0.8, delay: delay + 0.4 });
```

`prefers-reduced-motion`: Lenis smooth wheel and the title rollover are disabled, and transitions
shorten to near zero.

## Why Award-Worthy

1. **One canvas that outlives the pages.** Slides are real DOM images that the shader replaces, so
   SEO and accessibility stay intact while GL adds blur, vignette, parallax and grain. Because the
   canvas never unmounts, a plain fade between pages feels seamless.
2. **The ticket metaphor runs through the whole UI.** Nav, credit cells, labels, dashed
   perforation, punched holes and the EXPLORE button all use it. One motif, no decoration for its own sake.
3. **Velocity drives everything.** A single smoothed speed value feeds the shader blur and the CSS text
   blur. Fast input smears slides like film transport and settling snaps sharp, so motion feels physical.
4. **Type-led contrast.** One quirky display face, uppercase, at huge scale with 0.77em leading,
   against a tiny letter-spaced serif. Black, cream and red are the whole palette.
5. **Restraint in the plumbing.** The menu is pure CSS (`:has()` plus a checkbox). The idle title
   rollover pauses while the user scrolls and fires only on the settled slide.

**Anti-patterns it avoids:** no purple gradients or glass cards; no generic centred-text hero video;
no scroll-jacking of content pages (only the home and work sliders are custom, and keyboard and drag
work alongside the wheel); no layout shift, since sizes are rem tokens; the preloader shows once per hour.

## Credits

- Original: [siena.film](https://siena.film) by **Niccolò Miranda / G-NS Studio**. Design and content
  are the intellectual property of their creators.
- Recognition: Awwwards Site of the Month (Mar 2025), Site of the Day, Developer Award.
- This study is an independent clean-room analysis. The rebuild uses a fictional film foundation,
  AI-generated images and open-source fonts; it contains no original code, assets or copy.
