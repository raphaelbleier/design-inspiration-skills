/**
 * Loader: a hand-drawn envelope that flickers through 8 frames + "LOADING" in caps on #fff.
 * Technique: 8 <g> frames, each with `visibility:hidden` and a 1s infinite animation that is visible for 1/8 of the
 * cycle, delayed by i*0.125s (see .lf in style.css). Each frame is the same envelope with every vertex
 * jittered +-1.6px (seeded), stroke #222 2px, 90x90 box. Shown before the intro and between intro and game.
 */
import { mulberry32 } from './stepped.js';
import { gsap } from './ease.js';

const el = document.getElementById('loader');
const rnd = mulberry32(7);
const J = (v) => (v + (rnd() * 2 - 1) * 1.6).toFixed(1);

function frame(i) {
  const p = (x, y) => `${J(x)},${J(y)}`;
  const body = `M${p(14, 28)} L${p(76, 26)} L${p(77, 64)} L${p(13, 65)} Z`;
  const flap = `M${p(14, 28)} L${p(45, 50)} L${p(76, 26)}`;
  return `<g class="lf" style="animation-delay:${i * 0.125}s"><path d="${body}"/><path d="${flap}"/></g>`;
}
el.querySelector('svg').innerHTML = Array.from({ length: 8 }, (_, i) => frame(i)).join('');

export const loader = {
  show(instant) {
    el.style.display = 'flex';
    gsap.killTweensOf(el);
    gsap.to(el, { opacity: 1, duration: instant ? 0 : 0.2, ease: 'none' });
  },
  hide(delay = 0) {
    gsap.to(el, { opacity: 0, duration: 0.3, delay, ease: 'none', onComplete: () => (el.style.display = 'none') });
  },
};
