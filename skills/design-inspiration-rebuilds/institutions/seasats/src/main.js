import './style.css';
import { initScroll } from './scroll.js';
import { initHero } from './hero.js';
import { initIntel } from './intel.js';
import { initSteps } from './steps.js';
import { initFleet } from './fleet.js';
import { initReveals } from './reveals.js';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

initScroll();
initHero();
initIntel();
initSteps();
initFleet();
initReveals();
addEventListener('load', () => ScrollTrigger.refresh());
