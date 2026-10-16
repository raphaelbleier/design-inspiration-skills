---
title: Tracing Art
url: https://www.getty.edu/tracingart/
studio: Resn
awards: [SOTM Jul 2025, SOTD, Developer Award]
year: 2025
category: culture-education
techniques: [webgl, scroll-pinning, parallax, smooth-scroll, data-visualization, storytelling, menu-transition]
stack: [three, gsap, scrolltrigger, lenis, nuxt]
---

# Tracing Art — clean-room study

An editorial scroll story about the ownership history of artworks. There is almost no chrome: a
white page, one pale blue-grey chapter colour, a refined serif for every sentence and the artworks
themselves as the only colour. The page moves from a scatter of floating cards, to a pinned
chain of owners around one painting, to a rotating WebGL sphere that shows the scale of the data.

Rebuild: [`design-inspiration-rebuilds/culture-education/tracing-art`](https://github.com/raphaelbleier/design-inspiration-skills/tree/main/skills/design-inspiration-rebuilds/culture-education/tracing-art) (fictional content, generated images, open-source fonts; installed with the optional `design-inspiration-rebuilds` skill). Run it with `npm install && npm run dev`.

## Design Tokens

| Role | Value |
|---|---|
| Page | `#ffffff` |
| Ink | `#000000` |
| Chapter background (pale blue-grey) | `#dbe2e9` |
| Chip / card placeholder | `#f3f3f3` |
| Muted caption | `#8a8f94` |

```css
:root {
  --bg: #fff; --chapter: #dbe2e9; --ink: #000; --chip: #f3f3f3; --mute: #8a8f94;
  --serif: 'Instrument Serif', Georgia, serif;   /* original: a bookish serif (Bardford) */
  --sans: Inter, Roboto, 'Helvetica Neue', sans-serif; /* original: Graphik */
  --ease: cubic-bezier(.65, .05, 0, 1);
}
```

- **Type:** serif at 64px / line-height 1 / `letter-spacing: -.03em` for the intro headline; 34px for
  the mid-page statement; 56px for owner names. The sans is tiny (11-12px) and used only for
  eyebrows, captions and buttons, so serif versus sans reads as voice versus label.
- **Shape:** 10-12px radii on pills and the menu button, a solid black menu button with two hairlines,
  grey `#f3f3f3` chips. No shadows, no borders.
- **Layout:** copy is centred or pinned to the 72px left margin; artworks are never framed or
  captioned decoratively, only with title (underlined), maker and an 10px grey source line.
- **Progress:** a vertical pill with dots; the active dot stretches to a 14px bar.

## Motion Spec

| What | Trigger | Animation | Duration / easing | Rebuild file |
|---|---|---|---|---|
| Smooth scroll | always | Lenis `{ lerp: .1 }` driven by `gsap.ticker`, `lagSmoothing(0)` | — | `src/scroll.js` |
| Floating artwork cards | scroll | each card drifts on its own scrubbed y offset (depth 0.8-1.5) | scrubbed | `src/cards.js` |
| Cursor parallax | pointer | image inside each card follows the cursor, amplitude = depth * 28px | 1.2s `power3.out` (quickTo) | `src/cards.js` |
| Card entrance | enters at 80% | scale .6 → 1 + opacity | 1.2s `power3.out`, stagger .06 | `src/cards.js` |
| Click an artwork | click | caption of the work appears in the bottom-right chip | instant | `src/cards.js` |
| Owner chapters | pinned 400vh | progress crosses i/N: owner names rise from a mask, artwork opens with `inset` clip-path, image scale 1.3 → 1, background tints | names 1s `power3.out`; frame 1.1s `power3.inOut`; bg 1.2s `power2.inOut` | `src/chapters.js` |
| Progress dots | scroll | only visible while the chapter section is active | .4s | `src/chapters.js` |
| Data sphere | scroll | 150 image planes assemble from scatter to a Fibonacci sphere over the first 35% of the section, then rotate one full turn; cursor tilts the group | scrubbed with lerp .08 | `src/sphere.js` |
| Menu | click | black panel opens with a circle `clip-path` from the button; links pop in | .8s `power3.out`; links `back.out(1.2)` | `src/menu.js` |
| Hero entrance | load | copy rises 40px and fades in | 1.2s `power3.out`, stagger .1 | `src/main.js` |

### Key excerpts

**Smooth scroll on the GSAP ticker**: `src/scroll.js`
```js
lenis = new Lenis({ lerp: 0.1, smoothWheel: true, autoRaf: false });
lenis.on('scroll', ScrollTrigger.update);
// ...
gsap.ticker.lagSmoothing(0);
gsap.ticker.add((t) => {
  if (lenis) lenis.raf(t * 1000);
  frame.forEach((fn) => fn(t));     // WebGL renders in the same tick
});
```

**Pinned owner chapters**: `src/chapters.js`
```js
ScrollTrigger.create({
  trigger: stage, start: 'top top', end: `+=${chapters.length * 100}%`, pin: true,
  onUpdate: (s) => show(Math.min(chapters.length - 1, Math.floor(s.progress * chapters.length))),
});
// ...
gsap.fromTo([lIn, rIn], { yPercent: 110 }, { yPercent: 0, duration: 1, ease: 'power3.out', stagger: 0.12 });
gsap.fromTo(frame, { clipPath: 'inset(100% 0% 0% 0%)' },
  { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power3.inOut' });
gsap.to(stage, { backgroundColor: c.tint, duration: 1.2, ease: 'power2.inOut' });
```
Scroll only selects the beat; the beat itself plays as a normal timed animation, so it never looks scrubbed or jittery.

**Floating cards with depth**: `src/cards.js`
```js
gsap.to(el, { y: (d - 1) * 260 - 40, ease: 'none',
  scrollTrigger: { trigger: host, start: 'top bottom', end: 'bottom top', scrub: true } });
const qx = gsap.quickTo(el.firstChild, 'x', { duration: 1.2, ease: 'power3.out' });
// ...
qx(-nx * d * 28);     // nx = cursor x in -0.5..0.5, d = card depth
```

**Image sphere with billboards**: `src/sphere.js`
```js
const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = i * 2.399963;   // Fibonacci sphere
// ...
inv.copy(group.quaternion).invert().multiply(cam.quaternion);   // planes always face the camera
m.position.lerpVectors(from, to, e);                            // e = eased assembly 0..1
m.material.opacity = (0.15 + 0.85 * THREE.MathUtils.smoothstep(wp.z, -2.3, 2.3)) * Math.min(1, e * 1.5);
```
Depth-based opacity keeps the back of the sphere as a ghost so the front images stay readable.

**Menu circle from the button**: `src/menu.js`
```js
const at = 'at calc(100% - 36px) 36px';        // centre of the menu button
gsap.to(menu, { clipPath: `circle(150% ${at})`, duration: 0.8, ease: 'power3.out' });
gsap.fromTo(links, { yPercent: 110, rotate: 4 },
  { yPercent: 0, rotate: 0, duration: 0.9, ease: 'back.out(1.2)', stagger: 0.07, delay: 0.25 });
```

`prefers-reduced-motion`: Lenis, entrances, clip-path reveals and the sphere's drift are disabled;
chapters still switch on scroll and content is simply visible.

## Why Award-Worthy

1. **The artworks are the interface.** No cards-with-shadows or UI frames: paintings float on white,
   so the cultural content, not the chrome, carries the page.
2. **A narrative, not a gallery.** Scatter → one painting's chain of owners → the whole network. Each
   scale change (one work, then thousands) is a different layout, so the story is felt through scroll.
3. **Restraint in colour and type.** White, one blue-grey, black; a single serif for every statement
   and a tiny sans for labels.
4. **Data as a physical object.** The sphere of thumbnails turns an abstract dataset into something you
   can orbit with the cursor, and it assembles from the scatter you just scrolled through.
5. **Click-to-learn, scroll-to-read.** Both interaction modes are always available and neither
   blocks the other.

**Anti-patterns it avoids:** no drop shadows, gradients or glass; no decorative frames; no carousel;
the WebGL layer is only used where it explains something (scale), not as a background.

## Credits

- Original: [getty.edu/tracingart](https://www.getty.edu/tracingart/) by **Resn**. Design and content are
  the intellectual property of their creators.
- Recognition: Awwwards Site of the Month (Jul 2025), Site of the Day, Developer Award.
- This study is an independent clean-room analysis. The rebuild uses a fictional archive, fictional
  works and owners, AI-generated images and open-source fonts; it contains no original code, assets or copy.
