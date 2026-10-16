/* Technique: every painted scene is oversized by 4% (inset:-4%) and nudged opposite to the
   cursor, max +-1.6% of the viewport, 1.2s power3.out, giving the flat painting depth. */
import { gsap } from 'gsap';
import { reduced } from './scroll.js';

export function parallax(selector) {
  if (reduced) return;
  const bgs = [...document.querySelectorAll(selector)];
  const setters = bgs.map((b) => [gsap.quickTo(b, 'x', { duration: 1.2, ease: 'power3.out' }),
    gsap.quickTo(b, 'y', { duration: 1.2, ease: 'power3.out' })]);
  addEventListener('pointermove', (e) => {
    const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
    setters.forEach(([sx, sy]) => { sx(-nx * innerWidth * 0.032); sy(-ny * innerHeight * 0.032); });
  });
}
