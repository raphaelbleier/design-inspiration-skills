/* 6px orange square follows the pointer with a quickTo lag of .15s (power3). Hidden on touch via CSS. */
import { gsap } from 'gsap';

export function initCursor() {
  const el = document.getElementById('cursor');
  const x = gsap.quickTo(el, 'x', { duration: 0.15, ease: 'power3' });
  const y = gsap.quickTo(el, 'y', { duration: 0.15, ease: 'power3' });
  addEventListener('pointermove', (e) => { x(e.clientX); y(e.clientY); });
}
