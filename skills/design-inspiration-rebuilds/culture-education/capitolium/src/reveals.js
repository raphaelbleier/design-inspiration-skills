/* Technique: SplitText line masks + arch image wipes, all one-shot on enter.
   Text: lines yPercent 105 -> 0 inside a line mask, 1.1s power3.out, stagger .1, start 'top 88%'.
   Images: clip-path inset(100% 0 0 0) -> inset(0), 1.3s cubic-bezier(.65,.05,0,1), inner scale 1.3 -> 1.
   Shirts rise 120px with the plinth behind, stagger .2. */
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { reduced } from './scroll.js';

export function initReveals() {
  if (reduced) return;
  gsap.registerPlugin(SplitText);
  const E = 'cubic-bezier(.65,.05,0,1)';

  document.querySelectorAll('.mega, .h3, .body, .outro, .intro__kick').forEach((el) => {
    if (el.closest('.band') || el.closest('.panel')) return;      // panels sit inside the pinned track
    SplitText.create(el, { type: 'lines', mask: 'lines', autoSplit: true, onSplit: (s) =>
      gsap.from(s.lines, { yPercent: 105, duration: 1.1, ease: 'power3.out', stagger: 0.1,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true } }) });
  });

  document.querySelectorAll('.split__img, .card__img, .m, .stad__hero').forEach((box) => {
    gsap.from(box, { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.3, ease: E, scrollTrigger: { trigger: box, start: 'top 88%', once: true } });
    gsap.from(box.querySelector('img'), { scale: 1.3, duration: 1.6, ease: 'power2.out', scrollTrigger: { trigger: box, start: 'top 88%', once: true } });
  });

  gsap.from('.shirt > img', { y: 120, opacity: 0, duration: 1.4, ease: 'power3.out', stagger: 0.2,
    scrollTrigger: { trigger: '.shirts__row', start: 'top 85%', once: true } });
  gsap.from('.plinth', { y: 60, opacity: 0, duration: 1.2, ease: 'power3.out', stagger: 0.2,
    scrollTrigger: { trigger: '.shirts__row', start: 'top 85%', once: true } });
}
