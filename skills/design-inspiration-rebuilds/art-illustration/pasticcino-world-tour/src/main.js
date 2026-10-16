import './style.css';
import { initGate } from './gate.js';
import { initJourney } from './journey.js';
import { initCards } from './cards.js';
import { initMenu } from './menu.js';
import { setChapter } from './chapter.js';
import { parallax } from './parallax.js';
import { tilt } from './tilt.js';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

parallax('.gate-bg');
document.querySelectorAll('.tilt').forEach((el) => tilt(el, el.classList.contains('intro-card') ? -1.2 : -1.4));

const sound = document.querySelector('.sound');
sound.addEventListener('click', () => sound.setAttribute('aria-pressed', sound.getAttribute('aria-pressed') !== 'true'));

let scenes;
initCards();
initGate(() => {
  document.getElementById('journey').hidden = false;
  scenes = initJourney((s) => setChapter(s));
  parallax('.scene .bg');
  initMenu(scenes);
  ScrollTrigger.refresh();
});
