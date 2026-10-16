/**
 * hero.js - load sequence and scroll parallax.
 * Title: SplitText chars, each in an overflow mask, yPercent 105 -> 0, stagger .035, 1.4s expo.out (= cubic-bezier(.14,1,.34,1)).
 * Photo: scale 1.18 -> 1 over 2s expo.out; scrubbed yPercent 0 -> 18 while the hero leaves.
 * Chip (video preview pill) pops in after the title; scroll button scrolls to #intro.
 */
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reduced, scrollToEl } from './scroll.js';

gsap.registerPlugin(SplitText, ScrollTrigger);

export function initHero() {
  const title = document.querySelector('.hero-title');
  document.querySelector('.scroll-dot').addEventListener('click', () => scrollToEl('#intro'));
  if (reduced) return;

  const split = new SplitText(title, { type: 'words,chars', wordsClass: 'wd', charsClass: 'ch', mask: 'chars' });
  const tl = gsap.timeline({ delay: 0.15 });
  tl.from('.hero-media', { scale: 1.18, duration: 2, ease: 'expo.out' }, 0)
    .from(split.chars, { yPercent: 105, duration: 1.4, ease: 'expo.out', stagger: 0.035 }, 0.1)
    .from('.hero-chip', { scale: 0, duration: 0.9, ease: 'expo.out' }, 0.9)
    .from('.scroll-dot', { scale: 0, duration: 0.9, ease: 'expo.out' }, 1.0);

  gsap.to('.hero-media', {
    yPercent: 18, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });
}
