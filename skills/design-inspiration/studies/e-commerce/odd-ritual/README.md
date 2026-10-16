---
title: Odd Ritual
url: https://oddritualgolf.com/
studio: Malvah
awards: [SOTD, Developer Award]
year: 2026
category: e-commerce
techniques: [image-slider, clip-path-wipe, scroll-scrub, text-reveal, parallax, smooth-scroll, modal]
stack: [gsap, scrolltrigger, lenis, barba, lottie, webflow, shopify]
---

# Odd Ritual — clean-room study

A small golf-apparel label whose shop reads like a printed magazine. Almost everything is
photography, white space and one grotesk set tight, interrupted by a tall editorial serif for
the big statement and a pure electric blue used only for tiny marks (sold-out tags, a monogram).
There is no decoration: the motion is a full-bleed hero slider, a word-by-word statement, a
parallax image block and a sticky full-bleed photo.

Rebuild: [`design-inspiration-rebuilds/e-commerce/odd-ritual`](https://github.com/raphaelbleier/design-inspiration-skills/tree/main/skills/design-inspiration-rebuilds/e-commerce/odd-ritual) (fictional content, generated images, open-source fonts; installed with the optional `design-inspiration-rebuilds` skill). Run it with `npm install && npm run dev`.

## Design Tokens

| Role | Value |
|---|---|
| Ink / page dark | `#000000` |
| Paper | `#ffffff` |
| Footer grey | `#f4f4f4` |
| Faded text | `#818181` |
| Accent blue | `#0000ff` |
| Product tile | `#f6f6f6` |

```css
:root {
  --ink:#000; --paper:#fff; --grey:#f4f4f4; --faded:#818181; --blue:#0000ff;
  --m: clamp(1rem, .93rem + .36vw, 1.25rem);   /* site margin, 16-20px */
  --g: .625rem;                                  /* gutter, fixed 10px */
}
```

- **Type:** a neo-grotesk (original: PP Neue Montreal; substitute: Inter Tight) at 400/600. Display
  and UI are uppercase 600, `42px / 42px`, `letter-spacing: -.03em`; body 16px. A serif (original: PP
  Editorial New / Instrument Serif; substitute: Instrument Serif) carries the micro labels (italic
  `01 02 03`, `( FEATURED PRODUCTS )`) and the huge `MORE THAN JUST GOLF` headline at ~10rem, line-height .94.
- **Shape:** zero radii, no shadows, 1px black rules between list rows, bracketed text links `( VIEW ALL )`.
- **Header:** transparent, fixed; wordmark left, a double hairline in the centre (menu), `SHOP NOW / CART` right.
  Inverts automatically over photos and white (`mix-blend-mode: difference` in the rebuild).

## Motion Spec

| What | Trigger | Animation | Duration / easing | Rebuild file |
|---|---|---|---|---|
| Smooth scroll | always | Lenis, `duration 1.2`, expo-out easing, on the GSAP ticker, `lagSmoothing(0)` | — | `src/scroll.js` |
| Hero slider | Next click / auto 6s | next full-bleed photo wipes in from the bottom (`clip-path inset(100% 0 0 0) → 0`), image settles scale 1.08 → 1; caption crossfades with a 24px lift; counter swaps the large numeral | 1.2s `power3.inOut`; caption .6s `power2.out` | `src/hero.js` |
| Statement | scroll | each word opacity .14 → 1, scrubbed across the paragraph | scrub, stagger .5 | `src/reveals.js` |
| Headline mask | enters at 70% | serif lines slide up out of an overflow mask; sparkle mark spins in | .9s `power3.out`, stagger .12 | `src/reveals.js` |
| Partner rows | enters at 85% | row wipes open left to right | 1s `power3.inOut` | `src/reveals.js` |
| Product rail | enters at 85% / drag | cards rise and fade in; native horizontal scroller with pointer drag | .9s `power3.out`, stagger .08 | `src/rail.js` |
| Column parallax | scroll | middle and right image columns drift at different speeds so they stagger | scrub | `src/parallax.js` |
| Sticky photo | scroll | full-bleed photo sticks 130vh, inner image moves -16% | scrub | `src/parallax.js` |
| Menu / cart | click | white panel unrolls (`clip-path inset(0 0 100% 0) → 0`); links rise from masks; cart drawer slides in | .9s / .7s `power3.inOut` | `src/menu.js` |
| Newsletter modal | 2.5s after load | dark backdrop, white split card rises 40px; sits above the fixed header | .8s `power3.out` | `src/popup.js` |
| Row hover | hover | partner image grayscale → colour, scale 1.04 | .6s / 1s `cubic-bezier(.65,.05,0,1)` | `src/style.css` |

### Key excerpts

**Hero slider wipe**: `src/hero.js`
```js
gsap.set(to, { visibility: 'visible', zIndex: 2, clipPath: 'inset(100% 0 0 0)' });
gsap.set(to.querySelector('img'), { scale: 1.08 });
gsap.to(to, { clipPath: 'inset(0% 0 0 0)', duration: dur, ease: 'power3.inOut', onComplete() { /* ... */ } });
gsap.to(to.querySelector('img'), { scale: 1, duration: dur + 0.4, ease: 'power2.out' });
gsap.to(caps[i], { opacity: 0, y: -24, duration: 0.4, ease: 'power2.in' });
gsap.fromTo(caps[n], { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, delay: dur * 0.45, ease: 'power2.out' });
```

**Smooth scroll on the GSAP ticker**: `src/scroll.js`
```js
lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), autoRaf: false });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
```

**Word-by-word statement**: `src/reveals.js`
```js
el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ');
gsap.to(el.querySelectorAll('.w'), { opacity: 1, ease: 'none', stagger: 0.5,
  scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true } });
```

**Column parallax**: `src/parallax.js`
```js
const st = { trigger: '#tri', start: 'top bottom', end: 'bottom top', scrub: true };
gsap.fromTo('.tri .c2', { yPercent: 6 }, { yPercent: -22, ease: 'none', scrollTrigger: st });
gsap.fromTo('.tri .c3', { yPercent: 0 }, { yPercent: 12, ease: 'none', scrollTrigger: st });
```

**Menu panel and masked links**: `src/menu.js`
```js
gsap.to(menu, { clipPath: v ? 'inset(0 0 0% 0)' : 'inset(0 0 100% 0)', duration: 0.9, ease: 'power3.inOut' });
if (v) gsap.fromTo(links, { yPercent: 110 }, { yPercent: 0, duration: 0.8, ease: 'power3.out', stagger: 0.07, delay: 0.3 });
```

`prefers-reduced-motion`: smooth scroll, slider auto-advance and wipes, scrubbed reveals and parallax are off; content is simply visible.

## Why Award-Worthy

1. **Editorial restraint.** Photography, one grotesk and one serif; blue appears only as a stamp.
   The shop feels like a magazine, not a template.
2. **Type pairing at scale.** Tight uppercase grotesk for utility, a tall serif for the single loud
   statement, italic serif for micro labels.
3. **Motion that serves reading.** Word-by-word statement and masked headline lines pace the story;
   nothing bounces.
4. **Hairline UI.** Rules, brackets and a double-line menu icon replace buttons and cards.
5. **Staggered image grid.** Columns at different speeds break the grid without breaking the layout.

**Anti-patterns it avoids:** no shadows or rounded cards; no carousel arrows or dots; no cookie-style
clutter in the first view; no gradient or glass; product grid never fights the editorial blocks.

## Credits

- Original: [oddritualgolf.com](https://oddritualgolf.com/) by **Malvah**. Design and content are
  the intellectual property of their creators.
- Recognition: Awwwards Site of the Day, Developer Award.
- This study is an independent clean-room analysis. The rebuild uses a fictional label, AI-generated
  images and open-source fonts; it contains no original code, assets or copy.
