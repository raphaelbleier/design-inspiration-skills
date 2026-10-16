/* Text reveal: SplitText lines blur in from below.
   from { opacity 0, blur 12px, yPercent 40 } -> 1.1s power3.out, stagger .08, start 'top 88%'. */
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reduced } from './scroll.js';

gsap.registerPlugin(SplitText, ScrollTrigger);

export function initReveals() {
  if (reduced) return;
  const run = () => document.querySelectorAll('.split').forEach((el) => {
    const self = SplitText.create(el, { type: 'lines', autoSplit: true, mask: 'lines',
      onSplit: (s) => gsap.from(s.lines, { yPercent: 40, opacity: 0, filter: 'blur(12px)',
        duration: 1.1, ease: 'power3.out', stagger: 0.08,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true } }) });
    return self;
  });
  document.fonts.ready.then(run);
}
