/*
 * CLIP SLIDER (gallery). The incoming slide wipes in with clip-path
 * inset(0 0 0 100%) -> inset(0) (reverse direction when going back); the old image
 * scales 1 -> 1.5 while the new one scales 1.5 -> 1, all 1.2s "Ease". Buttons, keyboard
 * arrows and a horizontal drag/swipe (>60px) all call go().
 */
import { gsap } from '../core/gsap.js';
import { $, $$ } from '../core/dom.js';

export function initClipSlider() {
  const root = $('#gal'), slides = $$('.slide', root);
  const cur = $('[data-cur]', root);
  let i = 0, busy = false;
  const pad = (n) => String(n + 1).padStart(2, '0');
  $('[data-total]', root).textContent = pad(slides.length - 1);

  function go(to, dir) {
    to = (to + slides.length) % slides.length;
    if (busy || to === i) return;
    busy = true;
    const out = slides[i], inn = slides[to];
    const from = dir > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)';
    gsap.set(inn, { zIndex: 2, clipPath: from });
    gsap.to(out.querySelector('img'), { scale: 1.5, duration: 1.2, ease: 'Ease' });
    gsap.fromTo(inn.querySelector('img'), { scale: 1.5 }, { scale: 1, duration: 1.2, ease: 'Ease' });
    gsap.to(inn, { clipPath: 'inset(0 0 0 0)', duration: 1.2, ease: 'Ease', onComplete: () => {
      out.classList.remove('is-active'); inn.classList.add('is-active');
      gsap.set(out, { clearProps: 'clipPath,zIndex' }); gsap.set(out.querySelector('img'), { scale: 1 });
      gsap.set(inn, { clearProps: 'zIndex' }); busy = false;
    } });
    i = to; cur.textContent = pad(i);
  }
  $('[data-next]', root).addEventListener('click', () => go(i + 1, 1));
  $('[data-prev]', root).addEventListener('click', () => go(i - 1, -1));
  addEventListener('keydown', (e) => {
    const r = root.getBoundingClientRect();
    if (r.top > innerHeight || r.bottom < 0) return;
    if (e.key === 'ArrowRight') go(i + 1, 1); if (e.key === 'ArrowLeft') go(i - 1, -1);
  });
  let x0 = null;
  root.addEventListener('pointerdown', (e) => (x0 = e.clientX));
  addEventListener('pointerup', (e) => { if (x0 === null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 60) go(i + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1); });
}
