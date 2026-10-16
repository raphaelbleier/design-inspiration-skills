import './style.css';
import { initScroll } from './scroll.js';
import { intro } from './loader.js';
import { initBee } from './bee.js';
import { initCarousels } from './carousel.js';
import { initReveals } from './reveals.js';
import { initMenu } from './menu.js';

initScroll();
initCarousels();
initMenu();
initBee();
intro();
initReveals();
