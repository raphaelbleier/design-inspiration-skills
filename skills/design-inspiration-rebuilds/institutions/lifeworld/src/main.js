import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initScroll } from './scroll.js';
import { ready } from './glyph.js';
import { initHero } from './hero.js';
import { initFit } from './fit.js';
import { initReveals } from './reveals.js';
import { initArtwork } from './artwork.js';
import { initShop } from './shop.js';

gsap.registerPlugin(ScrollTrigger);
initScroll();
initArtwork();
ready().then(() => {            // glyph metrics need the web font
  initHero(); initFit(); initShop(); initReveals();
  ScrollTrigger.refresh();
});
