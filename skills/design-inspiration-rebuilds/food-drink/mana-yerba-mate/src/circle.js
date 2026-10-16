/**
 * circle.js - pinned section: four cards sit on a huge circle whose centre is below the viewport.
 * The ring rotates 275 deg (scrubbed over +=450%), cards stay tangent to it so they tilt as they pass.
 * Card angles 0/55/110/165 deg, start rotation +55, end -220. A green arc scales in at the top (scaleY 0 -> 1).
 */
import gsap from 'gsap';
import { reduced } from './scroll.js';

export function initCircle() {
  const cards = [...document.querySelectorAll('.cc')];
  if (reduced) return;
  cards.forEach((c, i) => gsap.set(c, { rotation: i * 55 }));
  const tl = gsap.timeline({ scrollTrigger: { trigger: '#circle', start: 'top top', end: '+=450%', pin: true, scrub: 0.8 } });
  tl.fromTo('#arc', { scaleY: 0 }, { scaleY: 1, duration: 0.12, ease: 'power2.out' }, 0)
    .fromTo('#ring', { rotation: 55 }, { rotation: -220, duration: 1, ease: 'none' }, 0)
    .to('#arc', { scaleY: 0, duration: 0.12, ease: 'power2.in' }, 0.88);
}
