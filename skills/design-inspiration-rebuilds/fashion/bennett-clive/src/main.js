import './style.css';
import { initScroll, reduced } from './scroll.js';
import { initHero } from './hero.js';
import { initServices } from './services.js';
initScroll();
initHero(reduced);
initServices(reduced);
