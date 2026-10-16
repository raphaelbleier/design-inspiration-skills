import './style.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { initCarousel, updateCarousel } from './carousel.js';
import { buildTimeline } from './timeline.js';
import { renderScene } from './scene.js';
import { initFlavor } from './flavor.js';
import { initScroll } from './scroll.js';
import { initReveals, initRoll, initMenu, initLists, initForm } from './ui.js';

gsap.registerPlugin(ScrollTrigger, SplitText);
history.scrollRestoration = 'manual';

initRoll();
initLists();
initCarousel();
initFlavor();
initMenu();
initForm();
document.fonts.ready.then(() => {
  initReveals();
  buildTimeline(document.querySelector('.moods'));
  ScrollTrigger.refresh();
});
initScroll((dt, t) => { updateCarousel(dt); renderScene(dt, t); });
