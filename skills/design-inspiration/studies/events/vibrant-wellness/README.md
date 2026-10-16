---
title: Vibrant Wellness
url: https://vibrant.noomoagency.com/
studio: Noomo Agency
awards: [SOTD, Developer Award]
year: 2026
category: events
techniques: [webgl, iridescent-material, camera-tween, text-reveal, glass-ui, particles]
stack: [three, gsap, nuxt, tailwind]
---

# Vibrant Wellness — clean-room study

A single-screen health-testing experience. No page scroll at all: a translucent, iridescent
**human figure** floats in a lavender sky of drifting bubbles, a glass pill switches the body between
female and male, and "Start Experience" sends the camera into the figure to browse seven test
categories (neurology, cardiovascular, toxins, gut, hormones, genetics, longevity). Everything else
is frosted-glass chrome in one saturated blue.

Rebuild: [`design-inspiration-rebuilds/events/vibrant-wellness`](https://github.com/raphaelbleier/design-inspiration-skills/tree/main/skills/design-inspiration-rebuilds/events/vibrant-wellness) (fictional content, generated images, open-source fonts; installed with the optional `design-inspiration-rebuilds` skill). Run it with `npm install && npm run dev`.

## Design Tokens

| Role | Value |
|---|---|
| Sky (page, radial) | `#d6c8f5` to `#c4b0ee` |
| Blue (toggle thumb, CTA text, test chips) | `#0774c4` |
| Ink (labels, category names) | `#282f3c` |
| White (hero type, CTA) | `#ffffff` |
| Glass (pills, panels) | `rgba(255,255,255,.28)` + 1px `rgba(255,255,255,.55)` border + `blur(10px)` |

```css
:root {
  --sky-1: #d6c8f5; --sky-2: #c4b0ee; --blue: #0774c4; --ink: #282f3c;
  --glass: rgba(255,255,255,.28); --glass-line: rgba(255,255,255,.55);
  --ease: cubic-bezier(.22, 1, .36, 1);
}
body { background: radial-gradient(120% 90% at 50% 20%, var(--sky-1), var(--sky-2)); }
```

- **Type:** a geometric sans (original: Plus Jakarta Sans, free on Google Fonts) in weight 300 at
  ~88px for the hero title, 600 for category names (26px). Every label, button and tag is a bold
  monospace (original: Ubuntu Mono Bold) in uppercase with `letter-spacing: .14em`, 13px.
- **Shape:** everything is a pill (`border-radius: 999px`) or a 24px glass card. No hard shadows;
  depth comes from blur, translucency and the 3D figure.
- **Canvas:** a transparent WebGL canvas over the CSS gradient, so the UI colours never depend on
  the renderer.

## Motion Spec

| What | Trigger | Animation | Duration / easing | Rebuild file |
|---|---|---|---|---|
| Glass figure | load, cursor | iridescent physical material, eased yaw follows the cursor (`.05` lerp) plus a slow sine sway | continuous | `src/scene.js` |
| Bubbles | always | 70 instanced spheres rise with a sine wobble and wrap in y | continuous | `src/scene.js` |
| Figure rises | load | figure glides up from below the fold | 2.2s `power3.out` | `src/hero.js` |
| Title letters | load | per-letter spans rise from `yPercent: 110` inside a clipped line | 1.1s `back.out(1.4)`, stagger .035 | `src/hero.js` |
| CTA pulse | always | outer ring scales 1 → 1.22 while fading | 2.4s ease-out loop | `src/style.css` |
| Female/Male toggle | click | blue thumb slides to the active button; torso mesh morphs by re-generating the lathe each frame | thumb .5s `expo.out`, morph 1s `power2.inOut` | `src/toggle.js` |
| Start experience | click | camera proxy tweens to a wider framing, hero fades, panel rises | 1.6s `power3.inOut` | `src/explore.js` |
| Category change | click, arrows | camera flies to the organ; DOM ring is projected onto it every frame; name slides in a clipped window | camera 1.4s `power3.inOut`, name .7s `expo.out` | `src/explore.js` |
| Sound pill | click | label swaps, equaliser dots animate (visual only) | 1s alternate loop | `src/main.js` |

### Key excerpts

**Iridescent glass material**: `src/scene.js`
```js
const glass = new THREE.MeshPhysicalMaterial({
  color: 0xbfaaf0, roughness: 0.18, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.08,
  iridescence: 1, iridescenceIOR: 2.0, iridescenceThicknessRange: [300, 900],
});
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.8;   // iridescence needs an environment to reflect
```

**Body morph by regenerating a lathe**: `src/scene.js`
```js
// radius profile per height: [y, female r, male r]
const PROFILE = [[0, .62, .58], [.5, .56, .52], [.9, .42, .5], /* ... */ [2.2, .7, .9], [2.38, .5, .62]];
function lathe(t) {
  const pts = PROFILE.map(([y, f, m]) => new THREE.Vector2(f + (m - f) * t, y));
  return new THREE.LatheGeometry(pts, 48);
}
// ...
torso.geometry.dispose(); torso.geometry = lathe(state.sex);   // called from the gsap onUpdate
```

**Sex toggle drives geometry and thumb together**: `src/toggle.js`
```js
const set = { x: b.offsetLeft - 6, width: b.offsetWidth, duration: .5, ease: 'expo.out' };
gsap.to(thumb, set);
const to = b.dataset.sex === 'male' ? 1 : 0;
gsap.to(state, { sex: to, duration: 1, ease: 'power2.inOut', onUpdate: applySex });
```

**Camera as a tweened proxy**: `src/explore.js`
```js
const pos = near ? new THREE.Vector3(w.x * 0.4, w.y + 0.2, c.zoom) : WIDE.pos.clone().setZ(c.zoom + 1.3);
const look = near ? new THREE.Vector3(w.x, w.y - 0.55, 0) : WIDE.look;   // look below the organ: it sits in the upper half
gsap.to(view.pos, { x: pos.x, y: pos.y, z: pos.z, duration: 1.4, ease: 'power3.inOut', overwrite: true });
gsap.to(view.look, { x: look.x, y: look.y, z: look.z, duration: 1.4, ease: 'power3.inOut', overwrite: true });
```

**DOM hotspot pinned to a 3D point**: `src/scene.js`
```js
export function project(local) {
  const v = body.localToWorld(local.clone()).project(camera);
  return { x: (v.x * .5 + .5) * innerWidth, y: (-v.y * .5 + .5) * innerHeight, front: v.z < 1 };
}
```

`prefers-reduced-motion`: bubbles and cursor sway stop, tweens run with zero duration, the pulse and
equaliser animations are disabled.

## Why Award-Worthy

1. **One object carries the whole site.** The glass figure is hero, navigation and data map at once;
   categories are places on a body, not links in a menu.
2. **No scroll, no clutter.** The page is one viewport. All structure comes from camera moves, which
   keeps the experience feeling like a product demo rather than a page.
3. **Restrained palette.** Lavender sky, white type and exactly one blue. The iridescent material
   supplies all the extra colour.
4. **Glass UI that matches the 3D.** Pills with blur and a white hairline echo the translucent figure,
   so chrome and scene look like the same material.
5. **Mono labels against a soft sans.** The uppercase monospace tags add a clinical, data-driven tone
   to otherwise gentle type.

**Anti-patterns it avoids:** no scroll-jacking, no loading-bar wall before the first interaction, no
hard drop shadows, no carousel of stock photos; the canvas never blocks the UI (DOM sits above it).

## Credits

- Original: [vibrant.noomoagency.com](https://vibrant.noomoagency.com/) by **Noomo Agency**. Design and
  content are the intellectual property of their creators.
- Recognition: Awwwards Site of the Day, Developer Award.
- This study is an independent clean-room analysis. The rebuild uses a fictional health brand,
  AI-generated images and open-source fonts; it contains no original code, assets or copy.
