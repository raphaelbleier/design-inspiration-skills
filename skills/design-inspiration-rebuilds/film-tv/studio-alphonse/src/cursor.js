// Cursor label. Technique: a small label follows the pointer (quickTo power3) and shows the text of the
// nearest [data-cursor] ancestor. Flips to the left in the right-most 10% of the window.
import { gsap } from 'gsap';

export function initCursor() {
  if (matchMedia('(pointer: coarse)').matches || innerWidth < 768) return;
  const el = document.querySelector('.cursor');
  const p = el.querySelector('p');
  const xTo = gsap.quickTo(el, 'x', { ease: 'power3' });
  const yTo = gsap.quickTo(el, 'y', { ease: 'power3' });
  let last;
  addEventListener('scroll', () => last && update(last), { passive: true });
  addEventListener('mousemove', (e) => update(last = e));
  function update(e) {
    const right = e.clientX > innerWidth * 0.9;
    gsap.set(el, { xPercent: right ? -110 : 6, yPercent: e.clientY > innerHeight * 0.9 ? -120 : 140 });
    xTo(e.clientX); yTo(e.clientY);
    const t = (document.elementFromPoint(e.clientX, e.clientY) || e.target).closest('[data-cursor]');
    if (t) p.textContent = t.dataset.cursor;
    el.classList.toggle('on', !!t);
  }
}
