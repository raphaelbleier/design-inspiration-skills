---
title: Shed
url: https://shed.design/
studio: Isaac Powell
awards: [SOTD, Developer Award]
year: 2026
category: architecture
techniques: [scroll-pinning, text-reveal, smooth-scroll, marquee, clip-path-reveal, hover-states, full-screen-menu]
stack: [gsap, scrolltrigger, splittext, lenis, nuxt]
---

# Shed — clean-room study

A brand and interior-architecture studio site that lets one thing do all the work: **gigantic
semibold grotesk type**, set edge to edge with almost no leading. The hero is a full-bleed daylight
photograph with a single-line title across it; a pinned cobalt-blue services stage fills four
huge words with sky blue as you scroll; everything else is white, ink and hairlines. A thin serif
appears only in the marquee, captions and wordmark.

Rebuild: [`design-inspiration-rebuilds/architecture/shed`](https://github.com/raphaelbleier/design-inspiration-skills/tree/main/skills/design-inspiration-rebuilds/architecture/shed) (fictional content, generated images, open-source fonts; installed with the optional `design-inspiration-rebuilds` skill). Run it with `npm install && npm run dev`.

## Design Tokens

| Role | Value |
|---|---|
| Ink | `#1c1c1c` |
| Paper | `#ffffff` |
| Cobalt (services stage) | `#0f00b0` |
| Sky (fill, hover) | `#6ccaff` |
| Menu orange / active link | `#f48502` / `#ffc700` |
| Cursor bubble violet | `#3b15eb` |

```css
:root {
  --ease: cubic-bezier(.14, 1, .34, 1);     /* default UI curve, 0.6-1.4s */
  --inout: cubic-bezier(.9, 0, .1, 1);      /* menu and panel moves, 0.8-1s */
  --gutter: 10px;
}
.hero-title { font-size: 14.28vw; line-height: .9; letter-spacing: -.01em; font-weight: 600; text-transform: uppercase; }
```

- **Type:** one tight grotesk (original: a commercial grotesque pair; substitute: Inter Tight 600 for
  display, Hanken Grotesk for body) plus a sharp text serif (substitute: Newsreader) for marquee and captions.
- **Scale:** hero `14.28vw` (205px @1440) at `line-height .9`; menu links `136px`; services words `~10-11vw`;
  intro statement `48px / 48px`, `-0.02em`; client names `34px`; micro labels `9.6px` uppercase in a hairline pill.
- **Layout:** a flat `10px` gutter on every side, 1px ink/white hairlines, square image corners, no shadows.
  Round shapes are reserved for buttons (scroll dot, play, cursor bubble).

## Motion Spec

| What | Trigger | Animation | Duration / easing | Rebuild file |
|---|---|---|---|---|
| Smooth scroll | always | Lenis `{ lerp: .1, smoothWheel, syncTouch }`, driven by `gsap.ticker`, `lagSmoothing(0)` | — | `src/scroll.js` |
| Hero title | load | SplitText chars in masks rise `yPercent 105 → 0`; photo scales `1.18 → 1` | 1.4s / 2s `expo.out`, stagger .035 | `src/hero.js` |
| Hero parallax | scroll | photo `yPercent 0 → 18` scrubbed | scrubbed | `src/hero.js` |
| Header marquee | always | sentence repeated, `xPercent -50` loop, edge fade mask | 40s linear | `src/header.js` |
| Header tone | section crosses 25px | header colour white ↔ ink by `data-tone` | .5s expo | `src/header.js` |
| Full-screen menu | click | orange panel `clip-path inset(0 0 100% 0) → inset(0)`; links rise in masks | .9s `(.9,0,.1,1)`; links 1.2s `expo.out`, stagger .06 | `src/menu.js` |
| Statement reveal | enters at 85% | SplitText lines in masks, `yPercent 105 → 0` | 1.2s `expo.out`, stagger .08 | `src/reveals.js` |
| Image reveal | enters at 88% | `clip-path inset(100% 0 0 0) → inset(0)` + inner scale `1.25 → 1` | 1.4s / 1.6s `expo.out` | `src/reveals.js` |
| Services stage | scroll, pinned `+=300%` | each word fills sky blue bottom-up (`background-clip: text`, `--h 0 → 100%`), photo cross-fades | scrub .4; fade .8s `(.9,0,.1,1)` | `src/services.js` |
| Client list | hover | siblings dim to .28, "See project" slides in, preview card wipes open | .5-.7s expo | `src/clients.js` |
| News cursor | hover card | violet 76px bubble scales in and follows the pointer | .5s `expo.out`; follow .35s `power3.out` | `src/news.js` |
| "See work" footer link | hover | thumbnail grows `15% → 34%`, arrow nudges | .8-.9s expo | `src/style.css` |

### Key excerpts

**Hero title in masked characters**: `src/hero.js`
```js
const split = new SplitText(title, { type: 'words,chars', wordsClass: 'wd', charsClass: 'ch', mask: 'chars' });
const tl = gsap.timeline({ delay: 0.15 });
tl.from('.hero-media', { scale: 1.18, duration: 2, ease: 'expo.out' }, 0)
  .from(split.chars, { yPercent: 105, duration: 1.4, ease: 'expo.out', stagger: 0.035 }, 0.1)
  // ...
gsap.to('.hero-media', { yPercent: 18, ease: 'none',
  scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
```

**Pinned service words that fill with colour**: `src/services.js`
```js
ScrollTrigger.create({
  trigger: '.services-pin', start: 'top top', end: '+=300%', pin: true, scrub: 0.4,
  onUpdate: (self) => {
    const p = self.progress * words.length;
    words.forEach((w, i) => {
      const fill = gsap.utils.clamp(0, 1, p - i);       // word i fills while p goes i -> i+1
      w.style.setProperty('--h', `${fill * 100}%`);
    });
    show(Math.min(words.length - 1, Math.floor(p)));
  },
});
```

**The fill itself is plain CSS**: `src/style.css`
```css
.svc-word { --h: 0%; color: transparent;
  background: linear-gradient(var(--sky), var(--sky)) 0 100% / 100% var(--h) no-repeat,
              linear-gradient(#fff, #fff);
  -webkit-background-clip: text; background-clip: text; }
```
Two stacked gradients clipped to the glyphs: a white base and a sky layer whose height is the scroll variable.

**Statement line reveal**: `src/reveals.js`
```js
const s = new SplitText('.statement', { type: 'lines', mask: 'lines', linesClass: 'line' });
gsap.from(s.lines, { yPercent: 105, duration: 1.2, ease: 'expo.out', stagger: 0.08,
  scrollTrigger: { trigger: '.statement', start: 'top 85%', once: true } });
```

**Menu panel**: `src/menu.js`
```js
gsap.to(menu, { clipPath: 'inset(0% 0 0% 0)', duration: 0.9, ease: inout });   // inout = (.9,0,.1,1)
gsap.to(links, { yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.06, delay: 0.25 });
```

`prefers-reduced-motion`: smooth scroll, marquee, pinning and reveals are disabled; content is
simply visible.

## Why Award-Worthy

1. **Type as the image.** The hero title and services words are so large that they become the
   layout; photography sits around them instead of competing.
2. **Almost no colour, then one saturated block.** White and ink for the page, a single cobalt stage
   with a sky-blue fill for the services, orange only inside the menu.
3. **One curve for everything.** `cubic-bezier(.14,1,.34,1)` on reveals, hovers and the header, with
   a symmetrical in-out curve only for panels. Consistency reads as polish.
4. **Scroll drives meaning, not decoration.** The pinned stage steps through the four services,
   filling and swapping the photo in sync, so the scroll position is the interface.
5. **Hairline discipline.** Flat 10px gutters, 1px rules, tiny pill labels and square images keep the
   huge type feeling controlled.

**Anti-patterns it avoids:** no shadows, gradients or glass; no generic fade-up on every block (reveals
are masked rises and wipes); no carousel; no decorative cursor beyond one purposeful "visit" bubble.

## Credits

- Original: [shed.design](https://shed.design/) by **Isaac Powell**. Design and content are the
  intellectual property of their creators.
- Recognition: Awwwards Site of the Day, Developer Award.
- This study is an independent clean-room analysis. The rebuild uses a fictional studio, AI-generated
  images and open-source fonts; it contains no original code, assets or copy.
