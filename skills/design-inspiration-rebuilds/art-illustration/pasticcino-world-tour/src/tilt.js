/* Technique: paper cards follow the cursor with a small 2D tilt (rotation + drift) so flat
   illustrated cards feel hand-held. Values: rotation +-2.2deg, drift +-14px, 0.9s power3.out. */
import { gsap } from 'gsap';
import { reduced } from './scroll.js';

export function tilt(el, base = -1.4) {
  gsap.set(el, { rotation: base });
  if (reduced) return;
  const rot = gsap.quickTo(el, 'rotation', { duration: 0.9, ease: 'power3.out' });
  const x = gsap.quickTo(el, 'x', { duration: 0.9, ease: 'power3.out' });
  const y = gsap.quickTo(el, 'y', { duration: 0.9, ease: 'power3.out' });
  addEventListener('pointermove', (e) => {
    const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
    rot(base + nx * 4.4); x(nx * 28); y(ny * 28);
  });
}
