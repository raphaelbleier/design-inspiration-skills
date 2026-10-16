/*
 * EDGE BARS: the vector cousin of the halftone, used on the top edge of the CTA photo.
 * 240 downward triangles (a comb) under a solid band, heights from a sum of sines so the
 * silhouette reads like a tree line. Scrubbed: heights grow from 40% to 100% while the
 * section enters, so the ink "drips" and then recedes behind the photo.
 */
import { gsap, reduced } from '../core/gsap.js';
import { $ } from '../core/dom.js';

export function initEdgeBars() {
  const svg = $('#edge');
  const N = 240;
  svg.setAttribute('viewBox', `0 0 ${N} 100`);
  let d = '', ns = 'http://www.w3.org/2000/svg';
  const g = document.createElementNS(ns, 'g');
  const band = document.createElementNS(ns, 'rect');
  band.setAttribute('width', N); band.setAttribute('height', 8); band.setAttribute('y', -1);
  g.appendChild(band);
  for (let i = 0; i < N; i++) {
    const h = 30 + 28 * Math.sin(i * 0.09 + 1) + 18 * Math.sin(i * 0.31) + 10 * Math.sin(i * 0.77 + 2) + (i % 3) * 3 + 28 * Math.sin(i * 0.027);
    const t = document.createElementNS(ns, 'path');
    t.setAttribute('d', `M${i} 7 L${i + 1} 7 L${i + 0.5} ${7 + Math.max(4, Math.min(90, h))} Z`);
    t.style.transformOrigin = `${i + 0.5}px 7px`;
    g.appendChild(t);
  }
  svg.appendChild(g);
  if (reduced) return;
  gsap.fromTo(g.querySelectorAll('path'), { scaleY: 0.4 }, { scaleY: 1, ease: 'none', stagger: { each: 0.002 }, scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'top 25%', scrub: true } });
}
