/**
 * reveals.js - line-mask text reveals (.lines) and image reveals (.ph).
 * Text: SplitText lines with mask:'lines', each line rises yPercent 105 -> 0,
 *       1.1s power3.out, stagger .08, starts at top 88%, once.
 * Images: clip-path inset(100% 0 0 0) -> inset(0), inner image scale 1.25 -> 1 (1.3s power3.out).
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { reduced } from './scroll.js';

gsap.registerPlugin(ScrollTrigger, SplitText);

export function initReveals() {
  if (reduced) return;
  document.querySelectorAll('.lines').forEach((el) => {
    const targets = el.classList.contains('body') ? [...el.children] : [el];
    targets.forEach((t) => {
      SplitText.create(t, {
        type: 'lines', mask: 'lines', masksClass: 'mk', autoSplit: true,
        onSplit: (self) => gsap.from(self.lines, {
          yPercent: 105, duration: 1.1, ease: 'power3.out', stagger: 0.08,
          scrollTrigger: { trigger: t, start: 'top 88%', once: true },
        }),
      });
    });
  });
  document.querySelectorAll('.ph').forEach((ph) => {
    gsap.fromTo(ph, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'power3.out',
      scrollTrigger: { trigger: ph, start: 'top 88%', once: true } });
    gsap.from(ph.querySelector('img'), { scale: 1.25, duration: 1.3, ease: 'power3.out',
      scrollTrigger: { trigger: ph, start: 'top 88%', once: true } });
  });
}
