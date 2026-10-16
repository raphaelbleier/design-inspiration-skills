/* Mobile menu: full-screen green panel opens as a circle from the menu button
   (clip-path circle(0 -> 150% at button), .8s power3.out); links rise out of masks, stagger .07. */
import gsap from 'gsap';
import { reduced } from './scroll.js';

export function initMenu() {
  const btn = document.querySelector('.menu-btn'), menu = document.querySelector('.menu');
  let open = false;
  const set = (v) => {
    open = v; btn.setAttribute('aria-expanded', v); menu.setAttribute('aria-hidden', !v);
    const links = menu.querySelectorAll('a');
    if (reduced) { menu.style.visibility = v ? 'visible' : 'hidden'; menu.style.clipPath = v ? 'none' : ''; return; }
    gsap.killTweensOf([menu, links]);
    if (v) {
      gsap.set(menu, { visibility: 'visible' });
      gsap.to(menu, { clipPath: 'circle(150% at calc(100% - 40px) 36px)', duration: 0.8, ease: 'power3.out' });
      gsap.fromTo(links, { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: 'power3.out', stagger: 0.07, delay: 0.2 });
    } else {
      gsap.to(menu, { clipPath: 'circle(0px at calc(100% - 40px) 36px)', duration: 0.6, ease: 'power3.inOut', onComplete: () => gsap.set(menu, { visibility: 'hidden' }) });
    }
  };
  btn.addEventListener('click', () => set(!open));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
  return () => open && set(false);
}
