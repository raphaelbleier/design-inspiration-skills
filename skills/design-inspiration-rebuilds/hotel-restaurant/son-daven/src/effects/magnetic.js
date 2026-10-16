/*
 * MAGNETIC BUTTONS ([data-magnetic="<strength>"], >= 992px, hover devices).
 * Offset  x = ((mouseX / width) - 0.5) * (strength / 16)  in em, same for y,
 * tweened with power4.out over 1.6s. The inner pill follows over 2s at half the
 * distance (a parallax between shell and label). On leave: elastic.out(1, 0.3) over
 * 1.6s, then clearProps so no transform is left behind.
 */
import { gsap, hasHover, isDesktop } from '../core/gsap.js';
import { $$ } from '../core/dom.js';

export function initMagnetic() {
  if (!hasHover) return;
  $$('[data-magnetic]').forEach((el) => {
    const k = parseFloat(el.dataset.magnetic) / 16;
    const inner = el.querySelector('.btn_in, span');
    el.addEventListener('pointermove', (e) => {
      if (!isDesktop()) return;
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * k;
      const y = ((e.clientY - r.top) / r.height - 0.5) * k;
      gsap.to(el, { x: x + 'em', y: y + 'em', duration: 1.6, ease: 'power4.out', overwrite: true });
      inner && gsap.to(inner, { x: x * 0.5 + 'em', y: y * 0.5 + 'em', duration: 2, ease: 'power4.out', overwrite: true });
    });
    el.addEventListener('pointerleave', () => {
      gsap.to([el, inner].filter(Boolean), { x: 0, y: 0, duration: 1.6, ease: 'elastic.out(1, 0.3)', clearProps: 'all', overwrite: true });
    });
  });
}
