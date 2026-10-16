---
title: MilleDollars
url: https://milledollars.fr/
studio: Magnetism
awards: [SOTD, Developer Award]
year: 2026
category: film-tv
techniques: [webgl, shader, image-slider, page-transitions, smooth-scroll, horizontal-scroll, text-reveal, hover-preview]
stack: [three, gsap, scrolltrigger, lenis, nuxt]
---

# MilleDollars — clean-room study

A portfolio for a small video production bureau. The home page is a single full-screen film still
inside a rounded frame, with a hairline inner border and nothing but a title, a client and a year
on it. Changing slide is a WebGL **smear**: the picture streaks sideways with an RGB split, then
settles. Everything else is quiet: one grotesk in uppercase, a pale grey page, one lilac accent, and
a different flat colour for each inner page (lilac for Info, butter yellow for Contact).

Rebuild: [`design-inspiration-rebuilds/film-tv/milledollars`](https://github.com/raphaelbleier/design-inspiration-skills/tree/main/skills/design-inspiration-rebuilds/film-tv/milledollars) (fictional studio and clients, generated images, open-source fonts; installed with the optional `design-inspiration-rebuilds` skill). Run it with `npm install && npm run dev`.

## Design Tokens

| Role | Value |
|---|---|
| Page grey | `#e0dee1` |
| Ink | `#181818` |
| Lilac accent (active dot, DISCOVER, wavy rules) | `#c2a1c7` |
| Info page | `#d5bcdc` |
| Contact page | `#ffeebf` |
| Dark (hero, project) | `#161414` |

```css
:root {
  --ease: cubic-bezier(.38, .005, .215, 1);   /* the one curve: reveals, hovers, copy swaps */
  --m: 2.2222vw;                               /* page margin, 32px @1440 */
  --gap: 1.3889vw;                             /* column gap, 20px @1440 */
}
#stage { position: fixed; inset: 10px; border-radius: 28px; overflow: hidden; }   /* the framed hero */
#frame { position: absolute; inset: 28px; border: 1px solid rgba(255,255,255,.45); }
```

- **Type:** a neo-grotesk (original: ABC Diatype; substitute: Hanken Grotesk) in uppercase, tracking
  `-.02em`, weights 300 to 500. Display copy on inner pages is about `3.4vw` with `line-height: 1.2`.
  A small serif (original: Migra; substitute: Fraunces) is used only for the one-line tagline.
- **Layout:** 12 columns on tablet and up, 6 on phone; content sits inside a 10.3vw side margin, the
  chrome (logo halves, nav, counters) hugs the 32px edge.
- **Chrome:** logo split in two halves, `MILLE.` top left and `.DOLLARS` top right; nav bottom left in
  11px caps with a lilac dot on the current page; per-slide number and year pinned to the edges.
- **No shadows** on UI, only the paper storyboard sheets carry one. Depth is colour and image.

## Motion Spec

| What | Trigger | Animation | Duration / easing | Rebuild file |
|---|---|---|---|---|
| Slide transition | wheel, drag, arrows, 7s autoplay | fragment shader: samples pushed along x by `sin(pi*p) * .22`, 12-tap blur, RGB split `.012 * sin(pi*p)`, grain, vignette | 1.2s `power3.inOut` | `src/slider.js` |
| Slide copy | slide change | number, client, title and year rise out and in as clipped lines, 50ms offset | 1s `cubic-bezier(.38,.005,.215,1)` | `src/main.js` |
| Smooth scroll | always | Lenis `{ lerp: .1, smoothWheel }` on `gsap.ticker` | — | `src/scroll.js` |
| Preloader | load | counter 0 to 100, then the black cover slides up | 1.4s counter, 1s exit | `src/main.js` |
| Page change | link click | view fades out, body background tweens to the next page colour, view fades in and staggers | .35s out, .6s colour | `src/main.js` |
| Headline reveal | enters at 90% | words translate from 120% inside `overflow: hidden`, stagger 50ms | 1s `mille` curve | `src/main.js` |
| Works hover | pointer over a row | full-bleed cover fades in behind the grid, other rows dim to 30% white, hovered rule turns wavy | .5s `power2.out` | `src/works.js` |
| Storyboard row | scroll | section pins, row of paper sheets translates horizontally | scrub 1 | `src/project.js` |
| Nav hover | hover | opacity .6 | .2s | `src/style.css` |

### Key excerpts

**One frame loop for scroll and WebGL**: `src/scroll.js`
```js
lenis = new Lenis({ lerp: 0.1, smoothWheel: true, autoRaf: false });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => { lenis?.raf(t * 1000); frames.forEach((f) => f(t)); });
```
Lenis, ScrollTrigger and the shader render share the ticker, so pins and the canvas never drift apart.

**Smear transition**: `src/slider.js`
```glsl
float bell = sin(3.14159265 * uP);
float strength = .22 * bell * uDir;
float split = .012 * bell + .0012;
for (int i = 0; i < 12; i++) {
  float t = float(i) / 11. - .5;
  col += tap(vUv + vec2(t * strength, t * strength * .08), uP, split);
}
col /= 12.;
```
The blur and the channel split both ride the same bell curve, so at rest the image is sharp and in the middle it is a streak.

**Driving the progress uniform**: `src/slider.js`
```js
gsap.fromTo(u.uP, { value: 0 }, {
  value: 1, duration: 1.2, ease: 'power3.inOut',
  onComplete() { cur = next; u.uP.value = 0; u.uA.value = tex[cur]; busy = false; },
});
```
After each transition the "next" texture becomes "current" and progress resets, so the shader only ever mixes two textures.

**Works hover preview**: `src/works.js`
```js
list.addEventListener('pointerover', over);   // box.replaceChildren(img); list.classList.add('dim')
// CSS: .list.dim li { color: rgba(255,255,255,.3); border-color: rgba(255,255,255,.3); }
//      .list.dim li:has(.hot) { color: #fff; }
```
No per-row animation: one fixed layer fades, and CSS `:has()` picks the hovered row.

**Pinned storyboard**: `src/project.js`
```js
gsap.to(row, { x: () => -dist(), ease: 'none',
  scrollTrigger: { trigger: '.sb', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true } });
```

`prefers-reduced-motion`: no autoplay, no smear (slides swap at once), no smooth scroll, no pin; copy is simply visible.

## Why Award-Worthy

1. **One image, one gesture.** The home page is a film still and a transition. No hero copy, no
   buttons: the work is the interface, and the streak makes switching feel like a camera whip-pan.
2. **Restraint in the chrome.** Two logo halves, a four-word nav and a tagline. Everything is the same
   size of uppercase, so the stills carry all the colour.
3. **A colour per page.** Grey for the list, lilac for Info, butter for Contact; the background tweens
   as you navigate, which makes a four-page site feel like four rooms.
4. **List as image selector.** Hovering any title turns the whole viewport into that film; the grid
   dims instead of disappearing, so you keep your place.
5. **Craft shown, not told.** The project page stops to scroll paper storyboards sideways before the
   finished film stills: process as content.

**Anti-patterns it avoids:** no cookie-banner-looking cards over the work, no carousels with arrows or
dots, no drop-shadow UI, no multiple accent colours, no hero text over the video.

## Credits

- Original: [milledollars.fr](https://milledollars.fr/) by **Magnetism**. Design and content are the
  intellectual property of their creators.
- Recognition: Awwwards Site of the Day, Developer Award.
- This study is an independent clean-room analysis. The rebuild uses a fictional bureau and clients,
  AI-generated images and open-source fonts; it contains no original code, assets or copy.
