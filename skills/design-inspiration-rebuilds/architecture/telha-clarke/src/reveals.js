/**
 * reveals.js - statement lines: SplitText lines inside overflow masks, yPercent 105 -> 0, power3.out 1.1s, stagger .1,
 * start 'top 85%'. Section labels (.row) fade/slide .8s power2.out.
 */
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reduced } from './scroll.js';

gsap.registerPlugin(SplitText, ScrollTrigger);

export function initReveals() {
  if (reduced) return;
  document.querySelectorAll('.split').forEach((el) => {
    SplitText.create(el, { type: 'lines', mask: 'lines', autoSplit: true, onSplit: (self) =>
      gsap.from(self.lines, { yPercent: 105, duration: 1.1, ease: 'power3.out', stagger: 0.1,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true } }) });
  });
  gsap.utils.toArray('.row.label, .small, .work-meta').forEach((el) =>
    gsap.from(el, { opacity: 0, y: 14, duration: 0.8, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 92%', once: true } }));
  gsap.utils.toArray('.studio-img, .method-img').forEach((el) =>
    gsap.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'power3.inOut',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true } }));
}
