/**
 * reveals.js - scroll reveals. One curve everywhere: expo.out (cubic-bezier(.14,1,.34,1)).
 * Statement: SplitText lines in masks, yPercent 105 -> 0, 1.2s, stagger .08, start 'top 85%'.
 * Images: clip-path inset(100% 0 0 0) -> inset(0) 1.4s + inner scale 1.25 -> 1.
 * Pills / small labels: fade + y 10 -> 0, .8s. Client names: lines rise 0.9s, stagger .03.
 */
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reduced } from './scroll.js';

gsap.registerPlugin(SplitText, ScrollTrigger);

export function initReveals() {
  if (reduced) return;

  document.fonts.ready.then(() => {
    const s = new SplitText('.statement', { type: 'lines', mask: 'lines', linesClass: 'line' });
    gsap.from(s.lines, { yPercent: 105, duration: 1.2, ease: 'expo.out', stagger: 0.08,
      scrollTrigger: { trigger: '.statement', start: 'top 85%', once: true } });
    ScrollTrigger.refresh();
  });

  gsap.utils.toArray('.spirit-media, .card-img').forEach((el) => {
    gsap.from(el, { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.4, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    gsap.from(el.querySelector('img'), { scale: 1.25, duration: 1.6, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });

  gsap.utils.toArray('.pill, .underline:not(.services-link), .caption, .spirit-copy p').forEach((el) => {
    gsap.from(el, { autoAlpha: 0, y: 10, duration: 0.8, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
  });

  gsap.from('.client-list li', { yPercent: 60, autoAlpha: 0, duration: 0.9, ease: 'expo.out', stagger: 0.03,
    scrollTrigger: { trigger: '.client-list', start: 'top 85%', once: true } });

  gsap.from('.spirit-media img', { yPercent: -8, ease: 'none',
    scrollTrigger: { trigger: '.spirit-media', start: 'top bottom', end: 'bottom top', scrub: true } });
}
