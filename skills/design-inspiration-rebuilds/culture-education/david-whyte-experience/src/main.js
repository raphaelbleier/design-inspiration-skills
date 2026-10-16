import { initScroll, lenis } from './scroll.js';
import { initFog } from './fog.js';
import { initReveals } from './reveals.js';
import { initCursor } from './cursor.js';
import { initFaq } from './faq.js';

initScroll();
initFog();
initReveals();
initCursor();
initFaq();

document.getElementById('restart').addEventListener('click', () =>
  lenis ? lenis.scrollTo(0, { duration: 2.2 }) : scrollTo({ top: 0 }));
document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
  e.preventDefault();
  const t = document.querySelector(a.getAttribute('href'));
  if (t) lenis ? lenis.scrollTo(t, { duration: 1.8 }) : t.scrollIntoView();
}));
