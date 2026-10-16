import './style.css';
import { createScene } from './scene.js';
import { initScroll } from './scroll.js';
import { initChapters } from './chapters.js';
import { initGate } from './audio.js';
import gsap from 'gsap';

const world = createScene(document.getElementById('gl'));
const scroll = initScroll((ms) => { world.state.target = scroll.progress(); world.frame(ms); });
initChapters();
document.querySelector('.back').addEventListener('click', (e) => { e.preventDefault(); scroll.lenis ? scroll.lenis.scrollTo(0, { duration: 2.2 }) : scrollTo(0, 0); });
// scroll is locked until the gate closes
scroll.lenis?.stop();
initGate(() => scroll.lenis?.start());
if (!matchMedia('(prefers-reduced-motion: reduce)').matches)
  gsap.from('.gate h1 span', { yPercent: 40, opacity: 0, duration: 1.6, ease: 'expo.out', stagger: 0.15 });
