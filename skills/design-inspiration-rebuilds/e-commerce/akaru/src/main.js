import './style.css';
import { initScroll } from './scroll.js';
import { initHero } from './hero.js';
import { initReveals } from './reveals.js';
import { initTrophy } from './trophy.js';
import { initExpertises } from './expertises.js';
import { initMenu } from './menu.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
initScroll(reduce);
initMenu(reduce);
initHero(reduce);
initReveals(reduce);
initTrophy(reduce);
initExpertises(reduce);
