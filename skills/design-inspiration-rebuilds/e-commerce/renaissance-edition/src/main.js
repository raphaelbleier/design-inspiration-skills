import './style.css';
import { initScroll } from './scroll.js';
import { initPaper } from './paper.js';
import { initHero } from './hero.js';
import { initChapters } from './chapters.js';
const lenis = initScroll();
initPaper(); initChapters(lenis); initHero();
