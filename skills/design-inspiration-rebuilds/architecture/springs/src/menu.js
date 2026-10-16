/**
 * menu.js - full-screen menu opens as a circle clip-path from the burger button.
 * circle(0 -> 150% at 60px 50px) .9s `power3.inOut`; links rise 40px -> 0 with stagger .07
 * `power4.out`. The bar is above the overlay (z-index) so the burger doubles as close.
 */
import gsap from 'gsap';
import { lenis } from './scroll.js';

export function initMenu() {
  const btn = document.getElementById('menuBtn');
  const menu = document.getElementById('menu');
  const links = menu.querySelectorAll('a');
  let open = false;
  function toggle(force) {
    open = typeof force === 'boolean' ? force : !open;
    document.body.classList.toggle('menu-open', open);
    btn.setAttribute('aria-expanded', open); menu.setAttribute('aria-hidden', !open);
    menu.classList.toggle('is-open', open);
    open ? lenis && lenis.stop() : lenis && lenis.start();
    gsap.to(menu, { clipPath: open ? 'circle(150% at 60px 50px)' : 'circle(0% at 60px 50px)', duration: 0.9, ease: 'power3.inOut' });
    gsap.to(links, open
      ? { y: 0, opacity: 1, duration: 1, ease: 'power4.out', stagger: 0.07, delay: 0.25 }
      : { y: 40, opacity: 0, duration: 0.3, overwrite: true });
  }
  btn.addEventListener('click', () => toggle());
  links.forEach((a) => a.addEventListener('click', () => toggle(false)));
}
