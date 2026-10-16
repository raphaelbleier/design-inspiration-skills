import '@fontsource-variable/inter-tight';
import './style.css';
import { initScroll, initAnchors } from './scroll.js';
import { initJump } from './jump.js';
import { initChrome } from './chrome.js';
import { initTransition, playEnter } from './transition.js';

initScroll();
initChrome();
initTransition();
initAnchors();
initJump();
document.body.classList.remove('loading');
playEnter();
