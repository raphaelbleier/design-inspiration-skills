import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initScroll, lenis } from './scroll.js';
import { initHero } from './hero.js';
import { initReveals, heroTitleIn } from './reveals.js';
import { initParallax } from './parallax.js';
import { initWellness } from './wellness.js';
import { initMenu } from './menu.js';

gsap.registerPlugin(ScrollTrigger);
initScroll();
initHero();
initMenu();

// cookie pill
const cookie = document.getElementById('cookie');
document.getElementById('cookieOk').addEventListener('click', () => cookie.removeAttribute('open'));

// anchor links through Lenis
document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
  const t = document.querySelector(a.getAttribute('href'));
  if (!t || !lenis) return;
  e.preventDefault(); lenis.scrollTo(t, { duration: 1.6 });
}));

// loader: word fades, panel lifts, then hero title rises. 1.4s total.
const loader = document.getElementById('loader');
const start = () => {
  initReveals(); initParallax(); initWellness(); ScrollTrigger.refresh();
  gsap.timeline()
    .from('.loader__word', { opacity: 0, y: 20, duration: 0.7, ease: 'power3.out' })
    .to(loader, { yPercent: -100, duration: 1, ease: 'power4.inOut', delay: 0.3, onStart: heroTitleIn })
    .set(loader, { display: 'none' });
};
document.fonts.ready.then(start);

// bar turns forest green while it sits over the cream sections
document.fonts.ready.then(() => document.querySelectorAll('.intro, .homes').forEach((s) =>
  ScrollTrigger.create({ trigger: s, start: 'top 60px', end: 'bottom 60px',
    toggleClass: { targets: '.bar', className: 'bar--dark' } })));
