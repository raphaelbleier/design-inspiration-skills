/* CUSTOM CURSOR
   A 3px dot that lerps toward the pointer at 0.1 per frame (the original's H._position) and a
   12px label. Label text comes from the nearest [data-cursor] ancestor: its letters fade in
   over 0.8 s with stagger 0.4/length and out in 0.5 s. First-visit label: "Click to enable
   sound" (cleared by the sound toggle). Dot flips to #e8e8e8 over dark surfaces.
   Also writes state.mouse (normalised) which the relief flowmap and the light masks read, and
   --mx/--my CSS variables on [data-light] surfaces (footer, About: "the cursor is a light"). */
import { gsap } from 'gsap';
import { state } from './state.js';

let el, label, text = '', x = 0, y = 0, tx = 0, ty = 0, started = false;

export function setLabel(next) {
  if (next === text) return;
  text = next;
  gsap.killTweensOf(label.children);
  const old = [...label.children];
  if (old.length) gsap.to(old, { opacity: 0, duration: 0.5, onComplete: () => old.forEach((n) => n.remove()) });
  if (!next) return;
  const spans = [...next].map((c) => { const s = document.createElement('span'); s.textContent = c; s.style.opacity = 0; return s; });
  spans.forEach((s) => label.append(s));
  gsap.to(spans, { opacity: 1, duration: 0.8, stagger: 0.4 / spans.length, delay: old.length ? 0.15 : 0 });
}

export function initCursor() {
  el = document.getElementById('cursor'); label = el.querySelector('.cursor__label');
  if (!state.fine) return;
  addEventListener('pointermove', (e) => {
    tx = e.clientX; ty = e.clientY;
    state.mouse.x = tx / innerWidth; state.mouse.y = ty / innerHeight; state.mouse.px = tx; state.mouse.py = ty;
    if (!started) { x = tx; y = ty; started = true; }
    const host = e.target.closest?.('[data-cursor]');
    if (host) setLabel(host.dataset.cursor); else if (!window.__sound?.asked) setLabel('Click to enable sound'); else setLabel('');
    const light = e.target.closest?.('[data-light]');
    if (light) {
      const r = light.getBoundingClientRect();
      light.style.setProperty('--mx', `${e.clientX - r.left}px`); light.style.setProperty('--my', `${e.clientY - r.top}px`);
    }
    const dark = e.target.closest?.('.footer, #about, #popin, .media, .showreel__box');
    document.body.classList.toggle('cursor-light', !!dark);
  }, { passive: true });
  document.addEventListener('pointerleave', () => { el.style.opacity = 0; });
  document.addEventListener('pointerenter', () => { el.style.opacity = 1; });
  gsap.ticker.add((_, dtMs) => {
    const k = 1 - Math.pow(0.9, Math.min(dtMs / 16.67, 3));
    x += (tx - x) * k; y += (ty - y) * k;
    el.style.transform = `translate3d(${x}px,${y}px,0)`;
  });
  // [data-light] surfaces: wheel scrolling moves content under a still pointer, so refresh --my too
}
