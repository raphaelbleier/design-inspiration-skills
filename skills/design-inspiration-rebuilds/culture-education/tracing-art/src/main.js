import './style.css';
import gsap from 'gsap';
import { initScroll, lenis, reduced } from './scroll.js';
import { buildCards, heroSet, stmtSet } from './cards.js';
import { initChapters } from './chapters.js';
import { initSphere } from './sphere.js';
import { initMenu } from './menu.js';

initScroll();
const hint = document.querySelector('.hint');
buildCards(document.querySelector('#cards'), heroSet, hint);
buildCards(document.querySelector('#cardsB'), stmtSet, null);
initChapters();
initSphere();
initMenu();

document.querySelector('#down').addEventListener('click', () => {
  const t = document.querySelector('#statement');
  lenis ? lenis.scrollTo(t, { duration: 1.4 }) : t.scrollIntoView();
});
// Headline entrance: lines rise 40px + fade, 1.2s power3.out
if (!reduced) gsap.from('.hero-copy > *', { y: 40, opacity: 0, duration: 1.2, ease: 'power3.out', stagger: 0.1, delay: 0.2 });
