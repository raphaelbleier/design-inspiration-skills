// Footer. Technique: the footer is position: fixed behind the page; .page has margin-bottom: 100svh and a
// solid background, so scrolling "lifts" the page to uncover it (no JS needed for the reveal).
// Image trail: every 12px of pointer travel the next of 6 images appears at the cursor
// (scale .8 -> 1, autoAlpha 0 -> 1, .4s), and fades out after 300ms of stillness / when 8 are live.
import { gsap } from 'gsap';
import { reduced } from './scroll.js';

export function initFooter() {
  const copy = document.getElementById('copy');
  copy.addEventListener('click', () => {
    navigator.clipboard?.writeText('bonjour@studiomarguerite.test');
    copy.textContent = 'copié';
    setTimeout(() => (copy.textContent = 'copier'), 1500);
  });
  if (reduced || innerWidth < 992) return;
  const wrap = document.querySelector('[data-trail="wrapper"]');
  const items = [...wrap.querySelectorAll('[data-trail="item"]')];
  const live = [];
  let i = 0, z = 1, last = { x: 0, y: 0 }, stop;
  const hide = (el) => gsap.to(el, { autoAlpha: 0, scale: 0.8, duration: 0.5, ease: 'power2.in', onComplete: () => (el.style.display = 'none') });
  wrap.addEventListener('mousemove', (e) => {
    if (e.target.closest('.contact-row')) return;
    if (Math.hypot(e.clientX - last.x, e.clientY - last.y) < 12 * 6) return;
    last = { x: e.clientX, y: e.clientY };
    const el = items[i++ % items.length];
    const r = el.getBoundingClientRect();
    Object.assign(el.style, { display: 'block', left: `${e.clientX - (r.width || 200) / 2}px`, top: `${e.clientY - (r.height || 250) / 2}px`, zIndex: ++z });
    gsap.fromTo(el, { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'power3.out' });
    live.push(el);
    if (live.length > 8) hide(live.shift());
    clearTimeout(stop);
    stop = setTimeout(() => { while (live.length) hide(live.shift()); }, 300 + 1200);
  });
}
