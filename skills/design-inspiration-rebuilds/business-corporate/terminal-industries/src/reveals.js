/**
 * reveals.js - headline + card reveals.
 * Headlines: SplitText lines, each line clipped; inner span yPercent 105 -> 0,
 *   1.1s power4.out, stagger .08, start 'top 85%', once.
 * Cards: y 60 + opacity 0 -> 1, 1s power3.out, stagger .12 per row.
 */
import { gsap, ScrollTrigger, SplitText, reduced } from './scroll.js';

export function initReveals() {
  if (reduced) return;
  document.querySelectorAll('[data-split]').forEach((el) => {
    SplitText.create(el, {
      type: 'lines', linesClass: 'line', autoSplit: true,
      onSplit(self) {
        self.lines.forEach((l) => { l.innerHTML = `<span>${l.innerHTML}</span>`; });
        return gsap.fromTo(self.lines.map((l) => l.firstChild), { yPercent: 105 },
          { yPercent: 0, duration: 1.1, ease: 'power4.out', stagger: 0.08,
            scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
      },
    });
  });
  ScrollTrigger.batch('[data-card]', {
    start: 'top 88%', once: true,
    onEnter: (els) => gsap.fromTo(els, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: 0.12 }),
  });
  gsap.set('[data-card]', { opacity: 0 });
}
