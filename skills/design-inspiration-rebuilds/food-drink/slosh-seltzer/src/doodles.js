/**
 * doodles.js - scatter small hand-drawn SVG marks (star, bolt, smiley, squiggle, dot) over a layer.
 * Seeded by index so layout is stable. Each bobs/rotates on its own loop (sine.inOut, 2-4s).
 */
import gsap from 'gsap';
import { reduced } from './state.js';

const ids = ['d-star', 'd-bolt', 'd-smile', 'd-squig', 'd-star', 'd-dot', 'd-bolt'];
const rnd = (i, k) => { const x = Math.sin(i * 91.7 + k * 17.3) * 43758.5453; return x - Math.floor(x); };

export function initDoodles() {
  document.querySelectorAll('[data-dood]').forEach((layer, li) => {
    const n = +layer.dataset.dood;
    for (let i = 0; i < n; i++) {
      const id = ids[Math.floor(rnd(i + li * 9, 1) * ids.length)];
      const el = document.createElement('div'); el.className = 'dood';
      const sz = id === 'd-squig' ? 56 + rnd(i, 5) * 40 : 14 + rnd(i + li, 2) * 26;
      const left = 3 + rnd(i + li * 3, 3) * 92, top = 4 + rnd(i + li * 5, 4) * 88;
      Object.assign(el.style, { left: left + '%', top: top + '%', width: sz + 'px', height: id === 'd-squig' ? sz / 2 + 'px' : sz + 'px', '--c': layer.dataset.ink });
      el.innerHTML = `<svg viewBox="0 0 ${id === 'd-squig' ? '48 24' : '24 24'}"><use href="#${id}"/></svg>`;
      layer.appendChild(el);
      if (!reduced) gsap.to(el, { y: (rnd(i, 6) - 0.5) * 24, rotate: (rnd(i, 7) - 0.5) * 50, duration: 2 + rnd(i, 8) * 2, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    }
  });
}
