/**
 * gate.js - age gate. Click: a green circle wipes out of the button over the pink gate,
 * `clip-path: circle(0 -> 150% at 50% 62%)` 1s `power3.inOut`; then the gate is removed, scroll unlocks
 * and the hero intro runs (title words slide in from the sides, can scales in with back.out(1.6)).
 */
import gsap from 'gsap';
import { unlock } from './scroll.js';
import { introHeroCan } from './can.js';
import { reduced } from './state.js';

export function initGate() {
  const gate = document.getElementById('gate');
  document.body.classList.add('locked');
  document.getElementById('enter').addEventListener('click', () => {
    const done = () => { gate.remove(); unlock(); intro(); };
    if (reduced) return done();
    gsap.to('#gate > :not(.gate-wipe)', { opacity: 0, duration: 0.3 });
    gsap.to('#gateWipe', { clipPath: 'circle(150% at 50% 62%)', duration: 1, ease: 'power3.inOut', onComplete: done });
  }, { once: true });
}

function intro() {
  introHeroCan();
  if (reduced) return;
  gsap.from('.w1', { xPercent: -120, duration: 1.1, ease: 'power4.out' });
  gsap.from('.w2', { xPercent: 120, duration: 1.1, ease: 'power4.out' });
  gsap.from('.tag, .hero-arrow, .hero-spin, .hero-hint', { opacity: 0, scale: 0.6, duration: 0.8, ease: 'back.out(2)', stagger: 0.12, delay: 0.5 });
}
