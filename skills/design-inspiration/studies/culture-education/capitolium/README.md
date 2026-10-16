---
title: Capitolium
url: https://www.collabcapitolium.fr
studio: Supercolor
awards: [SOTD, Developer Award]
year: 2026
category: culture-education
techniques: [entry-gate, scroll-pinning, horizontal-scroll, text-reveal, image-reveal, smooth-scroll, video-background]
stack: [nuxt, gsap, scrolltrigger, lenis]
---

# Capitolium — clean-room study

A launch site for a co-branded football and rugby jersey, told as a guided visit through a city
hall. A full-screen **entry gate** over aerial footage opens onto a pinned facade that shrinks into
a frame, then three **chapters** (arcades, council room, gallery) where arched windows grow to fill
the screen. The look is museum-formal: cream marble, gold wide-tracked serif, slate panels and a
calligraphic script for the motto.

Rebuild: [`design-inspiration-rebuilds/culture-education/capitolium`](https://github.com/raphaelbleier/design-inspiration-skills/tree/main/skills/design-inspiration-rebuilds/culture-education/capitolium) (fictional content, generated images, open-source fonts; installed with the optional `design-inspiration-rebuilds` skill). Run it with `npm install && npm run dev`.

## Design Tokens

| Role | Value |
|---|---|
| Cream (page, marble base) | `#f0e3cf` |
| Gold (wordmark, accents) | `#c3a677` |
| Slate (text, panels) | `#58595b` |
| Ink (overlay, dark chapter) | `#1d1a17` |

```css
:root {
  --cream: #f0e3cf; --gold: #c3a677; --slate: #58595b; --ink: #1d1a17;
  --ease: cubic-bezier(.65, .05, 0, 1);
}
```

- **Type:** a condensed uppercase grotesque for headings (`-0.02em` tracking, ~100px mega, 24px
  subheads), a wide-tracked high-contrast serif for the wordmark (`.26em`, gold), a text serif for
  body, and a formal copperplate script for the motto (original: Edwardian Script; substitute:
  Pinyon Script). Small labels are uppercase at `.16em` tracking.
- **Surfaces:** cream marble texture on light sections, flat slate and near-black on dark ones, a thin
  gold frame around slate blocks. Arched tops (`border-radius: 999px 999px 0 0`) on every photo.
- **Wordmark band:** a sticky double-ruled strip with the site name and the chapter name on both sides.

## Motion Spec

| What | Trigger | Animation | Duration / easing | Rebuild file |
|---|---|---|---|---|
| Smooth scroll | always (stopped at gate and menu) | Lenis `{ lerp: .09, smoothWheel }` driven by `gsap.ticker` | — | `src/scroll.js` |
| Entry gate | click "Entrer" | gate lifts off `yPercent: -100`, content fades up; chrome drops in | 1.4s `cubic-bezier(.65,.05,0,1)` | `src/gate.js` |
| Gate backdrop | always | slow scale 1 → 1.1 drift | 24s alternate | `src/style.css` |
| Facade to frame | scroll through 320vh | text fades in, then photo clip-path `inset(0)` → `inset(22% 30%)` onto cream | scrubbed 0.6 | `src/intro.js` |
| Arch grow | pinned scroll | centre arch scales to 94vw, sides slide off, giant script word rises | scrubbed 0.8, `power2.inOut` | `src/chapter1.js` |
| Horizontal panels | pinned scroll | track translates by `scrollWidth - innerWidth` | scrubbed 0.8 | `src/chapter1.js` |
| Text reveal | enters at 88% | SplitText line masks, `yPercent: 105 → 0` | 1.1s `power3.out`, stagger .1 | `src/reveals.js` |
| Image reveal | enters at 88% | `clip-path inset(100% 0 0 0)` → open, inner scale 1.3 → 1 | 1.3s custom curve | `src/reveals.js` |
| Jerseys on plinths | enters at 85% | rise 120px + fade, plinths follow | 1.4s `power3.out`, stagger .2 | `src/reveals.js` |
| Menu | burger click | circle clip-path from top centre; links slide up | .9s `power3.out`, links stagger .07 | `src/nav.js` |
| Chapter pill | scroll into chapter | bottom pill slides in and swaps its label | .8s custom curve | `src/nav.js` |

### Key excerpts

**Entry gate lift**: `src/gate.js`
```js
gsap.timeline({ defaults: { ease: 'cubic-bezier(.65,.05,0,1)' } })
  .to('.gate__inner', { opacity: 0, y: -40, duration: 0.7 })
  .to(gate, { yPercent: -100, duration: 1.4 }, 0.15)
  .add(() => {
    document.body.classList.remove('locked');
    lenis?.start();
    onEnter();
  }, '>-0.2');
```

**Facade shrinks into a frame**: `src/intro.js`
```js
const tl = gsap.timeline({ defaults: { ease: 'none' },
  scrollTrigger: { trigger: '.intro', start: 'top top', end: 'bottom bottom', scrub: 0.6 } });
tl.fromTo('#introTxt', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.22 })
  .to('#introTxt', { opacity: 0, duration: 0.15 }, 0.5)
  .fromTo('#introImg', { clipPath: 'inset(0% 0% 0% 0%)' },
    { clipPath: 'inset(22% 30% 22% 30%)', ease: 'power2.inOut', duration: 0.4 }, 0.45);
```

**Arch grows to fill the screen**: `src/chapter1.js`
```js
gsap.timeline({ defaults: { ease: 'power2.inOut' }, scrollTrigger: {
  trigger: '#arches', start: () => `top ${bandH()}`, end: '+=140%', pin: true, scrub: 0.8 } })
  .to('.arch--l', { xPercent: -160, opacity: 0, duration: 1 }, 0)
  .to('.arch--r', { xPercent: 160, opacity: 0, duration: 1 }, 0)
  .to(c, { scale: () => (innerWidth * 0.94) / c.offsetWidth,
           transformOrigin: '50% 100%', duration: 1.2 }, 0)
  .fromTo('#giant', { opacity: 0, yPercent: 60 }, { opacity: 1, yPercent: 0, duration: 0.8 }, 0.9);
```

**Pinned horizontal track**: `src/chapter1.js`
```js
gsap.to(track, { x: () => -(track.scrollWidth - innerWidth), ease: 'none', scrollTrigger: {
  trigger: track, start: () => `top ${bandH()}`,
  end: () => '+=' + (track.scrollWidth - innerWidth),
  pin: true, scrub: 0.8, invalidateOnRefresh: true } });
```

**Line-mask text reveal**: `src/reveals.js`
```js
SplitText.create(el, { type: 'lines', mask: 'lines', autoSplit: true, onSplit: (s) =>
  gsap.from(s.lines, { yPercent: 105, duration: 1.1, ease: 'power3.out', stagger: 0.1,
    scrollTrigger: { trigger: el, start: 'top 88%', once: true } }) });
```

`prefers-reduced-motion`: smooth scroll, pins, reveals and the backdrop drift are off; the gate is a plain
button and the horizontal track stacks vertically.

## Why Award-Worthy

1. **A ritual entrance.** The gate frames the site as a place you enter, not a page you land on, and
   sets the formal tone before any content appears.
2. **One shape repeated.** The arch is the photo frame, the card mask and the grow transition, so a
   single motif ties architecture, product and motion together.
3. **Restrained palette, rich type.** Cream, gold and slate only; the wide serif, condensed grotesque
   and script each have one job.
4. **Chapters as navigation.** The sticky wordmark band and the bottom pill always say where you are in
   the story.
5. **Product as monument.** Jerseys stand on plinths like exhibits, which justifies the museum tone.

**Anti-patterns it avoids:** no carousels, no parallax confetti, no bright accent colours, no generic
fade-up reveals; scroll-driven moments always end on a readable resting frame.

## Credits

- Original: [collabcapitolium.fr](https://www.collabcapitolium.fr) by **Supercolor**. Design and content
  are the intellectual property of their creators.
- Recognition: Awwwards Site of the Day, Developer Award.
- This study is an independent clean-room analysis. The rebuild uses fictional clubs, AI-generated
  images and open-source fonts; it contains no original code, assets or copy.
