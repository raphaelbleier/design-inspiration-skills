/**
 * hero.js - framed hero: headline lines rise out of overflow masks on load (1.2s power3.out, stagger .12),
 * photo drifts down 12% as the hero scrolls away (scrub). Side menu stack slides out once the hero is
 * 40% gone and a MENU button fades in; the button (or any link) brings the stack back.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reduced, scrollToEl } from './scroll.js';

export function initHero() {
  const lines = gsap.utils.toArray('.hero-h span');
  const menu = document.querySelector('.menu');
  const btn = document.querySelector('.menu-btn');
  const mobile = () => innerWidth <= 900;
  if (!reduced) {
    lines.forEach((l) => { l.innerHTML = `<span style="display:block">${l.textContent}</span>`; });
    gsap.from('.hero-h span > span', { yPercent: 110, duration: 1.2, ease: 'power3.out', stagger: 0.12, delay: 0.2 });
    gsap.to('.hero-img', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  }
  let open = !mobile();
  const set = (v, instant) => {
    open = v;
    gsap.to(menu, { xPercent: v ? 0 : 110, duration: instant ? 0 : 0.8, ease: 'power3.out' });
    gsap.to(btn, { opacity: v && !mobile() ? 0 : 1, duration: 0.4 });
    btn.style.pointerEvents = v && !mobile() ? 'none' : 'auto';
    btn.setAttribute('aria-expanded', v);
  };
  set(!mobile(), true);
  ScrollTrigger.create({ trigger: '.hero', start: '40% top', onEnter: () => !mobile() && set(false), onLeaveBack: () => !mobile() && set(true) });
  btn.addEventListener('click', () => set(!open));
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    if (mobile()) set(false);
    scrollToEl(document.querySelector(a.getAttribute('href')));
  }));
}
