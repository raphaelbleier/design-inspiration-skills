import './style.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { initScroll } from './scroll.js';
import { initHero } from './hero.js';
import { initSpeakers, initHeadings } from './speakers.js';
import { initLove } from './love.js';
import { initWaves } from './waves.js';
import { initSun } from './sun.js';

gsap.registerPlugin(ScrollTrigger, SplitText);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

document.fonts.ready.then(() => {
  initScroll();
  initSun(reduced);
  initWaves(reduced);
  initHero(reduced);
  initHeadings(reduced);
  initSpeakers(reduced);
  initLove(reduced);
  ScrollTrigger.refresh();
});
