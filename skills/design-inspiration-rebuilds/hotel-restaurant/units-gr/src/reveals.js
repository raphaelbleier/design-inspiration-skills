/**
 * reveals.js - text reveals.
 * Headings [data-split]: SplitText lines in a mask, yPercent 100 -> 0, 1.2s expo.out, stagger .1,
 * start 'top 85%'. Hero lines run on load instead of scroll. [data-fade] blocks: y 24 -> 0 + opacity,
 * 1.2s expo.out. Cards ease up with y 60 -> 0 (1.2s expo.out) when they enter at 90%.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { reduced } from './scroll.js';

gsap.registerPlugin(ScrollTrigger, SplitText);

export function initReveals() {
  if (reduced) return;
  document.querySelectorAll('[data-split]').forEach((el) => {
    const inHero = !!el.closest('.hero');
    SplitText.create(el, {
      type: 'lines', mask: 'lines', autoSplit: true,
      onSplit: (self) => gsap.from(self.lines, {
        yPercent: 105, duration: 1.2, ease: 'expo.out', stagger: 0.1, delay: inHero ? 0.5 : 0,
        scrollTrigger: inHero ? null : { trigger: el, start: 'top 85%', once: true },
      }),
    });
  });
  gsap.from('[data-fade]', { y: 24, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.12, delay: 0.9 });
  gsap.utils.toArray('.loc > *, .units > *, .community > *, .values > *, .band, .wide-cta').forEach((el) => {
    gsap.from(el, { y: 60, opacity: 0, duration: 1.2, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
  });
}
