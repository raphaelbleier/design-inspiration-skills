/**
 * reveals.js - data-attribute reveal presets.
 *
 *   data-reveal="headline"  SplitText lines, each line opens with an ellipse clip-path
 *                           (1.5s power2.inOut, stagger .15)
 *   data-reveal="body"      lime highlighter wipe per line (.6s power2.out)
 *   data-reveal="image"     ellipse clip-path reveal on the wrapper (.8s) + inner scale
 *
 * Optional: data-delay="0.2". Everything fires once via ScrollTrigger (start: top 85%).
 * prefers-reduced-motion: elements are simply left visible.
 */
import { gsap, ScrollTrigger, reduced } from './scroll.js';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(SplitText);

const ELLIPSE_HIDDEN = 'ellipse(75% 0% at 50% 100%)';   // flat sliver on the baseline
const ELLIPSE_SHOWN = 'ellipse(75% 130% at 50% 100%)';  // big enough to cover the line box

const presets = {
  headline(el, delay) {
    const split = SplitText.create(el, { type: 'lines', mask: 'lines', autoSplit: true, linesClass: 'rv-line',
      onSplit(self) {
        return gsap.fromTo(self.lines,
          { clipPath: ELLIPSE_HIDDEN, yPercent: 35 },
          { clipPath: ELLIPSE_SHOWN, yPercent: 0, duration: 1.5, ease: 'power2.inOut', stagger: 0.15, delay,
            scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
      } });
    return split;
  },

  body(el, delay) {
    return SplitText.create(el, { type: 'lines', autoSplit: true, linesClass: 'rv-hl',
      onSplit(self) {
        // each line = text hidden behind a lime bar; bar grows, text shows, bar leaves
        gsap.set(self.lines, { '--bar': 0, '--barx': 0, color: 'transparent' });
        return gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 88%', once: true }, delay })
          .to(self.lines, { '--bar': 1, duration: 0.6, ease: 'power2.out', stagger: 0.08 })
          .set(self.lines, { color: 'inherit' }, '<+0.3')
          .to(self.lines, { '--barx': 1, duration: 0.6, ease: 'power2.out', stagger: 0.08 }, '>-0.3');
      } });
  },

  image(el, delay) {
    const img = el.querySelector('img');
    gsap.set(el, { clipPath: 'ellipse(0% 0% at 50% 50%)' });
    if (img) gsap.set(img, { scale: 1.35 });
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 88%', once: true }, delay });
    tl.to(el, { clipPath: 'ellipse(80% 80% at 50% 50%)', duration: 0.8, ease: 'power2.out' });
    if (img) tl.to(img, { scale: 1, duration: 1.1, ease: 'power2.out' }, 0);
  },
};

export function initReveals(root = document) {
  if (reduced) return;
  root.querySelectorAll('[data-reveal]').forEach((el) => {
    const fn = presets[el.dataset.reveal];
    if (fn) fn(el, parseFloat(el.dataset.delay || 0));
  });
}
