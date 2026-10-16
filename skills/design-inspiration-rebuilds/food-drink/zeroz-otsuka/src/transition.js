/* Page transition for in-page links: a green panel wipes up over the screen (.55s power3.in),
   the scroll position jumps under it, then the panel leaves upward (.7s power3.out).
   Original used a full page navigation; this single-page rebuild keeps the same feel. */
import gsap from 'gsap';
import { reduced, scrollToEl } from './scroll.js';

export function initTransition() {
  const wipe = document.querySelector('.wipe');
  let busy = false;
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]'); if (!a) return;
    const target = document.querySelector(a.getAttribute('href')); if (!target) return;
    e.preventDefault();
    if (reduced || busy) { scrollToEl(target, true); return; }
    busy = true;
    gsap.timeline({ onComplete: () => { busy = false; } })
      .set(wipe, { yPercent: 0, y: '100%' })
      .to(wipe, { y: '0%', duration: 0.55, ease: 'power3.in' })
      .add(() => scrollToEl(target, true))
      .to(wipe, { y: '-100%', duration: 0.7, ease: 'power3.out' }, '+=0.12');
  });
}
