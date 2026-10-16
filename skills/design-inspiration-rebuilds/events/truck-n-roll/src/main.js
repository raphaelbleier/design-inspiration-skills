import './style.css';
import { initScroll, reduced } from './scroll.js';
import { intro } from './intro.js';
import { parallax } from './parallax.js';
import { hugeText } from './huge.js';
import { steps } from './steps.js';
import { accordion } from './accordion.js';
import { ascii } from './ascii.js';
import { rail } from './rail.js';
import { marquee } from './marquee.js';

const lenis = initScroll();
intro();
parallax();
hugeText();
steps();
accordion();
ascii();
rail();
marquee(lenis);

document.querySelector('[data-open-contact]').addEventListener('click', () =>
  lenis ? lenis.scrollTo('#contact', { duration: 1.6, easing: (t) => (t < .5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2) })
        : document.getElementById('contact').scrollIntoView());
document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
  const id = a.getAttribute('href');
  if (id.length < 2) return;
  e.preventDefault();
  lenis ? lenis.scrollTo(id, { duration: 1.4 }) : document.querySelector(id).scrollIntoView();
}));
