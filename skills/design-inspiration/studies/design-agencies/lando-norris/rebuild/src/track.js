/** track.js - entry for on-track.html: same shell + transition, no WebGL (black page). */
import './style.css';
import { gsap, ScrollTrigger, initScroll, reduced } from './scroll.js';
import { mountChrome, icons } from './chrome.js';
import { initMenu } from './menu.js';
import { initTransition } from './transition.js';
import { initReveals } from './reveals.js';

mountChrome({ page: 'track' });
document.querySelectorAll('[data-laurel]').forEach((e) => (e.innerHTML = icons.laurel));
document.querySelectorAll('[data-mark]').forEach((e) => (e.innerHTML = icons.mark));
document.querySelector('.header').setAttribute('data-ink', 'light');
initScroll();
initMenu();
initTransition();

document.fonts.ready.then(() => {
  initReveals();
  if (!reduced) {
    // giant "ON" scribble draws in after the sheet lifts, TRACK slides up behind it
    gsap.set('[data-on]', { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.timeline({ delay: 0.9 })
      .from('.tk__track', { yPercent: 40, opacity: 0, duration: 1, ease: 'power3.out' })
      .to('[data-on]', { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' }, 0.1)
      .from('.tk__meta > *', { y: 20, opacity: 0, duration: 0.6, stagger: 0.1 }, 0.6);
  }
  ScrollTrigger.refresh();
});
