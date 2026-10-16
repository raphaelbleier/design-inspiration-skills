import './style.css';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initScroll } from './scroll.js';
import { initHeader } from './header.js';
import { initHero } from './hero.js';
import { initMenu } from './menu.js';
import { initReveals } from './reveals.js';
import { initServices } from './services.js';
import { initClients } from './clients.js';
import { initNews } from './news.js';

initScroll();
initHeader();
initHero();
initMenu();
initServices();
initReveals();
initClients();
initNews();

addEventListener('load', () => { document.fonts.ready.then(() => ScrollTrigger.refresh()); });
