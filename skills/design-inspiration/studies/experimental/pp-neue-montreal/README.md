---
title: PP Neue Montreal
url: https://neuemontreal.com/
studio: Demande Spéciale
awards: [SOTD, Developer Award]
year: 2026
category: experimental
techniques: [type-specimen, scroll-scrub, smooth-scroll, text-reveal, horizontal-scroll, pinning, variable-font]
stack: [gsap, scrolltrigger, lenis, framer]
---

# PP Neue Montreal — clean-room study

A type-specimen site dressed as a **city travel guide**. A commercial grotesque is sold through
one long page: a red grainy "official guide" cover, a dark manifesto, scattered poster
applications, a weight ladder, tilted accent bands, a fanned trio of cards and a variants
carousel. The font is the content, so every section is a different way to show one family.

Rebuild: [`design-inspiration-rebuilds/experimental/pp-neue-montreal`](https://github.com/raphaelbleier/design-inspiration-skills/tree/main/skills/design-inspiration-rebuilds/experimental/pp-neue-montreal) (fictional content, generated images, open-source fonts; installed with the optional `design-inspiration-rebuilds` skill). Run it with `npm install && npm run dev`.

## Design Tokens

| Role | Value |
|---|---|
| Cover red (with paper grain) | `#f04d46` |
| Ink / dark sections | `#1a1a1a` |
| Cream (specimen sections) | `#f0e7d4` |
| Flat accent fills | yellow `#ebe23e`, orange `#ff6e3e`, green `#18bb45`, blue `#3b5bff`, violet `#5950ac` |

```css
:root {
  --red: #f04d46; --ink: #1a1a1a; --cream: #f0e7d4;
  --yellow: #ebe23e; --orange: #ff6e3e; --green: #18bb45; --blue: #3b5bff; --violet: #5950ac;
  --pad: 24px;
}
.mega { font-weight: 800; letter-spacing: -.035em; line-height: .86; font-size: min(13.6vw, 196px); }
```

- **Type:** the original ships eleven static cuts (Hairline to Black, Display and Text). The
  rebuild uses a fictional name and one variable open-source substitute (Inter Tight, `wght` 100-900).
  Display is heavy with tight tracking and leading `.86-.96`; body is medium at `18-25px`, leading `.98`.
- **Layout:** one 24px page gutter, hairline 1px ink rules between blocks, a floating pill nav
  (`#ededed`, 40px tall, fully rounded) with a dark outlined CTA at the right.
- **Colour logic:** each section is one flat field; saturated colour appears only as poster
  fills, bands and cards, never as gradients. No shadows.

## Motion Spec

| What | Trigger | Animation | Duration / easing | Rebuild file |
|---|---|---|---|---|
| Smooth scroll | always | Lenis `{ lerp: .1 }` on the GSAP ticker; anchors use `scrollTo` | 1.4s expo-out | `src/scroll.js` |
| Headline line reveal | enters at 90% | each line rises from `yPercent 105` inside an overflow mask | .9s `power4.out`, stagger .08 | `src/reveals.js` |
| Cover ring | always | circular "PM" text rotates | 18s linear | `src/style.css` |
| Poster scatter | scroll through section | posters fly from the centre (scale .3, rot 0) to scattered offsets and rotations | scrub 1, `power3.out` | `src/posters.js` |
| Weight ladder | hover / click | sample text changes weight across 11 steps | .45s custom ease | `src/weights.js` |
| Accent bands | scroll | three tilted bands (7, -4, 3deg) slide in alternating directions | scrub .6 | `src/bands.js` |
| Card fan | pin + scroll | three cards rotate out +-26deg from a shared bottom origin | pin +=80%, scrub 1 | `src/fan.js` |
| Variants carousel | scroll | colour-framed cards translate horizontally | scrub .8 | `src/variants.js` |

### Key excerpts

**Poster scatter**: `src/posters.js`
```js
gsap.set(p, { xPercent: -50, yPercent: -50 });
gsap.fromTo(p, { x: 0, y: 0, rotation: 0, scale: 0.3, opacity: 0 },
  { x: () => vw(cs.getPropertyValue('--x')), y: () => vh(cs.getPropertyValue('--y')),
    rotation: parseFloat(cs.getPropertyValue('--r')), scale: 1, opacity: 1, ease: 'power3.out',
    scrollTrigger: { trigger: sec, start: `top ${85 - i * 2}%`, end: 'center 45%', scrub: 1,
      invalidateOnRefresh: true } });
```
Layout (offset, angle) lives in CSS custom properties per poster; GSAP only reads them, so design stays in the markup.

**Smooth scroll on the GSAP ticker**: `src/scroll.js`
```js
const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, autoRaf: false });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
// ...
lenis.scrollTo(el, { duration: 1.4, easing: (x) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x)) });
```

**Card fan**: `src/fan.js`
```js
const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' },
  scrollTrigger: { trigger: '.fan-sec', start: 'top top', end: '+=80%', scrub: 1, pin: true } });
tl.fromTo('.c-l', { rotate: 0, xPercent: 0 }, { rotate: -26, xPercent: -30 }, 0)
  .fromTo('.c-r', { rotate: 0, xPercent: 0 }, { rotate: 26, xPercent: 30 }, 0)
  .fromTo('.c-m', { rotate: 0 }, { rotate: -2 }, 0);
```
Cards share `transform-origin: 50% 100%`, so one rotation value reads as a hand of cards opening.

**Line-mask headline reveal**: `src/reveals.js`
```js
const lines = h.innerHTML.split(/<br\s*\/?>/i);
h.innerHTML = lines.map((l) => `<span style="display:block;overflow:hidden;padding-bottom:.08em;
  margin-bottom:-.08em"><span class="ln" style="display:block">${l}</span></span>`).join('');
gsap.from(h.querySelectorAll('.ln'), { yPercent: 105, duration: 0.9, ease: 'power4.out',
  stagger: 0.08, scrollTrigger: { trigger: h, start: 'top 90%', once: true } });
```

**Tilted accent bands**: `src/bands.js`
```js
const dir = i % 2 ? 1 : -1;
gsap.fromTo(t, { xPercent: dir === -1 ? 0 : -35 }, { xPercent: dir === -1 ? -35 : 0, ease: 'none',
  scrollTrigger: { trigger: '.accents', start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
```

`prefers-reduced-motion`: smooth scroll, pinning, scatter and reveals are disabled; the ring stops and
the carousel becomes a native horizontal scroller.

## Why Award-Worthy

1. **The product is the interface.** Every section is a different proof of the same family:
   weights, accents, ligatures, languages, applications. Nothing decorative competes with the type.
2. **A concept that holds.** The "travel guide" cover, stamp ornaments and flag posters give a
   typeface a place and a story without a single stock illustration.
3. **Flat colour, big type, hairlines.** One grain-textured red, one ink, one cream, with saturated
   fills used only on objects. The restraint makes the posters read as artefacts.
4. **Scroll as choreography, not decoration.** Scattering posters, a card hand that opens, bands
   sliding in opposite directions: each motion explains its content.
5. **Specimen interactions you can touch.** The weight ladder lets the visitor feel the range of the
   family in one hover.

**Anti-patterns it avoids:** no gradients, shadows or glassmorphism; no generic fade-up reveals; no
stock mockups of "type on a poster" with fake text; the nav stays one small pill so the type owns
the screen.

## Credits

- Original: [neuemontreal.com](https://neuemontreal.com/) by **Demande Spéciale**. Design and content
  are the intellectual property of their creators. The typeface it presents is a commercial product
  and is neither used nor embedded here.
- Recognition: Awwwards Site of the Day, Developer Award.
- This study is an independent clean-room analysis. The rebuild uses a fictional typeface and foundry,
  AI-generated images and an open-source font; it contains no original code, assets or copy.
