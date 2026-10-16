// Technique: wavy rainbow bands = one path stroked 4 times (wide to narrow), each with an ink outline stroke beneath.
// Two bands (top-right, bottom-left) drift horizontally while the panel is on screen (scrub).
// Values: stroke widths 360/270/180/90 (units of a 1000x480 viewBox), outline +5; drift +-90 units.
import { gsap } from 'gsap';

const COLORS = ['#fb7230', '#f1bc10', '#f4a113', '#fb7230'];
const WIDTHS = [360, 270, 180, 90];
const NS = 'http://www.w3.org/2000/svg';

function band(g, d) {
  WIDTHS.forEach((w, i) => {
    [[w + 5, '#121212'], [w, COLORS[i]]].forEach(([sw, stroke]) => {
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('d', d); p.setAttribute('fill', 'none'); p.setAttribute('stroke', stroke);
      p.setAttribute('stroke-width', sw); g.appendChild(p);
    });
  });
}

export function initWaves(reduced) {
  band(document.querySelector('.w-a'), 'M620 -120 C 720 90, 900 90, 1120 40');
  band(document.querySelector('.w-b'), 'M-120 560 C 120 380, 360 560, 560 650');
  if (reduced) return;
  const st = { trigger: '.panel', start: 'top bottom', end: 'bottom top', scrub: true };
  gsap.fromTo('.w-a', { x: 90 }, { x: -90, ease: 'none', scrollTrigger: st });
  gsap.fromTo('.w-b', { x: -90 }, { x: 90, ease: 'none', scrollTrigger: st });
}
