/* Technique: newsletter modal after 2.5s (once per session). Backdrop fades .5s, card rises 40px -> 0 with
   .8s power3.out. z-index 100 is above the fixed header (50), so the header is hidden behind the overlay.
   Page scroll is locked while open. */
import gsap from 'gsap';
import { lenis } from './scroll.js';

export function initPopup() {
  const pop = document.getElementById('pop'), card = pop.querySelector('.pop-card');
  const seen = () => { try { return sessionStorage.getItem('st-pop'); } catch { return null; } };
  const close = () => {
    try { sessionStorage.setItem('st-pop', '1'); } catch {}
    lenis?.start(); document.body.style.overflow = '';
    gsap.to(pop, { opacity: 0, duration: 0.4, onComplete: () => { pop.style.visibility = 'hidden'; pop.setAttribute('aria-hidden', 'true'); } });
  };
  const show = () => {
    if (seen()) return;
    lenis?.stop(); document.body.style.overflow = 'hidden';
    pop.style.visibility = 'visible'; pop.setAttribute('aria-hidden', 'false');
    gsap.to(pop, { opacity: 1, duration: 0.5 });
    gsap.fromTo(card, { y: 40 }, { y: 0, duration: 0.8, ease: 'power3.out' });
  };
  setTimeout(show, 2500);
  document.getElementById('popX').addEventListener('click', close);
  pop.addEventListener('click', (e) => { if (e.target === pop) close(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && pop.style.visibility === 'visible') close(); });
}
