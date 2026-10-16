/**
 * huge.js - giant section headings. Each line is an overflow:hidden mask; the inner <i> rises
 * yPercent 105 -> 0, 1.2s power4.out, stagger .1, fired once at top 80%.
 * Plus a gentle scrubbed x-drift on alternating lines (+-3vw) so the type never sits still.
 */
import gsap from 'gsap';
import { reduced } from './scroll.js';

export function hugeText() {
  if (reduced) return;
  document.querySelectorAll('[data-huge]').forEach((h) => {
    const lines = h.querySelectorAll('.ln i');
    gsap.from(lines, { yPercent: 105, duration: 1.2, ease: 'power4.out', stagger: 0.1,
      scrollTrigger: { trigger: h, start: 'top 80%', once: true } });
    lines.forEach((l, i) => gsap.fromTo(l, { x: (i % 2 ? 1 : -1) * innerWidth * 0.03 }, { x: (i % 2 ? -1 : 1) * innerWidth * 0.03, ease: 'none',
      scrollTrigger: { trigger: h, start: 'top bottom', end: 'bottom top', scrub: true } }));
  });
}
