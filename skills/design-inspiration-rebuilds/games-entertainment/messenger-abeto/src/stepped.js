/**
 * Hand-drawn, stop-motion UI helpers (the "boil").
 *
 * Every panel in the original is a polygon whose vertices are re-jittered each animation step, with a hard
 * un-blurred offset shadow (#647A87, 5.5px, 5.5px) and a dark ink outline. In CSS:
 *  - .ink-panel (wrapper)  : filter = drop-shadow(5.5px 5.5px 0 shadow) + 4 x drop-shadow(+-1.5px 0 ink)
 *                            -> hard shadow plus outline that hugs whatever clip-path the child has.
 *  - .face (child)         : clip-path polygon from wobblePoly(), re-seeded in steps.
 * Pop-in is quantised: scale = floor(u*4)/4 over 0.35s with ease 'none', and the polygon re-jitters each step.
 */
import { gsap, REDUCED } from './ease.js';

export function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 10-point polygon (corners + edge midpoints), each point moved by up to +-amp px. */
export function wobblePoly(amp = 1.3, rnd = Math.random) {
  const j = () => ((rnd() * 2 - 1) * amp).toFixed(2) + 'px';
  const pts = [[0, 0], [33, 0], [66, 0], [100, 0], [100, 50], [100, 100], [66, 100], [33, 100], [0, 100], [0, 50]];
  return 'polygon(' + pts.map(([x, y]) => `calc(${x}% + ${j()}) calc(${y}% + ${j()})`).join(',') + ')';
}

const boiled = new Map();
/** Re-seed the clip-path of every `.face` inside `root` ~7x per second (reduced motion: once). */
export function boil(el, amp = 1.3) {
  const faces = el.matches('.face') ? [el] : [...el.querySelectorAll('.face')];
  faces.forEach((f) => { f.style.clipPath = wobblePoly(amp); boiled.set(f, amp); });
}
let last = 0;
gsap.ticker.add((time) => {
  if (REDUCED || time - last < 0.14) return;
  last = time;
  boiled.forEach((amp, f) => { if (f.isConnected) f.style.clipPath = wobblePoly(amp); else boiled.delete(f); });
});

/** Quantised pop in/out: 4 steps in 0.35s (in) / 0.05s (out). */
export function pop(el, show, done) {
  const o = { u: show ? 0 : 1 };
  el.style.display = 'block';
  gsap.to(o, {
    u: show ? 1 : 0, duration: show ? 0.35 : 0.05, ease: 'none',
    onUpdate() {
      const q = Math.floor(o.u * 4) / 4;
      el.style.transform = `scale(${q})`;
      el.style.opacity = q ? 1 : 0;
    },
    onComplete() {
      el.style.transform = show ? 'none' : 'scale(0)';
      if (!show) el.style.display = 'none';
      done && done();
    },
  });
}
