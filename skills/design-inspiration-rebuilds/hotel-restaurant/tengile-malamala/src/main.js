import '@fontsource-variable/inter';
import '@fontsource-variable/newsreader';
import './style.css';
import { initScroll, initAnchors } from './scroll.js';
import { initHero } from './hero.js';
import { initReveals } from './reveals.js';
import { initCursor } from './cursor.js';
import { initGallery } from './gallery.js';
import { initCloud } from './cloud.js';
import { initMenu } from './menu.js';

initScroll();
const closeMenu = initMenu();
initAnchors(closeMenu);
initHero();
initCursor();
initGallery();
initCloud();
initReveals();
