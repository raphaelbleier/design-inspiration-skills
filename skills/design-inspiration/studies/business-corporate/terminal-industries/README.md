---
title: Terminal Industries
url: https://terminal-industries.com/
studio: REJOUICE
awards: [SOTM Sep 2025, SOTD, Developer Award]
year: 2025
category: business-corporate
techniques: [webgl, particles, scroll-pinning, scrubbed-timeline, text-reveal, smooth-scroll, step-sequence, clip-path]
stack: [three, gsap, scrolltrigger, splittext, lenis]
---

# Terminal Industries — clean-room study

A B2B yard-logistics product site that behaves like a film. The hero is one long pinned scroll:
a silhouetted truck at dusk, a camera cut into the yard where a **particle scan** dissolves the
truck into data, then a black blueprint grid with the mission statement. After that the page
turns calm and corporate: deep green ink, light grey cards and one acid lime used only for
action and "AI" moments.

Rebuild: [`design-inspiration-rebuilds/business-corporate/terminal-industries`](https://github.com/raphaelbleier/design-inspiration-skills/tree/main/skills/design-inspiration-rebuilds/business-corporate/terminal-industries) (fictional content, generated images, open-source fonts; installed with the optional `design-inspiration-rebuilds` skill). Run it with `npm install && npm run dev`.

## Design Tokens

| Role | Value |
|---|---|
| Deep green (text, footer, dark UI) | `#052424` |
| Lime (primary button, chip text, hover glow) | `#abff02` |
| Card grey | `#f0f0f0` |
| Hairline | `#dcdcdc` |
| Muted mono label | `#7f7f7f` |
| Hero black | `#000` with 93px white 10% grid |

```css
:root {
  --ink: #052424; --lime: #abff02; --grey: #f0f0f0; --line: #dcdcdc; --mute: #7f7f7f;
  --sans: 'Inter Tight', system-ui, sans-serif;   /* original: Suisse Int'l */
  --mono: 'Geist Mono', ui-monospace, monospace;
}
```

- **Type:** a neutral Swiss grotesk at weight 400 only. Section H2 `70px / 70px`,
  `letter-spacing: -3.6px` (about -.05em): very tight, never bold. Hero statement
  `73px / 69.7px`, `-1.47px`. Card titles `20px`, body `18px`.
- **Mono labels:** all UI furniture (buttons, eyebrows like "01 Fast start", footer headings) is
  mono uppercase with wide tracking: `11px 600 +1.5px` on buttons, `13px +2.3px` on eyebrows.
  The grotesk-plus-mono pair is what makes it read as software.
- **Shape:** 8px radius on buttons, 32px on cards, 16px on the dark feature panel (with a notched
  left edge). No shadows; depth is blur (nav) and colour.
- **Nav:** a 938px blurred pill, fixed at `top: 46px`, with three differently coloured CTAs
  (lime / white / grey) always visible.

## Motion Spec

| What | Trigger | Animation | Duration / easing | Rebuild file |
|---|---|---|---|---|
| Smooth scroll | always | Lenis `{ lerp: .1 }` on the GSAP ticker, `lagSmoothing(0)` | — | `src/scroll.js` |
| Hero timeline | scroll, pinned 400vh | truck plate scales 1 → 1.12, yard wipes in from the right with `clip-path`, black grid fades in, statement words light up one by one | scrub .6, wipe `power2.inOut` | `src/hero.js` |
| Particle scan | hero scroll .2 → .6 | ~2600 points start on the truck, a sweep front reveals them left to right, then they scatter into the yard and fade | scrubbed uniform | `src/particles.js` |
| Headline reveal | enters at 85% | SplitText lines, inner span `yPercent 105 → 0` inside an overflow-hidden line | 1.1s `power4.out`, stagger .08 | `src/reveals.js` |
| Card entrance | enters at 88% | `y 60 → 0`, opacity, batched per row | 1s `power3.out`, stagger .12 | `src/reveals.js` |
| Feature steps | scroll, pinned 300vh | progress picks the active step; text swaps, panel crossfades, HUD chip text changes, lime progress bar | text .6s `power3.out`, image .8s | `src/features.js` |
| Logo grid | hover | lime radial glow follows the pointer inside the cell, 1px lime outline | .4s opacity | `src/logos.js` |
| Calculator | input | result number tweens to the new value | .8s `power2.out` | `src/calc.js` |
| Nav tint | scroll past hero | blur pill gets a darker tint over white sections | CSS .4s | `src/nav.js` |
| Buttons | hover | lift 2px; pills invert to ink with lime text | .3-.4s | `src/style.css` |

### Key excerpts

**Hero: one scrubbed timeline, pinned**: `src/hero.js`
```js
const tl = gsap.timeline({
  defaults: { ease: 'none' },
  scrollTrigger: { trigger: hero, start: 'top top', end: '+=400%', pin: '.hero__stage', scrub: 0.6 },
});
tl.to('.hero__img--a img', { scale: 1.12 }, 0)
  .to('[data-yard]', { clipPath: 'inset(0 0 0 0%)', duration: 0.25, ease: 'power2.inOut' }, 0)
  .fromTo('[data-yard] img', { scale: 1.18 }, { scale: 1, duration: 0.6 }, 0)
  .to(state, { p: 1, duration: 0.4, onUpdate: () => (dots.progress = state.p) }, 0.2)
  .to(dark, { opacity: 1, duration: 0.2 }, 0.55)
  .to(split.words, { opacity: 1, stagger: 0.025, duration: 0.1 }, 0.7);
```
The timeline is 1 unit long, so the position parameters read as fractions of the scroll.

**Particle scan shader**: `src/particles.js`
```glsl
float sweep = uP * 1.25 - 0.15;
float on = smoothstep(sweep + .08, sweep - .02, p.x);     // dots behind the front appear
float spread = smoothstep(.15, 1., uP);                    // then scatter outward
p.xy += seed.xy * spread * vec2(.34, .3) * (.4 + seed.z);
p.y += sin(uT * .8 + seed.z * 6.28) * .004;                // idle drift
vA = on * (1. - smoothstep(.85, 1., uP)) * (.35 + .65 * seed.z);
```
A 0..1 screen-space ortho camera, one `Points` draw call, one uniform driven by the timeline.

**Smooth scroll + one frame loop**: `src/scroll.js`
```js
lenis = new Lenis({ lerp: 0.1, smoothWheel: true, syncTouch: false, autoRaf: false });
lenis.on('scroll', ScrollTrigger.update);
// ...
gsap.ticker.add((t) => { if (lenis) lenis.raf(t * 1000); frame.forEach((fn) => fn(t)); });
```

**Headline line reveal**: `src/reveals.js`
```js
SplitText.create(el, {
  type: 'lines', linesClass: 'line', autoSplit: true,
  onSplit(self) {
    self.lines.forEach((l) => { l.innerHTML = `<span>${l.innerHTML}</span>`; });
    return gsap.fromTo(self.lines.map((l) => l.firstChild), { yPercent: 105 },
      { yPercent: 0, duration: 1.1, ease: 'power4.out', stagger: 0.08,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
  },
});
```
`autoSplit` re-splits on resize and the returned tween is reverted and rebuilt safely.

**Pinned step sequence**: `src/features.js`
```js
ScrollTrigger.create({
  trigger: root, start: 'top top', end: '+=300%', pin: '.feat__pin', scrub: 0.5,
  onUpdate: (self) => {
    show(Math.min(2, Math.floor(self.progress * 3)));
    gsap.set(bar, { scaleX: self.progress });
  },
});
```
Scroll progress only chooses an index; each step animates itself, so fast scrolling never leaves
half-faded text.

`prefers-reduced-motion`: smooth scroll, pins, the particle layer and reveals are off; the black
statement frame is shown as a static block and feature steps stack as normal content.

## Why Award-Worthy

1. **A product demo disguised as a hero.** The scroll itself explains the product: truck, yard,
   scan, data. One pinned timeline, one idea, no separate "how it works" section needed.
2. **Restraint after the spectacle.** Once the film ends the page is plain grey cards and
   hairlines. The contrast makes the opening feel bigger and keeps the sales content readable.
3. **Mono as the product voice.** Every label, button and HUD chip is mono caps; headlines stay
   in a quiet grotesk. The system feels technical without any illustration.
4. **One accent, rationed.** Lime appears only on primary actions, the AI chip and the hover
   state, so it always means "act here" or "the system is working".
5. **Hairline grid as brand device.** The logo wall, the hero blueprint and the footer line art
   share the same thin-line language, tying marketing to the product UI.

**Anti-patterns it avoids:** no stock-photo carousel, no gradient blobs, no bold type for emphasis,
no scroll-jacking that blocks reading (the pins end in under four screens), no heavy shadows.

## Credits

- Original: [terminal-industries.com](https://terminal-industries.com/) by **REJOUICE**. Design and
  content are the intellectual property of their creators.
- Recognition: Awwwards Site of the Month (Sep 2025), Site of the Day, Developer Award.
- This study is an independent clean-room analysis. The rebuild uses a fictional company, AI-generated
  images and open-source fonts; it contains no original code, assets or copy.
