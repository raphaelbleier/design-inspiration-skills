// Technique: full-screen menu. Panel opens with a circle clip-path from the menu button
// (circle(0 -> 150% at button), .9s power3.inOut); links rise out of masks (yPercent 110 -> 0, .9s power4.out, stagger .07).
// The bar stays above the overlay (z-index 50) so the same button closes it.
import gsap from 'gsap';
import { lenis } from './scroll.js';

export function initMenu(reduce) {
  const btn = document.querySelector('.menu-btn');
  const menu = document.querySelector('.menu');
  const bar = document.querySelector('.bar');
  const links = [...menu.querySelectorAll('a')];
  links.forEach((a) => (a.innerHTML = `<span>${a.textContent}</span>`));
  let open = false;
  const origin = () => { const r = btn.getBoundingClientRect(); return `${r.left + r.width / 2}px ${r.top + r.height / 2}px`; };
  const set = (o) => {
    open = o;
    btn.setAttribute('aria-expanded', o);
    menu.setAttribute('aria-hidden', !o);
    btn.firstChild.textContent = o ? 'Fermer ' : 'Menu ';
    bar.classList.toggle('show', o || scrollY > innerHeight * 0.6);
    if (lenis) o ? lenis.stop() : lenis.start();
    if (reduce) { menu.style.visibility = o ? 'visible' : 'hidden'; menu.style.clipPath = 'none'; return; }
    if (o) {
      gsap.set(menu, { visibility: 'visible', clipPath: `circle(0px at ${origin()})` });
      gsap.to(menu, { clipPath: `circle(150% at ${origin()})`, duration: 0.9, ease: 'power3.inOut' });
      gsap.fromTo(links.map((a) => a.firstChild), { yPercent: 110 },
        { yPercent: 0, duration: 0.9, ease: 'power4.out', stagger: 0.07, delay: 0.3 });
    } else {
      gsap.to(menu, { clipPath: `circle(0px at ${origin()})`, duration: 0.7, ease: 'power3.inOut',
        onComplete: () => gsap.set(menu, { visibility: 'hidden' }) });
    }
  };
  btn.addEventListener('click', () => set(!open));
  links.forEach((a) => a.addEventListener('click', () => set(false)));
}
