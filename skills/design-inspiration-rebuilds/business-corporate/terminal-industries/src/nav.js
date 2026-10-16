/**
 * nav.js - fixed blurred pill. Over white sections it switches to a darker tint
 * (.is-light) once the hero is gone; the mobile burger only toggles aria-expanded and the
 * link row as a dropdown panel.
 */
import { ScrollTrigger } from './scroll.js';

export function initNav() {
  const nav = document.querySelector('[data-nav]');
  ScrollTrigger.create({ trigger: '.paths', start: 'top 10%', end: 'bottom top',
    toggleClass: { targets: nav, className: 'is-light' } });
  const b = nav.querySelector('[data-burger]');
  b.addEventListener('click', () => {
    const open = b.getAttribute('aria-expanded') !== 'true';
    b.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  });
  nav.querySelectorAll('.nav__links a').forEach((a) => a.addEventListener('click', () => { b.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); }));
}
