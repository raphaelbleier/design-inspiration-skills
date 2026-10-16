import './style.css';
import { initScroll } from './scroll.js';
import { initNav } from './nav.js';
import { initIntro } from './intro.js';
import { initReveals } from './reveals.js';
import { initMarquee } from './marquee.js';
import { initLiving } from './living.js';
import { initPixels } from './pixels.js';
import { initTunnel } from './tunnel.js';

initScroll();
initNav();
initMarquee();
initPixels();
document.fonts.ready.then(() => {
  initIntro();
  initReveals();
  initLiving();
  initTunnel();
});

// generated images arrive later: hide the broken-image glyph until they exist
document.querySelectorAll('img').forEach((i) => i.addEventListener('error', () => (i.style.visibility = 'hidden')));
