---
title: Santioni Spirits
url: https://santionispirits.com/
studio: Active Theory
awards: [SOTD, Developer Award]
year: 2026
category: food-drink
techniques: [webgl, shader, scroll-pinning, scroll-storytelling, text-reveal, illustration, age-gate]
stack: [three, gsap, scrolltrigger, splittext, lenis]
---

# Santioni Spirits — clean-room study

A ready-to-pour cocktail brand sold as a **woodcut graphic novel**. After an age gate, one pinned scroll walks a
lone pilgrim through engraved panels (desert, stairway, red disc, a reaching hand, a red hall) to three
bottles on an altar. There is no conventional page: the stage never scrolls, the *story* does. A
single WebGL canvas carries the background and pours each new colour in like wet ink; comic-style caption
boxes with hand-roughened borders do the talking.

Rebuild: [`design-inspiration-rebuilds/food-drink/santioni-spirits`](https://github.com/raphaelbleier/design-inspiration-skills/tree/main/skills/design-inspiration-rebuilds/food-drink/santioni-spirits) (fictional brand "Verdelune", generated images, open-source fonts; installed with the optional `design-inspiration-rebuilds` skill). Run it with `npm install && npm run dev`.

## Design Tokens

| Role | Value |
|---|---|
| Near-black (gate, footer, text) | `#121212` / gate `#1a1a1a` |
| Hero dark paper | `#202022` with `#2b2b2e` streaks |
| Paper white (panels, boxes) | `#f4f3ef` / `#fff` |
| Signal red (hover, highlights, red scenes) | `#c82924` |
| Wood maroon (hand scene) | `#55201f` |

```css
:root {
  --ink: #121212; --dark: #202022; --paper: #f4f3ef; --red: #c82924; --wood: #55201f;
  --line: 3px;                                  /* every border in the system */
  --h1: clamp(56px, calc(22vw - 28px), 190px);  /* fluid display sizes */
}
.h1 { font-family: 'Limelight', serif; text-transform: uppercase; letter-spacing: .005em; line-height: 1.05; }
.body-bold { font-family: 'M PLUS Rounded 1c'; font-weight: 800; text-transform: uppercase; }
```

- **Type:** three voices only. A condensed Art-Nouveau display face in caps for headings (original: Charles Rosie,
  heading sizes up to ~217px, `line-height 1.2`; substitute: Limelight), a fat rounded grotesk in caps for UI and
  captions (original: PP Nikkei Maru Ultrabold, 15px; substitute: M PLUS Rounded 1c 800), and a light text face
  for legal copy (original: GT Era Text Light; substitute: Figtree 300). A script wordmark is the logo.
- **Shape:** 3px black rules everywhere, never a shadow. Boxes are white with a **wobbled outline** (hand-cut look).
- **Illustration:** high-contrast engraved hatching with exactly one accent colour per scene (ochre cloak, red
  disc, turquoise cloak, blue/green/yellow bottles). The page colour is always one of three flats.

## Motion Spec

| What | Trigger | Animation | Duration / easing | Rebuild file |
|---|---|---|---|---|
| Age gate | load | full-black screen, two huge headline lines top and bottom, YES / NO 96x48 outlined buttons; hover turns border and text red | `.1s ease-in-out` colour; open: `inset` clip-path slides up | `src/main.js` |
| Hero entrance | gate passed | title chars rise with a small rotation, ink blob rises at the bottom | stagger .04, 1.1s `power3.out`; splash 2.2s `power2.out` | `src/main.js` |
| Smooth scroll | always | Lenis `{ lerp: .1, smoothWheel }`, driven by `gsap.ticker`, locked until gate is passed | — | `src/scroll.js` |
| Ink background | scroll | one fullscreen shader; each seam pours the next flat colour from the bottom with brush-streak noise | seam `1` unit, `power2.inOut`, scrubbed | `src/ink.js` |
| Master timeline | scroll | one pinned stage, 11 panels on a 3-unit grid, ~14 viewport heights of scroll, `scrub: .6` | scrubbed | `src/story.js` |
| Panel swap | at seam middle | old panel autoAlpha to 0, new to 1 while the ink covers the screen | .3s each | `src/story.js` |
| Caption box | panel enters | rough-edged box wipes in left to right, then characters appear one by one | .5s `power2.out`; chars stagger .008 | `src/story.js` |
| Picture drift | whole dwell | slow scale 1.08 to 1 | linear | `src/story.js` |
| Hold & move | pointer on hand panel | round chip follows the cursor; dragging pushes the hand, release springs back | quickTo .35s `power3`; `elastic.out(1, .5)` | `src/hand.js` |
| Drink select | hover / click | hovered bottle lifts, others dim; click fills the pour scene and scrolls to it | `.45s cubic-bezier(.65,.05,0,1)` | `src/select.js` |
| Pour | panel enters | white stream falls from the top, bottle drops in, flavour name rises | stream .8s `power1.in`; bottle .9s `power3.out` | `src/story.js` |
| Cursor on ink | pointer move | the ink edge bulges near the pointer | smoothed .08 per frame | `src/ink.js` |

### Key excerpts

**Ink edge: one threshold per seam**: `src/ink.js`
```glsl
vec2 q = vec2(uv.x + float(i) * 3.7, uv.y);
float n = .6 * fbm(q * vec2(1.5, 3.0)) + .4 * fbm(q * vec2(1.2, 18.0));   // soft body + horizontal brush streaks
float thr = p * 1.6 - .3 + (n - .5) * .5 + exp(-md * md * 30.0) * .09 * uMouseAmp;
float d = thr - uv.y;
float cover = smoothstep(-fwidth(d), fwidth(d), d);                         // anti-aliased edge
col = mix(col, uC[i + 1], cover);
```
The background is not an image or a div: it is a stack of 10 flat colour pours that scroll progress drives from 0 to 1.

**One timeline, one pin**: `src/story.js`
```js
tl.fromTo(state.p[i - 1], { v: 0 }, { v: 1, duration: 1, ease: 'power2.inOut' }, T(i) - 0.6);
tl.to(panels[i - 1], { autoAlpha: 0, duration: 0.3 }, T(i) - 0.3);
tl.fromTo(p, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, T(i));
// ...
ScrollTrigger.create({ animation: tl, trigger: '#stage', start: 'top top',
  end: () => '+=' + innerHeight * 14, pin: true, scrub: 0.6, invalidateOnRefresh: true });
```
The ink seam, the panel swap and every caption are placed on the same unit grid, so the whole story scrubs forwards and backwards.

**Caption box: wipe, then type**: `src/story.js`
```js
const split = new SplitText(text, { type: 'chars,words', charsClass: 'ch' });
tl.fromTo(cap, { autoAlpha: 0, clipPath: 'inset(0 100% 0 0)' },
  { autoAlpha: 1, clipPath: 'inset(0 0% 0 0)', duration: 0.5, ease: 'power2.out' }, at);
tl.fromTo(split.chars, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01, stagger: 0.008 }, at + 0.15);
```

**Wobbled box outline**: `src/style.css`
```css
.box::before { content: ''; position: absolute; inset: 0; z-index: -1;
  background: #fff; border: var(--line) solid var(--ink); filter: url(#rough); }
/* <feTurbulence baseFrequency=".035" numOctaves="2"/> + <feDisplacementMap scale="5"/> */
```
Border and fill live on a pseudo element so the text on top stays crisp.

**Hold & move**: `src/hand.js`
```js
const dx = gsap.quickTo(hand, 'x', { duration: 0.5, ease: 'power3' });
panel.addEventListener('pointermove', (e) => {
  if (down) dx(gsap.utils.clamp(-90, 90, (e.clientX - down.x) * 0.6));
});
gsap.to(hand, { x: 0, y: 0, duration: 1.1, ease: 'elastic.out(1, .5)', overwrite: true });   // release
```

`prefers-reduced-motion`: the canvas, Lenis, pin and timeline are not created; panels become a plain stacked
page with flat colours and all captions visible.

## Why Award-Worthy

1. **The page is a story, not a layout.** One pinned stage and one timeline turn a drinks brand into a
   graphic novel; scroll is the page-turn. Nothing scrolls except time.
2. **One illustration language.** Every scene is engraved hatching with a single accent colour, so ten
   very different images still read as one world, and the product bottles arrive as the only saturated objects.
3. **Colour as transition.** Instead of cross-fades, the next page colour *pours in* from the bottom with brush
   noise. The background is a shader, so the same system gives the hero streaks, the splash and every seam.
4. **Tiny, strict UI vocabulary.** 3px rules, wobbled white boxes, three type voices, red only on hover and
   highlighted words. The interface looks drawn by the same hand as the art.
5. **Playful interaction at the right moment.** "Hold and move" reaches a hand toward the glow; the drink
   select and pour scene end the story with a purchase-flavoured payoff.

**Anti-patterns it avoids:** no scroll-jacking surprises (the pin has a clear length and nav jumps work); no
stock product shots in the middle of the story; no gradients or shadows; no generic fade-up reveals; the age
gate is a designed first scene, not a grey modal.

## Credits

- Original: [santionispirits.com](https://santionispirits.com/) by **Active Theory**. Design, illustration and
  content are the intellectual property of their creators.
- Recognition: Awwwards Site of the Day, Developer Award.
- This study is an independent clean-room analysis. The rebuild uses a fictional brand, AI-generated images
  (listed as prompts in `images.json`) and open-source fonts; it contains no original code, assets or copy.
