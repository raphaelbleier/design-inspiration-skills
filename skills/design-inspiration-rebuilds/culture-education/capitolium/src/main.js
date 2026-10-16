import './style.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initScroll, reduced } from './scroll.js';
import { initGate } from './gate.js';
import { initMenu, initPill, showChrome } from './nav.js';
import { initIntro } from './intro.js';
import { initChapter1 } from './chapter1.js';
import { initReveals } from './reveals.js';

// CSS backgrounds from public/ (base-safe; Vite does not rewrite absolute urls in CSS)
const B = import.meta.env.BASE_URL;
document.documentElement.style.setProperty('--marble', `url(${B}img/marble.webp)`);
document.documentElement.style.setProperty('--hero', `url(${B}img/hero-square.webp)`);

initScroll();
initMenu();
const gate = document.getElementById('gate');

document.fonts.ready.then(() => {
  if (!reduced) { initIntro(); initChapter1(); }
  initReveals();
  initPill();
  ScrollTrigger.refresh();
});

if (reduced) {                       // reduced motion: gate is a plain button, no transitions
  document.getElementById('enter').addEventListener('click', () => {
    gate.hidden = true; document.body.classList.remove('locked'); showChrome();
  });
} else initGate(showChrome);
