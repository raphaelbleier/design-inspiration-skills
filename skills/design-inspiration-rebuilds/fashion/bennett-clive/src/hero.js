/**
 * hero.js - brand roll. One scrubbed float index f = progress * (N-1) over a 600vh track.
 * Technique: sticky 100vh stage; the current brand sits top-left in a one-line window and
 * rolls like an odometer (y = (i - f) * lineHeight); the upcoming brands stack right-aligned
 * under the fixed wordmark row and travel up one line per step (y = (i - f - 1) * lineHeight);
 * backgrounds cross-fade with opacity = 1 - min(1, |f - i|). Line height = 9.25vw * .77.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BRANDS } from './data.js';

export function initHero(reduced) {
  const root = document.querySelector('[data-hero]');
  const bgs = root.querySelector('[data-bgs]');
  const cur = root.querySelector('[data-cur]');
  const list = root.querySelector('[data-list]');
  const N = BRANDS.length;
  const layers = BRANDS.map((b) => {
    const d = document.createElement('div');
    d.innerHTML = `<img src="./img/${b.img}.webp" alt="" ${b === BRANDS[0] ? '' : 'loading="lazy"'}>`;
    bgs.append(d); return d;
  });
  const curs = BRANDS.map((b) => { const s = document.createElement('span'); s.textContent = b.name; cur.append(s); return s; });
  const items = BRANDS.map((b) => { const a = document.createElement('a'); a.href = '#work'; a.textContent = b.name; list.append(a); return a; });
  const lh = () => parseFloat(getComputedStyle(cur.firstChild).fontSize) * 0.77;

  const render = (f) => {
    const h = lh();
    for (let i = 0; i < N; i++) {
      layers[i].style.opacity = Math.max(0, 1 - Math.abs(f - i));
      curs[i].style.transform = `translateY(${(i - f) * h}px)`;
      items[i].style.transform = `translateY(${(i - f - 1) * h}px)`;
    }
  };
  render(0);
  if (reduced) { // no scrub: first brand plus static list
    return;
  }
  ScrollTrigger.create({
    trigger: root, start: 'top top', end: 'bottom bottom', scrub: true,
    onUpdate: (self) => render(self.progress * (N - 1)),
  });
  addEventListener('resize', () => render(ScrollTrigger.getAll()[0]?.progress * (N - 1) || 0));
}
