---
title: Lacoste Ace Breaker
url: https://members-play.lacoste.com/ace-breaker-rg/
studio: Merci Michel
awards: [SOTD, Developer Award]
year: 2026
category: fashion
techniques: [game, canvas, text-reveal, image-crossfade, menu-overlay, micro-animation]
stack: [gsap, canvas, vite]
---

# Lacoste Ace Breaker — clean-room study

A single-screen branded mini-game. A dark-green court photograph slideshow sits under a heavy
veil and grain; a Didone wordmark stacked over a yellow grotesk title, a hand-drawn rule and one
pill CTA lead into a breakout-style tennis game (racket, ball, court tiles). The whole site is
one idea told in two colours: deep green and tennis-ball yellow.

Rebuild: [`design-inspiration-rebuilds/fashion/lacoste-ace-breaker`](https://github.com/raphaelbleier/design-inspiration-skills/tree/main/skills/design-inspiration-rebuilds/fashion/lacoste-ace-breaker) (fictional content, generated images, open-source fonts; installed with the optional `design-inspiration-rebuilds` skill). Run it with `npm install && npm run dev`.

## Design Tokens

| Role | Value |
|---|---|
| Court ink (page) | `#04200f` |
| Court green (tiles, veil) | `#0a3a1c` / `#2f7a46` |
| Cream (wordmark, UI) | `#f3f2e1` |
| Ball yellow (title, CTA, menu) | `#fcd757` |

```css
:root{--ink:#04200f;--cream:#f3f2e1;--yellow:#fcd757;--green:#0a3a1c;--ease:cubic-bezier(.65,.05,0,1)}
.veil{background:linear-gradient(rgba(2,30,12,.78),rgba(2,26,10,.9))}   /* photo barely shows */
.noise{opacity:.18;mix-blend-mode:overlay}                                /* SVG feTurbulence grain */
```

- **Type:** a stretched grotesk (original: Mona Sans, free on Google Fonts) for the yellow
  title and UI, with a high-contrast display serif (substitute: Gloock) for the first title line.
  Both lines are huge (about 10vw) with `line-height: .86` and slightly negative tracking.
- **Shape:** pill CTA (`border-radius: 99px`), 18px canvas frame, thin cream rule drawn with a
  wobbly path. No shadows.

## Motion Spec

| What | Trigger | Animation | Duration / easing | Rebuild file |
|---|---|---|---|---|
| Background slideshow | always | 4 stacked court photos crossfade, each scales 1.08 → 1 | 1.6s `power1.inOut`, 9s linear scale, 5s step | `src/bg.js` |
| Title intro | load | per-character rise `yPercent 110 → 0` with 4deg rotate | 1s `expo.out`, stagger .03 | `src/hero.js` |
| Rule draw | after title | stroke-dashoffset to 0 | 1.2s `power2.inOut` | `src/hero.js` |
| CTA pop | after rule | `autoAlpha` + `y 30 → 0` | .9s `back.out(1.4)` | `src/hero.js` |
| Racket/ball loop | always | ball drops, bounces diagonally, racket slides under it, trail fades | 1.4s loop, `sine.in`/`sine.out` | `src/hero.js` |
| Game | click Play | canvas breakout, lerped racket, angle-by-offset bounce | per frame | `src/game.js` |
| Menu | click | yellow ellipse `clip-path` grows from the button, links rise | .8s `power3.out`; links `back.out(1.2)` | `src/main.js` |
| Hover | hover | CTA scale 1.06 | .75s `cubic-bezier(.65,.05,0,1)` | `src/style.css` |

### Key excerpts

**Title character rise**: `src/hero.js`
```js
gsap.timeline({ delay: .3 })
  .from(chars, { yPercent: 110, rotate: 4, duration: 1, ease: 'expo.out', stagger: .03 })
  .to(rule, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' }, '-=.6')
  .to('#play', { autoAlpha: 1, y: 0, duration: .9, ease: 'back.out(1.4)' }, '-=.7');
```

**Racket and ball loop**: `src/hero.js`
```js
tl.set('.ball', { left: '-4%', top: '-40%' }).set('.pad', { x: '-60%' })
  .to('.ball', { left: '36%', top: '56%', duration: .7, ease: 'sine.in' })
  .to('.pad', { x: 0, duration: .7, ease: 'power2.out' }, 0)
  .to('.ball', { left: '86%', top: '-30%', duration: .7, ease: 'sine.out' })
  .to('.trail', { opacity: 0, duration: .4 }, '<.2');
```

**Racket bounce angle**: `src/game.js`
```js
if (b.vy > 0 && b.y > H - 44 && b.y < H - 30 && Math.abs(b.x - s.px) < pw() / 2 + 6) {
  const a = ((b.x - s.px) / (pw() / 2)) * (Math.PI / 3);   // offset from centre -> up to 60deg
  const sp = Math.hypot(b.vx, b.vy);
  b.vx = Math.sin(a) * sp; b.vy = -Math.cos(a) * sp;
}
```

**Background crossfade**: `src/bg.js`
```js
tl.fromTo(el, { opacity: 0, scale: 1.08 }, { opacity: 1, duration: 1.6, ease: 'power1.inOut' }, i * 5)
  .to(el, { scale: 1, duration: 9, ease: 'none' }, i * 5)
  .to(el, { opacity: 0, duration: 1.6, ease: 'power1.inOut' }, i * 5 + 5.4);
```

**Menu ellipse from the button**: `src/main.js`
```js
gsap.to('#menu', { clipPath: open ? `ellipse(150% 150% at ${origin})` : `ellipse(0% 0% at ${origin})`,
  duration: .8, ease: 'power3.out' });
gsap.fromTo('#menu a', { yPercent: 110, rotate: 4 },
  { yPercent: 0, rotate: 0, duration: .9, ease: 'back.out(1.2)', stagger: .07, delay: .25 });
```

`prefers-reduced-motion`: slideshow shows one still image and the hero intro is skipped.

## Why Award-Worthy

1. **One interaction, instantly clear.** The page is a title and a Play button; the game is the content.
2. **Two-colour discipline.** Deep green and ball yellow carry the brand without a single product shot.
3. **Type contrast.** A Didone line over a wide yellow grotesk reads as sport and luxury at once.
4. **Photography as texture.** Heavy veil and grain make the courts atmosphere, never competing with type.
5. **Small loop, big charm.** The racket/ball micro-animation explains the game before it starts.

**Anti-patterns it avoids:** no scroll-jacking, no product grid, no stock UI chrome around the game.

## Credits

- Original: [Lacoste Ace Breaker](https://members-play.lacoste.com/ace-breaker-rg/) by **Merci Michel**. Design and
  content are the intellectual property of their creators.
- Recognition: Awwwards Site of the Day, Developer Award.
- This study is an independent clean-room analysis. The rebuild uses a fictional brand, AI-generated
  images and open-source fonts; it contains no original code, assets, logos or copy.
