/* Looping can carousel state.
 * One unit of `pos` = one can. `target` snaps to integers; `pos` chases it with a frame-rate
 * independent damp (rate 7/s). Drag: 1 can per (viewport width / 4.2) px. Index = round(target) mod 6. */
import { FLAVORS } from './flavors.js';

const N = FLAVORS.length;
export const carousel = { pos: 0, target: 0, index: 0 };
const listeners = [];
export const onIndex = (fn) => listeners.push(fn);
export const wrap = (v, n = N) => ((v % n) + n) % n;

export function goTo(i) {          // nearest way round the loop
  const cur = Math.round(carousel.target);
  let d = wrap(i - cur + N / 2) - N / 2;
  carousel.target = cur + Math.round(d);
}
const step = (d) => { carousel.target = Math.round(carousel.target) + d; };

export function updateCarousel(dt) {
  carousel.pos += (carousel.target - carousel.pos) * (1 - Math.exp(-dt * 7));
  const idx = wrap(Math.round(carousel.target));
  if (idx !== carousel.index) { carousel.index = idx; listeners.forEach((f) => f(idx)); }
}

export function initCarousel() {
  document.getElementById('prev').addEventListener('click', () => step(-1));
  document.getElementById('next').addEventListener('click', () => step(1));
  addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
  let down = null;
  const inHero = () => scrollY < innerHeight * 0.5;
  addEventListener('pointerdown', (e) => {
    if (!inHero() || e.target.closest('button,a')) return;
    down = { x: e.clientX, t: carousel.target };
  });
  addEventListener('pointermove', (e) => {
    if (down) carousel.target = down.t - (e.clientX - down.x) / (innerWidth / 4.2);
  });
  const end = () => { if (down) { carousel.target = Math.round(carousel.target); down = null; } };
  addEventListener('pointerup', end);
  addEventListener('pointercancel', end);
}
