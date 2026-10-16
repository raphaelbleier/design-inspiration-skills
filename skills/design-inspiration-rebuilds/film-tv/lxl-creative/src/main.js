import '@fontsource-variable/archivo/wdth.css';
import '@fontsource-variable/manrope';
import '@fontsource/mr-dafoe';
import './style.css';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initScroll } from './scroll.js';
import { initTheme } from './theme.js';
import { initHeroSwap } from './heroSwap.js';
import { initReel } from './reel.js';
import { initStack } from './stack.js';
import { initFeatured } from './featured.js';
import { initWhy } from './why.js';
import { initDraw } from './draw.js';
import { initMenu } from './menu.js';

const lenis = initScroll();
initHeroSwap();
initReel();
initStack();
initFeatured();
initWhy();
initDraw();
initTheme();
initMenu(lenis);
// in-page anchors through Lenis
document.querySelectorAll('.links a').forEach((a) => a.addEventListener('click', (e) => {
  const t = document.querySelector(a.getAttribute('href'));
  if (t && lenis) { e.preventDefault(); lenis.scrollTo(t); }
}));
window.addEventListener('load', () => ScrollTrigger.refresh());
