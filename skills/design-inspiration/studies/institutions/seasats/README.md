---
title: Seasats
url: https://www.seasats.com/
studio: Raw Materials
awards: [SOTD, Developer Award]
year: 2026
category: institutions
techniques: [scroll-pinning, scroll-scrub, smooth-scroll, text-reveal, clip-path-reveal, crossfade, parallax]
stack: [gsap, scrolltrigger, lenis, three]
---

# Seasats — clean-room study

A defence-tech site for small uncrewed ocean vessels that behaves like a calm editorial film. A
hero photograph sits in a rounded frame next to a stack of tinted menu rows; below it, three
pinned stages (a rolling list of threats, a Deploy / Detect / React story, a vessel switcher)
turn product copy into scroll-driven scenes. Light serif display type, a mono for labels, and a
pale-mint to peach gradient keep a hard subject soft.

Rebuild: [`design-inspiration-rebuilds/institutions/seasats`](https://github.com/raphaelbleier/design-inspiration-skills/tree/main/skills/design-inspiration-rebuilds/institutions/seasats) (fictional content, generated images, open-source fonts; installed with the optional `design-inspiration-rebuilds` skill). Run it with `npm install && npm run dev`.

## Design Tokens

| Role | Value |
|---|---|
| Ink | `#232323` |
| Page (pale mint) | `#eef4ef` |
| Menu row ramp | `#d6c4b8` peach → `#b7c8bb` sage → `#8c9487` → `#737d6c` → `#4a5740` → `#2c3a24` |
| Product gradient end stops | `#fdebd0` peach, `#e2ffd2` mint |
| Frame radius | `12px`, 10px gutter around the hero |

```css
:root {
  --ease: cubic-bezier(.65, .05, 0, 1);   /* hover and UI transitions, .75s */
  --serif: 'Instrument Serif', serif;      /* original: a light high-contrast serif */
  --mono: 'JetBrains Mono', monospace;     /* labels, buttons, tabs, uppercase */
}
h1 { font: 400 100.8px/.9 var(--serif); letter-spacing: -1px; }   /* original measured 100.8 / 90.7 */
body { font: 400 14.2px/1.4 var(--sans); }
```

- **Type:** three voices. Big light serif for statements, a quiet grotesk for body (14.2px) and
  a wide pixel-ish display face for the wordmark. Mono caps (12px, tracked) for every button, tab
  and image caption.
- **Menu:** not a hamburger overlay but a column of twelve full-height rows whose background
  walks from peach through sage to dark moss, so the colour itself becomes the wayfinding.
- **Product light:** vessel cutouts sit on a vertical gradient (mint → peach → lime-mint);
  `mix-blend-mode: multiply` drops the studio backdrop.

## Motion Spec

| What | Trigger | Animation | Duration / easing | Rebuild file |
|---|---|---|---|---|
| Smooth scroll | always | Lenis `{ lerp: .1, smoothWheel, syncTouch }` on the gsap ticker, `lagSmoothing(0)` | — | `src/scroll.js` |
| Hero headline | load | each line rises out of an overflow mask, `yPercent 110 → 0` | 1.2s `power3.out`, stagger .12 | `src/hero.js` |
| Hero photo drift | scroll | image `yPercent 0 → 12` while hero leaves | scrubbed | `src/hero.js` |
| Menu stack | scroll past 40% of hero | stack slides out `xPercent 110`; MENU button fades in and recalls it | .8s `power3.out` | `src/hero.js` |
| Threat list | pinned, scrubbed | six lines; one is lit at a time, its image card wipes in from the bottom with `clip-path` | .5s `power2.out` in, .3s out | `src/intel.js` |
| Deploy / Detect / React | pinned, scrubbed | background photo crossfades, headline rises, four-column feature row staggers up | .7s `power3.out`, stagger .1 | `src/steps.js` |
| Vessel switcher | scroll stops or tab click | outgoing vessel slides `-12%` and rotates `-4°`, incoming enters from `+12%`; spec text swaps | .9s `power3.out` | `src/fleet.js` |
| Floating thumbs | scroll | video-still cards drift `±40%` in opposite directions | scrubbed | `src/fleet.js` |
| Word reveal | enters at 85% | words in overflow masks, `yPercent 110 → 0` | 1s `power3.out`, stagger .06 | `src/reveals.js` |
| Mission cards | enters at 85% | `clip-path inset(100% 0 0 0) → 0` plus inner image `scale 1.2 → 1` | 1s `power2.inOut` / 1.4s `power2.out` | `src/reveals.js` |
| Hover states | hover | link padding and brightness, CTA arrow nudge | .75s `cubic-bezier(.65,.05,0,1)` | `src/style.css` |

### Key excerpts

**Smooth scroll on the GSAP ticker**: `src/scroll.js`
```js
lenis = new Lenis({ lerp: 0.1, smoothWheel: true, syncTouch: true, autoRaf: false });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));   // gsap time is seconds, lenis wants ms
gsap.ticker.lagSmoothing(0);
```

**Threat list: one pin, one timeline**: `src/intel.js`
```js
const tl = gsap.timeline({ scrollTrigger: { trigger: '.intel', start: 'top top',
  end: 'bottom bottom', scrub: 0.6, pin: '.intel-pin', anticipatePin: 1 } });
tl.fromTo('.intel-bg', { scale: 1.15 }, { scale: 1, duration: lis.length, ease: 'none' }, 0);
lis.forEach((li, i) => {
  tl.call(() => lis.forEach((o, j) => o.classList.toggle('on', j === i)), null, i + 0.05);
  tl.fromTo(cards[i], { opacity: 1, clipPath: 'inset(100% 0 0 0)' },
    { clipPath: 'inset(0% 0 0 0)', duration: 0.5, ease: 'power2.out' }, i + 0.05);
  tl.to(cards[i], { opacity: 0, duration: 0.3, ease: 'power2.in' }, i + 0.9);
});
```
One timeline unit per line, so the list is just `lis.length` units of scroll.

**Three acts in one pinned stage**: `src/steps.js`
```js
heads.forEach((h, i) => {
  const t = i * 3;
  if (i) tl.to(bg[i], { opacity: 1, duration: 0.8, ease: 'none' }, t - 0.4);   // photo crossfade
  tl.fromTo(h, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, t);
  tl.fromTo(cols[i].children, { y: 30, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', stagger: 0.1 }, t + 0.2);
  if (i < heads.length - 1) tl.to([h, cols[i]], { opacity: 0, duration: 0.5, ease: 'power2.in' }, t + 2.4);
});
```

**Scroll stops drive a tabbed product**: `src/fleet.js`
```js
const go = (i) => {
  const dir = i > cur ? 1 : -1;
  gsap.to(vs[cur], { opacity: 0, xPercent: -12 * dir, rotate: -4 * dir, duration: 0.9, ease: 'power3.out' });
  gsap.fromTo(vs[i], { opacity: 0, xPercent: 12 * dir, rotate: 4 * dir },
    { opacity: 1, xPercent: 0, rotate: 0, duration: 0.9, ease: 'power3.out' });
  // ...
  cur = i;
};
ScrollTrigger.create({ trigger: root, start: 'top top', end: 'bottom bottom', pin: '.fleet-pin',
  onUpdate: (s) => go(Math.min(2, Math.floor(s.progress * 3))) });
```
Tabs call `lenis.scrollTo` to the stop's scroll position, so scroll and click share one state path.

**Mask reveal for words**: `src/reveals.js`
```js
el.innerHTML = el.textContent.split(/\s+/).map((w) => `<span class="w"><span>${w}</span></span>`).join(' ');
gsap.from(el.querySelectorAll('.w > span'), { yPercent: 110, duration: 1, ease: 'power3.out',
  stagger: 0.06, scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
```

`prefers-reduced-motion`: smooth scroll and all pinning are off, the tracks collapse to normal
height and every list, card and column is simply visible.

## Why Award-Worthy

1. **Story as pinned stages.** Each pinned stage carries one idea (what we find, how it works,
   what we sell) so a technical product reads as three scenes rather than a spec sheet.
2. **Colour as navigation.** The tinted menu stack ties the hero, menu and footer into one
   palette and replaces an overlay with something that is always legible.
3. **Soft palette for a hard subject.** Pale mint, peach and moss plus a light serif make
   defence hardware feel calm and credible.
4. **Product on a gradient.** Vessels are shown large, uncropped and lit by the page itself,
   with floating footage stills that keep the stage alive without video chrome.
5. **Restraint in motion.** Two easings (`power3.out`, `power2.out`), one reveal shape per element
   type, no scroll-jacking beyond the pins.

**Anti-patterns it avoids:** no hamburger-only navigation on desktop, no carousel arrows (scroll
and tabs share state), no stock-gradient hero, no autoplay clutter over the copy.

## Credits

- Original: [seasats.com](https://www.seasats.com/) by **Raw Materials**. Design and content are
  the intellectual property of their creators.
- Recognition: Awwwards Site of the Day, Developer Award.
- This study is an independent clean-room analysis. The rebuild uses a fictional company,
  AI-generated images and open-source fonts; it contains no original code, assets or copy.
