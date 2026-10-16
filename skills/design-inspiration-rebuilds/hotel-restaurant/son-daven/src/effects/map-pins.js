/*
 * MAP PIN PROXIMITY. Pins within 240px of the cursor scale up to 1.5, falling off
 * linearly with distance: scale = 1 + 0.5 * max(0, 1 - d/240); 1.2s "Out" tween each,
 * reset on mouseleave.
 */
import { gsap, hasHover } from '../core/gsap.js';
import { $, $$ } from '../core/dom.js';

export function initMapPins() {
  const map = $('#map');
  if (!map || !hasHover) return;
  const pins = $$('.pin', map);
  map.addEventListener('pointermove', (e) => {
    pins.forEach((p) => {
      const r = p.getBoundingClientRect();
      const d = Math.hypot(e.clientX - (r.left + 6), e.clientY - (r.top + 6));
      gsap.to(p, { scale: 1 + 0.5 * Math.max(0, 1 - d / 240), duration: 1.2, ease: 'Out', overwrite: true });
    });
  });
  map.addEventListener('pointerleave', () => gsap.to(pins, { scale: 1, duration: 1.2, ease: 'Out', overwrite: true }));
}
