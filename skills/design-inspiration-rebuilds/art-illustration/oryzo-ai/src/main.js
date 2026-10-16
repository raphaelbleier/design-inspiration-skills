import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initScroll } from './scroll.js';
import { initDisc } from './disc.js';
import { initReveals } from './reveals.js';
import { initWear } from './wear.js';
import { initHScroll } from './hscroll.js';
import { initFeatures } from './features.js';

gsap.registerPlugin(ScrollTrigger);
initScroll();
initDisc();
initWear();
initHScroll();
initFeatures();
initReveals();
addEventListener('load', () => ScrollTrigger.refresh());
