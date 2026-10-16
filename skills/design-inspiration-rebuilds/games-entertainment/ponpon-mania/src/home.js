/* Home: spinning sticker that drifts away from the cursor, mascot that rises with parallax,
 * and a "read now" button that tilts toward the pointer.
 *   sticker: quickTo x/y 0.9s power3.out, offset = -(pointer - centre) * 0.03
 *   button:  rotate = dx * 6deg, scale 1.06 on hover, release uses elastic.out(1, .5) 0.9s
 */
import gsap from 'gsap';
import { onEnter } from './router.js';

export function initHome() {
  const sticker = document.querySelector('.sticker');
  const mascot = document.querySelector('.mascot');
  const btn = document.querySelector('.btn-read');
  const sx = gsap.quickTo(sticker, 'x', { duration: 0.9, ease: 'power3.out' });
  const sy = gsap.quickTo(sticker, 'y', { duration: 0.9, ease: 'power3.out' });
  const mx = gsap.quickTo(mascot, 'x', { duration: 1.1, ease: 'power3.out' });

  addEventListener('pointermove', (e) => {
    const dx = e.clientX / innerWidth - 0.5, dy = e.clientY / innerHeight - 0.5;
    sx(-dx * 40); sy(-dy * 40); mx(dx * 24);
  });

  btn.addEventListener('pointermove', (e) => {
    const r = btn.getBoundingClientRect();
    const dx = (e.clientX - r.left) / r.width - 0.5;
    gsap.to(btn, { rotate: dx * 12, scale: 1.06, duration: 0.4, ease: 'power3.out', overwrite: 'auto' });
  });
  btn.addEventListener('pointerleave', () =>
    gsap.to(btn, { rotate: 0, scale: 1, duration: 0.9, ease: 'elastic.out(1, .5)', overwrite: 'auto' }));

  onEnter('home', () => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo(mascot, { yPercent: 40 }, { yPercent: 0, duration: 1.2, ease: 'power3.out', delay: 0.5 });
    gsap.fromTo(btn, { scale: 0 }, { scale: 1, duration: 0.8, ease: 'back.out(1.6)', delay: 0.8 });
    gsap.fromTo(sticker, { scale: 0, rotate: -40 }, { scale: 1, rotate: 0, duration: 0.9, ease: 'back.out(1.4)', delay: 1 });
  });
}
