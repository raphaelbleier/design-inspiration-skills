// Dock menu: bottom pill toggles a panel that wipes up with clip-path inset (0.9s, expo.inOut);
// links rise from a mask (yPercent 110 -> 0, 'power4.out', stagger .06). Fixed header hides behind it via z-index.
import { gsap } from 'gsap';
import { lenis } from './scroll.js';

export function initMenu(reduced) {
  const btn = document.querySelector('.dock__btn'), menu = document.getElementById('menu');
  const links = [...menu.querySelectorAll('.menu__links a')];
  links.forEach((a) => { a.innerHTML = `<span>${a.textContent}</span>`; });
  const label = btn.querySelector('.dock__label');
  const dur = reduced ? 0 : 0.9;
  let open = false;
  const set = (v) => {
    open = v; btn.setAttribute('aria-expanded', v); menu.setAttribute('aria-hidden', !v);
    label.textContent = v ? 'Close' : 'Home';
    lenis?.[v ? 'stop' : 'start']();
    if (v) {
      gsap.set(menu, { visibility: 'visible' });
      gsap.to(menu, { clipPath: 'inset(0% 0 0 0)', duration: dur, ease: 'expo.inOut' });
      gsap.fromTo(links.map((l) => l.firstChild), { yPercent: 110 }, { yPercent: 0, duration: reduced ? 0 : 1, ease: 'power4.out', stagger: 0.06, delay: reduced ? 0 : 0.35 });
    } else gsap.to(menu, { clipPath: 'inset(100% 0 0 0)', duration: dur, ease: 'expo.inOut', onComplete: () => gsap.set(menu, { visibility: 'hidden' }) });
  };
  btn.addEventListener('click', () => set(!open));
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault(); set(false);
    const t = document.querySelector(a.getAttribute('href'));
    setTimeout(() => (lenis ? lenis.scrollTo(t, { duration: 1.4 }) : t.scrollIntoView()), reduced ? 0 : 500);
  }));
  document.querySelectorAll('.top a, .about .btn').forEach((a) => a.addEventListener('click', (e) => {
    const t = document.querySelector(a.getAttribute('href')); if (!t) return;
    e.preventDefault(); lenis ? lenis.scrollTo(t, { duration: 1.4 }) : t.scrollIntoView();
  }));
}
