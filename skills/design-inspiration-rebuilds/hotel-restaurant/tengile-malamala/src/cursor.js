/**
 * cursor.js - label pill that follows the pointer over [data-cursor] areas ("Play Video", "Next", "Prev").
 * Technique: gsap.quickTo x/y, duration .45, ease power3.out; opacity toggled by class.
 * On the gallery the label flips to "Prev" in the left half of the frame.
 */
import gsap from 'gsap';

export function initCursor() {
  const c = document.getElementById('cursor');
  const label = document.getElementById('cursorLabel');
  if (!matchMedia('(hover: hover)').matches) return;
  const x = gsap.quickTo(c, 'x', { duration: 0.45, ease: 'power3.out' });
  const y = gsap.quickTo(c, 'y', { duration: 0.45, ease: 'power3.out' });
  window.addEventListener('pointermove', (e) => { x(e.clientX); y(e.clientY); });
  document.querySelectorAll('[data-cursor]').forEach((el) => {
    el.addEventListener('pointerenter', () => { label.textContent = el.dataset.cursor; c.classList.add('is-on'); });
    el.addEventListener('pointerleave', () => c.classList.remove('is-on'));
    if (el.id === 'galFrame') el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      label.textContent = e.clientX - r.left < r.width / 2 ? 'Prev' : 'Next';
    });
  });
}
