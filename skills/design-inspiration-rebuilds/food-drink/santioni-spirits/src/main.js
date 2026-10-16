import './style.css';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { initInk, state } from './ink.js';
import { initScroll, lenis, onFrame } from './scroll.js';
import { buildStory } from './story.js';
import { initHand } from './hand.js';
import { initSelect } from './select.js';

gsap.registerPlugin(SplitText);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduced) document.documentElement.classList.add('rm');

initScroll(reduced);
const gate = document.getElementById('gate');

if (!reduced) {
  const render = initInk(document.getElementById('ink'));
  onFrame((t) => render(t, false));
}

let story = null;
const ready = () => {
  if (!reduced) {
    story = buildStory();
    document.querySelector('[data-go=story]').addEventListener('click', story.toStory);
    document.querySelector('[data-go=collection]').addEventListener('click', story.toSelect);
    initSelect(story.toPour, false);
    initHand(document.querySelectorAll('.stage .panel')[story.handIndex]);
  } else {
    initSelect(() => {}, true);
    document.querySelector('[data-go=story]').addEventListener('click', () => scrollTo({ top: 0 }));
    document.querySelector('[data-go=collection]').addEventListener('click', () => document.getElementById('select').scrollIntoView());
  }
};
ready();

/* ---- age gate: YES opens, NO shows a note ---- */
document.querySelector('[data-age=yes]').addEventListener('click', () => {
  const tl = gsap.timeline();
  tl.to(gate, { clipPath: 'inset(0 0 100% 0)', duration: 0.9, ease: 'power3.inOut' })
    .set(gate, { display: 'none' });
  if (lenis) lenis.start();
  if (!reduced) {
    gsap.to(state.splash, { v: 1, duration: 2.2, ease: 'power2.out', delay: 0.4 });
    const lines = new SplitText('.hero .line', { type: 'chars' });
    gsap.from(lines.chars, { yPercent: 110, rotate: 6, duration: 1.1, ease: 'power3.out', stagger: 0.04, delay: 0.5 });
    gsap.from('.hero small', { autoAlpha: 0, y: 14, duration: 0.8, delay: 0.4 });
  }
});
document.querySelector('[data-age=no]').addEventListener('click', () => {
  document.getElementById('gActions').hidden = true;
  document.getElementById('gDeny').hidden = false;
});

/* ---- cookie box ---- */
document.querySelectorAll('[data-c]').forEach((b) => b.addEventListener('click', () => {
  gsap.to('#cookie', { autoAlpha: 0, y: 16, duration: 0.4, onComplete: () => document.getElementById('cookie').remove() });
}));
