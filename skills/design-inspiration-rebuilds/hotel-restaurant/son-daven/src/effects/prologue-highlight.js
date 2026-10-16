/*
 * "READING LIGHT" quote (prologue).
 * SplitText chars start at opacity 0.1; one scrubbed ScrollTrigger
 * (start "top 75%", end "bottom 50%", scrub: true) drives a staggered tween,
 * each char 0.4s "Out", stagger 0.1 -> a soft wave of text lighting up behind
 * the scroll position instead of a hard per-char switch.
 */
import { gsap, SplitText, reduced } from '../core/gsap.js';
import { $$ } from '../core/dom.js';

export function initHighlight() {
  if (reduced) return;
  $$('[data-highlight]').forEach((el) => {
    SplitText.create(el, {
      type: 'words,chars',
      autoSplit: true,
      onSplit(self) {
        return gsap.fromTo(self.chars, { opacity: 0.1 }, {
          opacity: 1, duration: 0.4, ease: 'Out', stagger: 0.1,
          scrollTrigger: { trigger: el, start: 'top 75%', end: 'bottom 50%', scrub: true },
        });
      },
    });
  });
}
