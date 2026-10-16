import './style.css';
import { initScroll } from './scroll.js';
import { initHero } from './hero.js';
import { initReveals } from './reveals.js';
import { initShowroom } from './showroom.js';
import { initMenu } from './menu.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
initScroll(reduced);
initHero(reduced);
initReveals(reduced);
initShowroom(reduced);
initMenu(reduced);

document.querySelectorAll('[data-cookie]').forEach((b) => b.addEventListener('click', () => { document.getElementById('cookie').hidden = true; }));
