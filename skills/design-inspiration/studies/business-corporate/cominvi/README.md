---
title: Cominvi
url: https://www.cominvi.com.mx/
studio: HOLOGRAPHIK
awards: [SOTD, Developer Award]
year: 2026
category: business-corporate
techniques: [scroll-pinning, frame-sequence, smooth-scroll, text-reveal, counters, scrubbed-list, mono-labels]
stack: [gsap, scrolltrigger, lenis, webflow, canvas]
---

# Cominvi — clean-room study

A corporate site for an underground mining contractor that stays serious by being quiet. The hero is
a **scroll-scrubbed frame sequence** of a dark tunnel on a `<canvas>`; below it the page flips to
flat white and pale mist sections, one very heavy grotesk, and tiny monospace labels. Two pinned
scroll "instruments" carry the personality: a minerals picker inside a ticking dial, and a
partner list that rolls like a wheel.

Rebuild: [`design-inspiration-rebuilds/business-corporate/cominvi`](https://github.com/raphaelbleier/design-inspiration-skills/tree/main/skills/design-inspiration-rebuilds/business-corporate/cominvi) (fictional content, generated images, open-source fonts; installed with the optional `design-inspiration-rebuilds` skill). Run it with `npm install && npm run dev`.

## Design Tokens

| Role | Value |
|---|---|
| Ink (text, footer, hero base) | `#151515` |
| Page white | `#ffffff` |
| Mist (services, technology sections) | `#ebf0ed` |
| Grey (mono captions) | `#6b6f6c` |
| Hairline | `#c9ccc9` |

```css
:root { --ink:#151515; --mist:#ebf0ed; --grey:#6b6f6c; --line:#c9ccc9; --gut:2rem;
        --ease:cubic-bezier(.65,.05,0,1); }
```

- **Type:** a neo-grotesk (original: Helvetica Now Display; substitute: Inter Tight) at weight 700.
  Display paragraphs `48px / line-height 1 / letter-spacing -.01em`; card titles `32px / 1.1 / -.025em`;
  hero H1 about `56px`, tracking `-.04em`.
- **Mono labels:** a mono at 300 weight, 11px (original: PP Supply Mono; substitute: JetBrains Mono).
  Section numbers `S.01 ... S.08` sit in an outlined chip above a filled ink chip with the section name.
- **Layout:** one 2rem gutter, 3-column card grid with `1rem` gaps, radius `.5rem`, no shadows.
  Colour only changes between white and mist; the only imagery with colour is photography.

## Motion Spec

| What | Trigger | Animation | Duration / easing | Rebuild file |
|---|---|---|---|---|
| Smooth scroll | always | Lenis `{ lerp: .1, smoothWheel }`, driven by `gsap.ticker`, `lagSmoothing(0)` | — | `src/scroll.js` |
| Hero frame sequence | scroll through a 420vh sticky hero | canvas draws and cross-fades frames by progress, slow push-in `1.12 -> 1`; headline fades out first | scrub .6 | `src/sequence.js` |
| Hero counter | hero scroll | "+ 1.000.000 LINEAR METERS" counts up with the scrub | `power1.out` | `src/sequence.js` |
| Block reveals | enters at 88% | big paragraphs and cards slide up 40px and fade in | 1s `power3.out`, stagger .1 | `src/reveals.js` |
| Stat counters | enters at 90% | numbers count up, comma decimals (`5,1k`) | 1.6s `power2.out` | `src/reveals.js` |
| Service cards | hover | title lifts, description fades in from below | .6s `cubic-bezier(.65,.05,0,1)` | `src/style.css` |
| Minerals dial | scroll through a 600vh pinned section | active mineral = progress bucket; 120-tick ring fills per bucket; list greys out others; rock photo cross-fades; code `CU [#29]` updates | .5-.6s ease | `src/minerals.js` |
| Partner wheel | scroll through a 520vh pinned section | names slide along a vertical axis; scale, opacity and y derive from distance to a float index | scrubbed | `src/wheel.js` |
| Menu | click | full-screen ink panel opens as a circle clip-path from the burger; links rise in | .9s `power3.inOut` | `src/menu.js` |
| Quote switcher | timer / dots | cross-fade between two testimonials | .7s `cubic-bezier(.65,.05,0,1)`, 6s auto | `src/quotes.js` |

### Key excerpts

**Frame sequence on a canvas**: `src/sequence.js`
```js
const f = state.p * (imgs.length - 1);
const a = Math.floor(f), t = f - a;
[[a, 1], [Math.min(a + 1, imgs.length - 1), t]].forEach(([i, alpha]) => {
  const s = Math.max(w / im.naturalWidth, h / im.naturalHeight) * (1.12 - 0.12 * state.p);
  ctx.globalAlpha = i === a ? 1 : alpha;
  ctx.drawImage(im, (w - im.naturalWidth * s) / 2, (h - im.naturalHeight * s) / 2,
    im.naturalWidth * s, im.naturalHeight * s);
});
// ...
gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom bottom', scrub: 0.6 } })
  .to(state, { p: 1, ease: 'none', duration: 1, onUpdate: draw }, 0);
```
The hero is a tall section with a `position: sticky` child, so no GSAP pin is needed.

**Smooth scroll on the GSAP ticker**: `src/scroll.js`
```js
lenis = new Lenis({ lerp: 0.1, smoothWheel: true, autoRaf: false });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
```

**Dial of ticks**: `src/minerals.js`
```js
const N = 120;
for (let i = 0; i < N; i++)
  ticks.insertAdjacentHTML('beforeend', `<i style="transform:rotate(${(i * 360) / N}deg)"></i>`);
// ...
const i = Math.min(M.length - 1, Math.floor(p * M.length));          // active mineral
const lit = Math.round(((p * M.length) % 1 || (p >= 1 ? 1 : 0)) * N); // ticks filled in this bucket
tk.forEach((t, k) => t.classList.toggle('on', k < lit));
```
Each tick pivots on the ring centre via `transform-origin: 0 <radius>`.

**Wheel list**: `src/wheel.js`
```js
const render = (idx) => els.forEach((e, i) => {
  const d = i - idx, a = Math.abs(d);
  const y = Math.sign(d) * (Math.min(a, 1) * 105 + Math.max(a - 1, 0) * 60);
  e.style.transform = `translateY(calc(-50% + ${y}px)) scale(${Math.max(0.35, 1 - 0.22 * a)})`;
  e.style.opacity = Math.max(0, 1 - 0.62 * a);
});
// ...
ScrollTrigger.create({ trigger: '.partners', start: 'top top', end: 'bottom bottom',
  onUpdate: (s) => render(s.progress * (P.length - 1)) });
```

**Menu from the burger**: `src/menu.js`
```js
gsap.to(menu, { clipPath: open ? 'circle(150% at calc(100% - 3.5rem) 3rem)'
                               : 'circle(0% at calc(100% - 3.5rem) 3rem)',
  duration: 0.9, ease: 'power3.inOut' });
if (open) gsap.fromTo('.menu a', { yPercent: 100, opacity: 0 },
  { yPercent: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.06, delay: 0.3 });
```

`prefers-reduced-motion`: smooth scroll, scrubbing and reveals are disabled; the first hero frame,
all stats and the first mineral are shown statically.

## Why Award-Worthy

1. **A sober brand with a cinematic opener.** The one dramatic asset (a tunnel scrubbed with scroll)
   sets the mood, then the page drops to white so the content reads as engineering, not advertising.
2. **Two instruments, not twenty effects.** The mineral dial and the partner wheel are the only
   pinned moments; both turn scroll progress into a single float index, so they feel mechanical.
3. **Mono labels as a system.** `S.01 ... S.08` chips, outlined plus filled, give a technical
   index without any extra graphics.
4. **Type restraint.** One grotesk at one heavy weight with tight tracking; hierarchy is size only.
5. **Colour discipline.** Ink, white, one pale mist; photography supplies all colour.

**Anti-patterns it avoids:** no stock-photo carousels, no gradients or shadows on UI, no rotating
logo wall (partners become a typographic wheel), no motion that is not tied to scroll or intent.

## Credits

- Original: [cominvi.com.mx](https://www.cominvi.com.mx/) by **HOLOGRAPHIK**. Design and content are
  the intellectual property of their creators.
- Recognition: Awwwards Site of the Day, Developer Award.
- This study is an independent clean-room analysis. The rebuild uses a fictional contractor,
  AI-generated images and open-source fonts; it contains no original code, assets or copy.
