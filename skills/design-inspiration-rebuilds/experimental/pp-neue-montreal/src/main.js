import './style.css';
import { initScroll } from './scroll.js';
import { initPosters } from './posters.js';
import { initWeights } from './weights.js';
import { initBands } from './bands.js';
import { initFan } from './fan.js';
import { initVariants } from './variants.js';
import { initReveals } from './reveals.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
initWeights();
initVariants();
initBands();
initScroll(reduce);
if (!reduce) { initReveals(); initPosters(); initFan(); }
