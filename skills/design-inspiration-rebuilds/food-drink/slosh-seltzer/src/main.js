import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initScroll, scrollTo } from './scroll.js';
import './gl.js';
import { popCan, hero, band, FLAVORS } from './can.js';
import './fruit.js';
import { erupt } from './foam.js';
import { initGate } from './gate.js';
import { initDoodles } from './doodles.js';
import { initReveals } from './reveals.js';
import { initTheme } from './theme.js';
import { state, reduced } from './state.js';

initScroll();
initDoodles();

addEventListener('pointermove', (e) => {
  state.mx = (e.clientX / innerWidth) * 2 - 1;
  state.my = (e.clientY / innerHeight) * 2 - 1;
});

let popped = false;
const pop = () => { if (popped) return; popped = true; popCan(); erupt(); };
document.getElementById('pop').addEventListener('click', pop);
document.getElementById('seeFlavors').addEventListener('click', () => scrollTo(document.getElementById('flavors')));
document.getElementById('again').addEventListener('click', () => scrollTo(0));
document.querySelector('.logo').addEventListener('click', (e) => { e.preventDefault(); scrollTo(0); });

// fonts decide the label texture and line widths: wait for them before measuring
(document.fonts?.ready ?? Promise.resolve()).then(() => {
  hero.setFlavor(FLAVORS[1]); band.setFlavor(FLAVORS[0]);   // redraw labels with the loaded display font
  initReveals();
  initTheme();
  // scrolling past the can pops it for you
  ScrollTrigger.create({ trigger: '#hero', start: 'top+=60 top', onEnter: pop });
  initGate();
  if (reduced) pop();
  ScrollTrigger.refresh();
});
