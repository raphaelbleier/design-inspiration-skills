/**
 * hero.js - hero intro + scroll parallax.
 * Technique: cover image "appear-scale-in" (scale 1.2 -> 1, 1.8s expo.out); each headline line rises from
 * its mask with a blur-in (y 60 -> 0, blur 12px -> 0, 1.4s expo.out, stagger .18); description blur-in at .7s.
 * On scroll the two title lines drift at different speeds (-18% / -42% of hero height) and the cover moves 12%.
 * Header turns ink-coloured once the hero is left.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reduced } from './scroll.js';

export function initHero() {
  const hdr = document.getElementById('hdr');
  ScrollTrigger.create({ trigger: '.hero', start: 'bottom 60px', endTrigger: 'body', end: 'bottom bottom', toggleClass: { targets: hdr, className: 'is-solid' } });
  if (reduced) return;

  gsap.from('.hero__cover', { scale: 1.2, duration: 1.8, ease: 'expo.out' });
  gsap.from('.hl', { yPercent: 40, opacity: 0, filter: 'blur(12px)', duration: 1.4, ease: 'expo.out', stagger: 0.18, delay: 0.2 });
  gsap.from('.hero__desc', { y: 24, opacity: 0, filter: 'blur(8px)', duration: 1.2, ease: 'expo.out', delay: 0.7 });

  const sc = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
  gsap.to('.hl--1', { yPercent: -18, ease: 'none', scrollTrigger: sc });
  gsap.to('.hl--2', { yPercent: -42, ease: 'none', scrollTrigger: sc });
  gsap.to('.hero__img', { yPercent: 8, ease: 'none', scrollTrigger: sc });
}
