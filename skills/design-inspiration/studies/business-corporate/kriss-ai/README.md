---
title: Kriss.ai
url: https://kriss.ai/
studio: Studio 28K
awards: [SOTM Oct 2024, SOTD, Developer Award]
year: 2024
category: business-corporate
techniques: [webgl, virtual-scroll, camera-path, hotspots, typewriter, 3d-illustration, chat-widget]
stack: [three, gsap]
---

# Kriss.ai — clean-room study

A product site for an AI chatbot aimed at clinics, told as a **single non-scrolling stage**: an
isometric cutaway building in soft clay 3D floats on a mauve gradient among puffy clouds, and the
visitor's wheel input flies the camera down through its floors. Every section (Home, Setup, Plans,
About, FAQ) is a floor; HTML copy fades in beside it. The product itself lives in the bottom-right
corner as a chat widget that nudges with a speech bubble from the first second.

Rebuild: [`design-inspiration-rebuilds/business-corporate/kriss-ai`](https://github.com/raphaelbleier/design-inspiration-skills/tree/main/skills/design-inspiration-rebuilds/business-corporate/kriss-ai) (fictional content, generated images, open-source fonts; installed with the optional `design-inspiration-rebuilds` skill). Run it with `npm install && npm run dev`.

## Design Tokens

| Role | Value |
|---|---|
| Sky gradient top | `#d9d0d2` |
| Sky gradient bottom | `#b79fa8` |
| Ink (headline, CTA fill) | `#0d0d0f` |
| White (brackets, logo, hotspots) | `#ffffff` |
| Frame line | `rgba(255,255,255,.55)` |
| Glass fill | `rgba(255,255,255,.28)` |
| Scene pastels | lilac `#b9a6e0`, peach `#f2bb9b`, periwinkle `#8fa7e6`, mint `#9fd3b0` |

```css
:root {
  --ink: #0d0d0f; --mauve-top: #d9d0d2; --mauve-bot: #b79fa8;
  --line: rgba(255,255,255,.55); --glass: rgba(255,255,255,.28);
}
body { background: linear-gradient(var(--mauve-top), var(--mauve-bot)); }
```

- **Type:** one humanist grotesk (original: a custom face; substitute: Figtree) at weights 400-700.
  Hero headline ~76px bold, tight tracking (`-.02em`), sub-line ~26px regular, UI 14px medium.
- **Bracket frames:** every interactive block (nav, buttons, chat button) has a 1px translucent
  outline plus two thick white corner brackets (top-left, bottom-right). This is the identity,
  stronger than any logo, and it costs two pseudo-elements.
- **Shape:** radii 6-16px, no shadows on the page chrome; depth lives in the 3D scene only.
- Typography stays black on the pastel sky; white is reserved for line work and hotspots.

## Motion Spec

| What | Trigger | Animation | Duration / easing | Rebuild file |
|---|---|---|---|---|
| Virtual scroll | wheel / touch / arrow keys | no native scroll; a 0..4 stage value moves by `0.0018`/px wheel, `0.004`/px touch, eases toward its target, snaps to the next stage 120ms after input stops | `1 - exp(-dt * 5)` | `src/scroll.js` |
| Camera flight | stage value | one keyframe per section (look-at x, y, distance), smoothstep between neighbours; building shifts right so copy sits left | continuous | `src/stage.js` |
| Cutaway clinic | always | rounded-box rooms, tiny capsule people, round windows, cabinets; roof slab caps the top floor | static | `src/stage.js` |
| Clouds | always | spheres merged into puffs, each bobbing `±0.18` on a sine | `0.6` rad/s | `src/stage.js` |
| Hotspots | always, click | world points projected to screen every frame; white pulsing dot, filled black for the active floor; click jumps to that stage | ping 2.4s | `src/main.js` |
| Panel crossfade | stage value | opacity `1 - |d| * 1.8`, drift `36px` per stage of distance | scrubbed | `src/main.js` |
| Typewriter | always | types 55ms/char, holds 1.6s, deletes 28ms/char, next phrase; used for the audience word and the intro line | — | `src/typewriter.js` |
| Chat widget | load, click | speech bubble above a framed button; click opens a panel with keyword replies | .3s | `src/chat.js` |
| Entrance | load | nav and hero lines rise 20px and fade in | 1s `power3.out`, stagger .08 | `src/main.js` |

### Key excerpts

**Virtual scroll with directional snap**: `src/scroll.js`
```js
function settle() {
  const d = target - base;
  base = d > 0.05 ? Math.min(STAGES - 1, base + 1) : d < -0.05 ? Math.max(0, base - 1) : base;
  target = base;
}
function push(delta) {
  target = clamp(target + delta);
  clearTimeout(idle); idle = setTimeout(settle, 120);
}
// ...
cur = reduce ? target : cur + (target - cur) * (1 - Math.exp(-dt * 5));
```
One notch of the wheel is enough to advance a full floor, because the snap follows the direction
of travel instead of rounding.

**Camera keyframes**: `src/stage.js`
```js
const KD = [[0, 9.5, 16], [-1.3, 5.9, 14.5], [-1.3, 3.5, 14.5], [-1.3, 1.2, 14.5], [-2.8, 3.8, 19]];
const dir = new THREE.Vector3(0.5, 0.12, 1).normalize();   // low, slightly right: sees into the rooms
// ...
const i = Math.min(Math.floor(t), k.length - 2), f = ease(Math.min(1, Math.max(0, t - i)));
look.set(lx, ly, 0);
camera.position.copy(look).addScaledVector(dir, dist);
camera.lookAt(look);
```
Hero looks well above the roof so the building sits in the lower third; each section then looks
at its floor, with the look-at x pushed left so the model lands on the right half.

**Hotspots projected from world space**: `src/stage.js`
```js
return spots.map((p) => {
  const v = p.clone().project(camera);
  return [(v.x * 0.5 + 0.5) * innerWidth, (-v.y * 0.5 + 0.5) * innerHeight];
});
```
The DOM buttons are positioned from these every frame, so they ride the camera move.

**Bracket frame**: `src/style.css`
```css
.frame { position: relative; border: 1px solid var(--line); border-radius: 14px; }
.frame::before, .frame::after { content: ''; position: absolute; width: 20px; height: 20px;
  border: 4px solid #fff; pointer-events: none; }
.frame::before { top: -2px; left: -2px; border-right: 0; border-bottom: 0; border-top-left-radius: 14px; }
.frame::after { bottom: -2px; right: -2px; border-left: 0; border-top: 0; border-bottom-right-radius: 14px; }
```

`prefers-reduced-motion`: the stage value jumps instead of easing, clouds stop bobbing, the
typewriter shows a static phrase and pulsing is off.

## Why Award-Worthy

1. **The whole site is one object.** No page ever scrolls; the camera moves through a single
   miniature building and each floor is a section. Navigation, story and brand are the same thing.
2. **A product that is also the metaphor.** A clinic you can see into, with tiny staff, says
   "reception" in one glance, and the chat widget is present from the first frame.
3. **Restraint in colour.** A single mauve gradient, black ink and white line work; all saturation
   is spent inside the 3D model, so it reads as the hero.
4. **Corner brackets as brand.** Two thick corners on a hairline box recur on nav, buttons and the
   chat launcher, giving UI a viewfinder look with almost no CSS.
5. **Soft, tactile 3D.** Rounded boxes, matte clay materials and cloud puffs keep a medical topic
   friendly rather than clinical.

**Anti-patterns it avoids:** no scroll-jacking fights (wheel is the only scroll and it always
lands on a section); no stock photography in the hero; no carousel of logos; no cookie-style
pop-ups competing with the chat bubble.

## Credits

- Original: [kriss.ai](https://kriss.ai/) by **Studio 28K**. Design and content are the
  intellectual property of their creators.
- Recognition: Awwwards Site of the Month (Oct 2024), Site of the Day, Developer Award.
- This study is an independent clean-room analysis. The rebuild uses a fictional product, AI-generated
  images and open-source fonts; it contains no original code, assets or copy.
