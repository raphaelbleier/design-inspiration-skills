import './style.css';
import { initScroll } from './scroll.js';
import { initIntro } from './intro.js';
import { initCursor } from './cursor.js';
import { initHero } from './hero.js';
import { initParallax } from './parallax.js';
import { initCamps } from './camps.js';
import { initFlick } from './flick.js';
import { initRoute } from './route.js';
import { initMenu } from './menu.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
initScroll(reduce);
initCursor();
initMenu(reduce);
initFlick();
if (!reduce) {
  initIntro();
  initHero();
  initParallax();
  initCamps();
  initRoute();
}

addEventListener('scroll', () => document.querySelector('.howto').classList.toggle('is-on', scrollY > innerHeight * 0.5), { passive: true });
