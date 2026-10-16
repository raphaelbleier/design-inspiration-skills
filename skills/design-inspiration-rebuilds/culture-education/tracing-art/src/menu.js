// Technique: full-screen black panel opens with a circle clip-path centred on the button
// (0 -> 150%, .8s power3.out); links rise from a mask (yPercent 110 -> 0, .9s back.out(1.2), stagger .07).
import gsap from 'gsap';
import { lenis, reduced } from './scroll.js';

export function initMenu() {
  const btn = document.querySelector('#menuBtn'), menu = document.querySelector('#menu');
  const links = [...menu.querySelectorAll('a')];
  const at = 'at calc(100% - 36px) 36px';
  let open = false;
  const set = (v) => {
    open = v;
    btn.setAttribute('aria-expanded', v); menu.setAttribute('aria-hidden', !v);
    document.body.classList.toggle('menu-open', v);
    lenis?.[v ? 'stop' : 'start']();
    if (reduced) { menu.style.cssText = v ? 'clip-path:none;visibility:visible' : ''; return; }
    if (v) {
      gsap.set(menu, { visibility: 'visible' });
      gsap.to(menu, { clipPath: `circle(150% ${at})`, duration: 0.8, ease: 'power3.out' });
      gsap.fromTo(links, { yPercent: 110, rotate: 4 }, { yPercent: 0, rotate: 0, duration: 0.9, ease: 'back.out(1.2)', stagger: 0.07, delay: 0.25 });
    } else {
      gsap.to(menu, { clipPath: `circle(0% ${at})`, duration: 0.6, ease: 'power3.inOut', onComplete: () => gsap.set(menu, { visibility: 'hidden' }) });
    }
  };
  btn.addEventListener('click', () => set(!open));
  links.forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault(); set(false);
    const t = document.querySelector(a.getAttribute('href'));
    setTimeout(() => lenis ? lenis.scrollTo(t, { duration: 1.4 }) : t.scrollIntoView(), 300);
  }));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) set(false); });
}
