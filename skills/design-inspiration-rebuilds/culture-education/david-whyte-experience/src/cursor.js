/* Technique: 3.4rem hairline ring follows the pointer with quickTo (.5s power3), centre dot is the ring's child.
   Ring scales to 1.6 over buttons and links. Fine pointers only (CSS hides it otherwise). */
import gsap from 'gsap';

export function initCursor() {
  const el = document.querySelector('.cursor');
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const x = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' });
  const y = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' });
  addEventListener('pointermove', (e) => { x(e.clientX); y(e.clientY); });
  document.querySelectorAll('a, button').forEach((n) => {
    n.addEventListener('pointerenter', () => gsap.to(el, { scale: 1.6, duration: 0.4 }));
    n.addEventListener('pointerleave', () => gsap.to(el, { scale: 1, duration: 0.4 }));
  });
}
