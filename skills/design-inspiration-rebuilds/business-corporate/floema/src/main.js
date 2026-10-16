import { initScroll } from './scroll.js';
import { initHero } from './hero.js';
import { initSlides } from './slides.js';
import { initReveals } from './reveals.js';
import { initCollections } from './collections.js';
import { initMenu } from './menu.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
initMenu(reduced);
initCollections(reduced);
if (!reduced) {
  initScroll();
  initHero();
  initSlides();
  initReveals();
}
