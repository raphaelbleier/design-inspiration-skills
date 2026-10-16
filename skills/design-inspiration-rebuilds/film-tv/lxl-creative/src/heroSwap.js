// Technique: hero image swap. The card is a 3x2 invisible grid; the cell under the cursor decides
// which of six stacked images is visible (autoAlpha 0/1, no tween, an instant cut).
// Touch / coarse pointers cycle automatically every 1500ms. Values: cols 3, rows 2, cycle 1500.
import { gsap } from 'gsap';
import { reduced } from './scroll.js';

export function initHeroSwap() {
  const wrap = document.querySelector('[data-hero-swap]');
  const imgs = [...wrap.querySelectorAll('[data-hero-img]')];
  const COLS = 3, ROWS = 2;
  let cur = 0;
  gsap.set(imgs, { autoAlpha: (i) => (i === 0 ? 1 : 0) });
  const show = (i) => {
    i = Math.min(Math.max(i, 0), imgs.length - 1);
    if (i === cur) return;
    gsap.set(imgs[cur], { autoAlpha: 0 });
    gsap.set(imgs[i], { autoAlpha: 1 });
    cur = i;
  };
  if (reduced) return;
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    wrap.addEventListener('mousemove', (e) => {
      const r = wrap.getBoundingClientRect();
      const x = Math.min(COLS - 1, Math.floor(((e.clientX - r.left) / r.width) * COLS));
      const y = Math.min(ROWS - 1, Math.floor(((e.clientY - r.top) / r.height) * ROWS));
      show(y * COLS + x);
    });
  } else {
    setInterval(() => show((cur + 1) % imgs.length), 1500);
  }
}
