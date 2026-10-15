import '@fontsource/instrument-serif/index.css';
import '@fontsource-variable/inter/index.css';
import './styles.css';
import './easing.js';
import { gsap } from 'gsap';
import { state } from './state.js';
import { initInk } from './ink.js';
import { initScroll } from './scroll.js';
import { initCursor } from './cursor.js';
import { initRelief } from './relief.js';
import { initFastMode, titlesMarkup, forceFast } from './fast-mode.js';
import { initAbout } from './about.js';
import { initSound } from './sound.js';
import { initRouter } from './router.js';
import { runLoader } from './loader.js';

history.scrollRestoration = 'manual';
initInk();
initScroll();
document.getElementById('view').insertAdjacentHTML('beforebegin', titlesMarkup());
initRouter();
initCursor();
initSound();
initAbout();
const relief = initRelief(document.getElementById('gl'));
initFastMode(relief);

const assets = ['relief-depth', 'relief-lit', 'show1', 'pa'].map((n) => `./img/${n}.webp`);
runLoader({ assets });
// QA hook: window.__studio.fast(true|false) toggles fast mode without a hard scroll
window.__studio = { state, fast: forceFast, gsap };
