import './style.css';
import { initScroll, ScrollTrigger } from './scroll.js';
import { initHero } from './hero.js';
import { initReveals } from './reveals.js';
import { initFeatures } from './features.js';
import { initLogos } from './logos.js';
import { initCalc } from './calc.js';
import { initNav } from './nav.js';

initScroll();
initHero();
initReveals();
initFeatures();
initLogos();
initCalc();
initNav();
addEventListener('load', () => ScrollTrigger.refresh());
