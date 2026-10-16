import '@fontsource-variable/inter-tight';
import './style.css';
import { initScroll, initAnchors } from './scroll.js';
import { runIntro } from './intro.js';
import { initCan } from './can.js';
import { initHero } from './hero.js';
import { initCircle } from './circle.js';
import { initFlavors } from './flavors.js';
import { initParallax } from './parallax.js';
import { initJump } from './jump.js';
import { initChrome } from './chrome.js';
import { initTransition, playEnter } from './transition.js';

initScroll();
initChrome();
initTransition();
initAnchors();
initJump();
const hero = document.getElementById('hero');
initCan(hero).then(() => {
  initHero();
  initCircle();
  initFlavors();
  initParallax();
  document.fonts.ready.then(() => import('gsap/ScrollTrigger').then((m) => m.ScrollTrigger.refresh()));
});
playEnter().then((entered) => (entered ? (document.body.classList.remove('loading'), document.getElementById('intro').classList.add('off')) : runIntro()));
