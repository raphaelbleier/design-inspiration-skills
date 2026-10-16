// Technique: mobile menu overlay. clip-path inset(0 0 100% 0) -> inset(0) over 0.75s osmo, links rise
// yPercent 110 -> 0 (0.8s osmo, stagger .06). The fixed nav sits below the overlay (z-index 80 vs 50).
import { gsap } from 'gsap';
import { reduced } from './scroll.js';

export function initMenu(lenis) {
  const menu = document.querySelector('[data-menu]');
  const links = menu.querySelectorAll('a');
  const open = (on) => {
    menu.setAttribute('aria-hidden', !on);
    lenis?.[on ? 'stop' : 'start']();
    if (reduced) return void gsap.set(menu, { clipPath: on ? 'inset(0)' : 'inset(0 0 100% 0)', visibility: on ? 'visible' : 'hidden' });
    if (on) {
      gsap.set(menu, { visibility: 'visible' });
      gsap.to(menu, { clipPath: 'inset(0 0 0% 0)', duration: 0.75, ease: 'osmo' });
      gsap.fromTo(links, { yPercent: 110 }, { yPercent: 0, duration: 0.8, ease: 'osmo', stagger: 0.06, delay: 0.2 });
    } else gsap.to(menu, { clipPath: 'inset(0 0 100% 0)', duration: 0.6, ease: 'osmo', onComplete: () => gsap.set(menu, { visibility: 'hidden' }) });
  };
  document.querySelector('[data-menu-open]').addEventListener('click', () => open(true));
  document.querySelector('[data-menu-close]').addEventListener('click', () => open(false));
  links.forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault(); open(false);
    const t = document.querySelector(a.getAttribute('href'));
    setTimeout(() => (lenis ? lenis.scrollTo(t) : t.scrollIntoView()), 100);
  }));
}
