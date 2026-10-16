/**
 * reveals.js - text, image and parallax reveals.
 * Text: SplitText lines inside overflow masks; each line yPercent 105 -> 0, 1.4s expo.out, stagger .09,
 *   trigger "top 85%", once.
 * Image: clip-path inset(100% 0 0 0) -> inset(0) 1.3s expo.out while inner img scale 1.25 -> 1.
 * Parallax: inner image moves yPercent -8 -> 8 scrubbed over its own scroll range.
 * Cards: fade/translate 40px up, stagger .12.
 */
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reduced } from './scroll.js';

gsap.registerPlugin(SplitText, ScrollTrigger);

export function initReveals() {
  if (reduced) return;

  document.querySelectorAll('.split').forEach((el) => {
    SplitText.create(el, {
      type: 'lines', mask: 'lines', autoSplit: true, linesClass: 'ln',
      onSplit: (self) => gsap.from(self.lines, {
        yPercent: 105, duration: 1.4, ease: 'expo.out', stagger: 0.09,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      }),
    });
  });

  document.querySelectorAll('.img').forEach((el) => {
    const img = el.querySelector('img');
    gsap.from(el, { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    gsap.from(img, { scale: 1.25, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    gsap.fromTo(img, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  document.querySelectorAll('.cards').forEach((g) => {
    gsap.from(g.children, { y: 40, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.12, scrollTrigger: { trigger: g, start: 'top 85%', once: true } });
  });

  gsap.to('.cta__bg img', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.to('.marq__t', { xPercent: -50, ease: 'none', scrollTrigger: { trigger: '.marq', start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
}
