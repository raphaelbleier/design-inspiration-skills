---
title: L.I.S.A
url: https://lisa.locomotive.ca/en
studio: Locomotive
awards: [SOTD, Developer Award]
year: 2026
category: experimental
techniques: [webgl, shader, 3d-character, conversational-ui, text-scramble, crt-effect, pointer-follow, sound]
stack: [three, gsap, vite, webaudio]
---

# L.I.S.A — clean-room study

An agency site where there is no site: the whole experience is a conversation with a 3D
character, a person with a CRT monitor for a head. One column of large type on the left, the
character on the right, a flat grey stage between them. Pages, menus and case studies are replaced
by a dialog tree: the assistant types a line, offers a handful of white pill buttons, and the
answer decides the next line. The monitor face, a glowing bar on a dark screen, acts as the "voice".

Rebuild: [`design-inspiration-rebuilds/experimental/lisa-locomotive`](https://github.com/raphaelbleier/design-inspiration-skills/tree/main/skills/design-inspiration-rebuilds/experimental/lisa-locomotive) (fictional content, generated images, open-source fonts; installed with the optional `design-inspiration-rebuilds` skill). Run it with `npm install && npm run dev`.

## Design Tokens

| Role | Value |
|---|---|
| Ink (type, back button, progress bar) | `#000` |
| Pill / surface | `#fff` |
| Stage centre → edge | `#e0e0e0` → `#bdbdbd` → `#8d8d8d` (radial, centred behind the text) |
| Ghost border (e-mail pill) | `rgba(0,0,0,.18)` |

```css
:root { --ink:#000; --white:#fff; --ease:cubic-bezier(.65,.05,0,1); --pad:40px; }
body { background: radial-gradient(ellipse 60% 70% at 38% 55%, #e0e0e0 0%, #bdbdbd 45%, #8d8d8d 100%); }
.dialog { font-size: 26px; line-height: 1.1; letter-spacing: -.01em; }
.chip { font-size: 13px; padding: 11px 18px; border-radius: 999px; background: #fff; }
```

- **Type:** one neo-grotesk (original: a licensed Helvetica-style display face; substitute: Inter Tight)
  at regular weight. Dialog 26px / 1.1, buttons 13px, header 26px. A single high-contrast serif
  (substitute: Instrument Serif) appears only as italic accent words inside a line.
- **Shape:** pills are full radius, the back button is a 40px black circle, everything else is
  square. No shadows, no borders except one hairline.
- **Layout:** text column fixed at the left (`left: 40px`, ~30vw), vertically centred; the head
  sits at about 70% of the width and is cropped by the bottom edge at the shoulders.
- **Progress:** a 4px black bar along the bottom edge grows with the dialog depth (`scaleX(--progress)`).

## Motion Spec

| What | Trigger | Animation | Duration / easing | Rebuild file |
|---|---|---|---|---|
| Decode typing | every message | characters resolve left to right behind a 6-glyph window of random symbols, block cursor blinks at the end | .022s per char (.6–2.4s), linear | `src/scramble.js` |
| Message stack | next message | previous line shrinks to scale .7, blur 4px, opacity .5; the one before disappears | .8s `cubic-bezier(.65,.05,0,1)` | `src/style.css` |
| Chips pop in | after last line | y 14 → 0, scale .9 → 1, opacity 0 → 1 | .5s `back.out(1.6)`, stagger .08 | `src/dialog.js` |
| Dialog tree + history | click | node graph with chips / name input / gallery, back button replays history | — | `src/flow.js`, `src/dialog.js` |
| CRT face | always | convex screen shader: stars, light bar sized by talk level, RGB split, scanlines, grain, barrel curve, vignette | continuous | `src/screen.js` |
| Step reaction | every step | head nods (elastic), screen glitch pulse, bar jumps to .9 and relaxes | .9s `elastic.out(1,.5)`; .45s; 2s `power2.out` | `src/scene.js` |
| Pointer follow | pointer move | head yaw ±.28 rad, pitch ±.12 rad, lerp .06 per frame | continuous | `src/scene.js` |
| Idle life | always | breathing bob (±.02), cable sway | sine | `src/scene.js` |
| Progress bar | step change | scaleX to the node's progress | 1s `cubic-bezier(.65,.05,0,1)` | `src/style.css` |
| Typing sound | toggle, off by default | 35ms square blip, 700–1100Hz, gain .03 per two characters | — | `src/sound.js` |

### Key excerpts

**Decode typing**: `src/scramble.js`
```js
const state = { n: 0 };
const dur = Math.min(2.4, Math.max(0.6, text.length * 0.022));
gsap.to(state, { n: text.length, duration: dur, ease: 'none',
  onUpdate() {
    const done = Math.floor(state.n);
    let out = text.slice(0, done);
    for (let i = done; i < Math.min(text.length, done + WINDOW); i++)
      out += text[i] === ' ' || text[i] === '\n' ? text[i] : rnd();   // noise trails the cursor
    el.textContent = out; el.append(cursor);
  },
  onComplete() { el.innerHTML = html; el.append(cursor); },            // restore <em>/<br> markup
});
```
The tween drives a number, not the DOM: one counter plus a 6-glyph noise window is the whole effect.

**Message stack**: `src/style.css`
```css
.msg { transition: filter .8s var(--ease), opacity .8s var(--ease), transform .8s var(--ease); }
.msg.is-past { filter: blur(4px); opacity: .5; transform: scale(.7); transform-origin: 0 100%; }
.msg.is-gone { display: none; }
.cursor { display: inline-block; width: .45em; height: .95em; background: var(--ink);
  animation: blink 1s steps(1) infinite; }
```
Only one line of history stays visible, so the column never scrolls and the eye stays on the cursor.

**Dialog graph**: `src/flow.js`
```js
project: { progress: 0.35,
  say: ['Ah, the sweet scent of collaboration.…', 'Alright, let’s not be strangers. What should I call the genius…?'],
  ask: 'p2' },
p2: { progress: 0.55, say: ['Pleasure, {name}. Tell me, what are we building?'],
  chips: [['A website', 'p3'], ['A product or app', 'p3'], …] },
```
Content is data: `say[]` is typed in order, then exactly one of `chips`, `ask` or `gallery` is rendered.

**CRT voice bar**: `src/screen.js`
```glsl
float len = .1 + uLevel * .62 + .03 * sin(uTime * 9.) * uLevel;
float bar = smoothstep(.022, .0, abs(uv.y - y)) * smoothstep(.07, .1, uv.x)
          * smoothstep(.1 + len + .05, .1 + len - .02, uv.x);
c += vec3(.75, .8, 1.) * bar + vec3(.3, .4, .9) * halo;
float s = .004 + uLevel * .01 + uGlitch * .02;                  // chromatic split grows with level
vec3 col = vec3(scene(uv + vec2(s, 0.)).r, scene(uv).g, scene(uv - vec2(s, 0.)).b);
```

**Reaction on every step**: `src/scene.js`
```js
gsap.fromTo(nod, { v: 0.14 }, { v: 0, duration: 0.9, ease: 'elastic.out(1,.5)', overwrite: true });
gsap.fromTo(u.uGlitch, { value: 1 }, { value: 0, duration: 0.45, ease: 'power2.out', overwrite: true });
gsap.fromTo(u.uLevel, { value: 0.9 }, { value: 0.12, duration: 2, ease: 'power2.out', overwrite: true });
```

`prefers-reduced-motion`: typing is instant, the head stops following the pointer and bobbing,
no nod or glitch, transitions collapse to ~0s.

## Why Award-Worthy

1. **The interface is the brand.** Instead of a navigation, the studio puts a character in the
   chair and lets visitors talk to it. Personality (jokes, tone) does the work a hero video would.
2. **One idea, tiny palette.** Grey stage, black type, white pills. The only colour is the blue-white
   glow on the monitor, so the face is always the focal point.
3. **Type as a living surface.** The decode-typing with a trailing noise window and a hard block
   cursor feels like a terminal, and ties directly to the monitor-head character.
4. **Character reacts to everything.** Pointer-follow, a nod and a glitch pulse on every step, a
   bar that grows with speech: small feedback loops that make a 3D asset feel present.
5. **Calm structure.** One line of history, one set of choices, a progress bar. A funnel hidden
   in a chat: the dialog collects intent, name and budget with almost no form UI.

**Anti-patterns it avoids:** no scroll-jacking (nothing scrolls); no menu maze; no cookie-cutter
chatbot bubbles; the WebGL layer is decoration plus feedback and never blocks input.

## Credits

- Original: [lisa.locomotive.ca](https://lisa.locomotive.ca/en) by **Locomotive**. Design, 3D
  character and content are the intellectual property of their creators.
- Recognition: Awwwards Site of the Day, Developer Award.
- This study is an independent clean-room analysis. The rebuild uses a fictional studio and
  assistant, a procedural character built in code, AI-generated images and open-source fonts; it
  contains no original code, assets or copy.
