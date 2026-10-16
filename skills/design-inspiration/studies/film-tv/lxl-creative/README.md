---
title: LxL Creative
url: https://www.lxlcreative.co.uk/
studio: Jordan Gilroy
awards: [SOTD, Developer Award]
year: 2026
category: film-tv
techniques: [image-swap, scroll-pinning, scrub-zoom, card-stack, theme-switching, svg-draw, text-reveal, smooth-scroll, carousel]
stack: [gsap, scrolltrigger, splittext, drawsvg, customease, lenis, webflow]
---

# LxL Creative — clean-room study

A portfolio site for an entertainment marketing studio (key art, EPKs, unit stills, premiere
activations). There is no WebGL: the whole identity is **film stills on a warm-dark page**, one hot
orange hand-drawn mark, huge wide uppercase type, and a page that changes colour as you scroll
(chocolate dark, butter yellow, studio blue). Every interaction is a crisp cut or a long expo-style ease.

Rebuild: [`design-inspiration-rebuilds/film-tv/lxl-creative`](https://github.com/raphaelbleier/design-inspiration-skills/tree/main/skills/design-inspiration-rebuilds/film-tv/lxl-creative) (fictional studio "Juno Creative", image slots listed in `images.json`, open-source fonts; installed with the optional `design-inspiration-rebuilds` skill). Run it with `npm install && npm run dev`.

## Design Tokens

| Role | Value |
|---|---|
| Dark (page, ink on light) | `#27201d` |
| Light butter (text on dark, light sections) | `#fcf2bd` |
| Brand orange (script marks, CTAs, squiggles) | `#ff5121` |
| Studios blue (second brand block) | `#055dff` |
| Berry / sky (unused accents in the CSS) | `#760021` `#e2f2fd` |

```css
:root {
  --dark: #27201d; --light: #fcf2bd; --brand: #ff5121; --blue: #055dff;
  --osmo: cubic-bezier(.625, .05, 0, 1);              /* gsap CustomEase "osmo", used everywhere */
  --h1: clamp(1.75rem, 2.26vw, 3.5rem);               /* 32.5px @1440 */
  --h2: clamp(1.5rem, 3.8vw, 5rem);                   /* 54.8px @1440 */
  --r: 14px;                                          /* one radius for every image and card */
}
```

- **Type:** three families. A wide, heavy grotesk for display (original: Owners Wide 700,
  uppercase, line-height 1; substitute: Archivo at `font-stretch: 125%`, 800), a geometric sans for
  body and nav (original: Manrope, kept), and a **brush-signature script** (original: Scribo;
  substitute: Mr Dafoe) used only for single accent words: "Our", "Featured", "Why", "great".
- **Hero lockup:** a giant lowercase wordmark (~15vw, weight 700, tracking `-.055em`) bottom-right
  with the orange script mark overlapping the photo card. The nav logo stays hidden until it has
  scrolled away.
- **Layout:** one gutter, 14px radius, no shadows. Photo card left, copy right, full-bleed bands
  in between.
- **Theme blocks:** body background and text colour are tweened per section, so dark, yellow and
  dark again read as chapters rather than panels.

## Motion Spec

| What | Trigger | Animation | Duration / easing | Rebuild file |
|---|---|---|---|---|
| Smooth scroll | always | Lenis `{ lerp: .165, wheelMultiplier: 1.25 }` on the GSAP ticker, `lagSmoothing(0)` | — | `src/scroll.js` |
| Hero image swap | mouse over the card | card = invisible 3x2 grid; the cell under the cursor shows one of six stills (instant `autoAlpha` cut). Touch: auto-cycle every 1.5s | no tween | `src/heroSwap.js` |
| Logo in nav | hero leaves viewport | wordmark `autoAlpha 0 → 1`, `y -16 → 0` | .65s `osmo` | `src/theme.js` |
| Section theme | section crosses viewport centre | body `backgroundColor` + `color` tween to the section's `data-theme` | .6s `none` | `src/theme.js` |
| Showreel zoom | scroll, scrubbed | small rounded video box grows to full-bleed (Flip.fit in the original), image `scale 1 → 1.25`, `yPercent -10` | scrub | `src/reel.js` |
| Services card stack | pinned scroll, scrubbed | six cards stacked in z; the front card is thrown up and away with random rotation, the rest step forward | `back.inOut(3)`, `power4.in`, scrub .5 | `src/stack.js` |
| Featured carousel | auto 5s / click | 4 stacked cards (`y i*8`, `scale 1-i*.05`); front card leaves `yPercent -110`; background wipes with `clip-path` while next settles from `scale 1.2` | .6s `osmo` / `jump`; 1.2s `power4.inOut` | `src/featured.js` |
| Why pills | click | one pill open at a time, height to `auto`, plus rotates 45deg | .75s `osmo` | `src/why.js` |
| Squiggles | enters at 80% | orange stroke drawn with DrawSVG | 1.5s `osmo` | `src/draw.js` |
| Headline reveal | enters at 85% | SplitText lines in a mask, `yPercent 110 → 0` | 1s `osmo`, stagger .08 | `src/draw.js` |
| Showreel modal | click thumbnail | frame opens with `clip-path` inset from the centre | .75s `osmo` | `src/reel.js` |
| Menu (mobile) | click | overlay `clip-path` inset drops from the top, links rise | .75s `osmo` | `src/menu.js` |

### Key excerpts

**Two custom eases for the whole site**: `src/scroll.js`
```js
CustomEase.create('osmo', '0.625, 0.05, 0, 1');          // long expo-out: every reveal, hover and toggle
CustomEase.create('jump', 'M0,0 C0.35,1.5 0.6,1 1,1');   // overshoot, used when cards leave
// ...
const lenis = new Lenis({ lerp: 0.165, wheelMultiplier: 1.25 });
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
```
Two curves cover every tween: one smooth, one with a small overshoot for things that get thrown.

**Hero swap by grid cell**: `src/heroSwap.js`
```js
wrap.addEventListener('mousemove', (e) => {
  const r = wrap.getBoundingClientRect();
  const x = Math.min(COLS - 1, Math.floor(((e.clientX - r.left) / r.width) * COLS));
  const y = Math.min(ROWS - 1, Math.floor(((e.clientY - r.top) / r.height) * ROWS));
  show(y * COLS + x);
});
```
No tween at all: an instant cut between stills feels like flicking through a contact sheet.

**Section-driven theme**: `src/theme.js`
```js
ScrollTrigger.create({
  trigger: el, start: 'top center', end: 'bottom center',
  onToggle: ({ isActive }) => isActive && gsap.to('body, html',
    { ...themes[el.dataset.theme], duration: 0.6, ease: 'none', overwrite: 'auto' }),
});
```
Sections only declare `data-theme="dark|light"`; one trigger recolours the whole page.

**Pinned card stack**: `src/stack.js`
```js
const slot = (k) => ({ y: gap * Math.min(k, 3), z: -gap * Math.min(k, 3) });
// ...
for (let s = 0; s < n - 1; s++) {
  tl.to(items[s], { yPercent: -80, y: '-50vh', scale: 1.2, rotation: (Math.random() - 0.5) * 50,
    ease: 'power4.in', duration: 1 }, s);
  items.slice(s + 1).forEach((el, k) =>
    tl.to(el, { ...slot(k), autoAlpha: 1, ease: 'back.inOut(3)', duration: 1 }, s + 0.35));
}
```
`position: sticky` plus one scrubbed timeline: each stage throws the front card and slides the rest forward a slot.

**Featured background wipe**: `src/featured.js`
```js
gsap.set(bgs[next], { autoAlpha: 1, zIndex: 1, clipPath: 'inset(0 0% 0 0)', scale: 1.2 });
gsap.set(bgs[from], { zIndex: 2 });
gsap.timeline({ onComplete: () => { /* hide old, raise new */ } })
  .to(bgs[from], { clipPath: 'inset(0 0 0 100%)', duration: 1.2, ease: 'power4.inOut' })
  .to(bgs[next], { scale: 1, duration: 1.2, ease: 'power4.inOut' }, 0);
```
The old image slides off to the left while the new one, waiting underneath at 1.2x, settles to 1x.

`prefers-reduced-motion`: smooth scroll, pinning, scrubbing, carousel and reveals are off; the card stack becomes a plain grid.

## Why Award-Worthy

1. **Photography does the design.** Colour, mood and rhythm come from film stills; the UI stays
   quiet (one radius, one orange, three type roles) so the work always wins.
2. **A signature you can't fake.** The orange brush mark and the script accent words are the only
   decoration. They repeat in the logo, headings, buttons and the scribble that draws itself in the footer.
3. **Page-level colour change.** Dark to butter to dark is tied to content chapters. It feels like
   cutting between scenes, with no per-element effects needed.
4. **Two eases, used everywhere.** The long `osmo` curve and the overshoot `jump` give the site one
   consistent physical feel from hover to full-section transitions.
5. **Every interaction maps to the trade.** Hovering the hero flicks through a contact sheet, the
   services are a stack of prints thrown off the pile, the showreel is a thumbnail that opens to full frame.

**Anti-patterns it avoids:** no WebGL gimmick or parallax soup; no drop shadows; no gradient
backgrounds; no stock icons; the script font is never used for body copy, only single words.

## Credits

- Original: [lxlcreative.co.uk](https://www.lxlcreative.co.uk/) by **Jordan Gilroy**. Design and content are
  the intellectual property of their creators.
- Recognition: Awwwards Site of the Day, Developer Award.
- This study is an independent clean-room analysis. The rebuild uses a fictional studio, image slots
  to be filled with generated pictures and open-source fonts; it contains no original code, assets or copy.
