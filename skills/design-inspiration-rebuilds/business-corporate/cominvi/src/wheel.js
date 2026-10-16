// Technique: partner "wheel". A sticky stage; scroll progress moves a float index along a vertical list.
// Each name's scale/opacity/y derive from its distance d to the index: scale 1 - .22|d|, opacity 1 - .62|d|,
// y = d * 105px (compressing toward the edges). Active name sits at the centre in #151515.
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reduced } from './scroll.js';
const P = ['Northmere Metals', 'Calder Ridge', 'Auric Basin', 'Velden Mineral Co.', 'Stonehaven', 'Harrow Mining', 'Ostra Silver', 'Pinecrest Ore', 'Meridian Gold', 'Ironvale', 'Lowfell Resources', 'Brandt Copper'];
export function initWheel() {
  const tr = document.querySelector('.wheel-track');
  const els = P.map((n) => { const s = document.createElement('span'); s.textContent = n; tr.append(s); return s; });
  const render = (idx) => els.forEach((e, i) => {
    const d = i - idx, a = Math.abs(d);
    const y = Math.sign(d) * (Math.min(a, 1) * 105 + Math.max(a - 1, 0) * 60);
    e.style.fontSize = '4rem';
    e.style.transform = `translateY(calc(-50% + ${y}px)) scale(${Math.max(0.35, 1 - 0.22 * a)})`;
    e.style.opacity = Math.max(0, 1 - 0.62 * a);
  });
  render(0);
  if (reduced) return;
  ScrollTrigger.create({ trigger: '.partners', start: 'top top', end: 'bottom bottom', onUpdate: (s) => render(s.progress * (P.length - 1)) });
}
