// Technique: pill accordion. One pill open at a time; height animates to its content with
// 0.75s osmo, the plus rotates 45deg via CSS (0.5s osmo). The tall film-strip image parallaxes
// yPercent -6 -> 6 with scrub.
import { gsap } from 'gsap';
import { reduced } from './scroll.js';

export function initWhy() {
  const pills = [...document.querySelectorAll('[data-pill]')];
  const set = (p, open, instant) => {
    p.classList.toggle('open', open);
    p.querySelector('button').setAttribute('aria-expanded', open);
    gsap.to(p.querySelector('.pill-body'), { height: open ? 'auto' : 0, duration: reduced || instant ? 0 : 0.75, ease: 'osmo' });
  };
  pills.forEach((p) => p.querySelector('button').addEventListener('click', () => {
    const open = !p.classList.contains('open');
    pills.forEach((q) => q !== p && q.classList.contains('open') && set(q, false));
    set(p, open);
  }));
  set(pills[2], true, true);   // third pill open on load, like the original's resting state
  if (!reduced) gsap.fromTo('[data-why-img]', { yPercent: -6, scale: 1.12 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.why', start: 'top bottom', end: 'bottom top', scrub: true } });
}
