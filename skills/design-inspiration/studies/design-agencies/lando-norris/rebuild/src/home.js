/**
 * home.js - entry for index.html. Order matters: fonts -> shell -> scroll -> topo -> effects -> refresh.
 */
import './style.css';
import { gsap, ScrollTrigger, initScroll, onFrame, reduced } from './scroll.js';
import { mountChrome, icons } from './chrome.js';
import { createTopo } from './topo.js';
import { initTheme } from './theme.js';
import { initMenu } from './menu.js';
import { initTransition } from './transition.js';
import { initReveals } from './reveals.js';
import { initHero } from './hero.js';
import { initGallery } from './gallery.js';
import { initHelmets } from './helmets.js';
import { initMarquee } from './marquee.js';
import { initFan } from './fan.js';
import { initParallax } from './parallax.js';

mountChrome({ page: 'home' });
document.querySelectorAll('[data-laurel]').forEach((e) => (e.innerHTML = icons.laurel));
document.querySelectorAll('[data-laurel-lime]').forEach((e) => (e.innerHTML = icons.laurel));
document.querySelectorAll('[data-mark]').forEach((e) => (e.innerHTML = icons.mark));

initScroll();

// --- WebGL: main fixed canvas (mask = hero frame) + one small instance inside the footer panel
const topo = createTopo(document.querySelector('[data-topo]'), { reduced, rectEl: document.querySelector('[data-frame]') });
onFrame((t) => topo.render(t));
const footerTopo = createTopo(document.querySelector('[data-footer-topo]'), { reduced, speed: 0.02, density: 8, bg: '#282c20', line: '#363b29', maxDpr: 1 });
footerTopo.setVisible(false);
onFrame((t) => footerTopo.render(t));
ScrollTrigger.create({ trigger: '[data-footer-panel]', start: 'top bottom', end: 'bottom top', onToggle: (s) => footerTopo.setVisible(s.isActive) });

const themeCtl = initTheme(topo);
initMenu();
initTransition();

// tap button (touch devices): ripple through the contour field
document.querySelector('[data-tap]')?.addEventListener('click', () => topo.pulse());

// build dynamic DOM first, then everything that measures it
initHelmets();
initMarquee();
initFan();

// wait for webfonts so SplitText measures the final line breaks
document.fonts.ready.then(() => {
  initHero();
  initGallery(themeCtl);
  initParallax();
  initReveals();
  initFooter();
  themeCtl.start();
  ScrollTrigger.refresh();
});

/** footer: signature draws when the panel scrolls in */
function initFooter() {
  const sig = document.querySelector('[data-footer-sig]');
  if (!sig || reduced) return;
  gsap.set(sig, { strokeDasharray: 1, strokeDashoffset: 1 });
  gsap.to(sig, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', scrollTrigger: { trigger: sig, start: 'top 85%', once: true } });
  gsap.set('[data-scribble]', { strokeDasharray: 1, strokeDashoffset: 1 });
  gsap.to('[data-scribble]', { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut', scrollTrigger: { trigger: '.split', start: 'top 60%', once: true } });
  const cs = document.querySelectorAll('[data-collabs] path');
  gsap.set(cs, { strokeDasharray: 1, strokeDashoffset: 1 });
  gsap.to(cs, { strokeDashoffset: 0, duration: 0.7, ease: 'power2.inOut', stagger: 0.12, scrollTrigger: { trigger: '.partners', start: 'top 60%', once: true } });
}
