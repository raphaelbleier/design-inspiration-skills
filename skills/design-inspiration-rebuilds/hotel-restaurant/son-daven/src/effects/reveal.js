/*
 * SCROLL REVEALS: four primitives, applied by attribute: data-reveal="h|p|ctn|line|card".
 * Every one fires from ScrollTrigger start "top bottom", once (cards replay).
 *
 *  h     SplitText words. From yPercent picked per word from [-150, 75, -75, 150],
 *        scale 0, opacity 0  ->  0 / 1 / 1. 1.2s "Out", delay 0.2 + index*0.05,
 *        stagger 0.025 from:"random". The random scatter + scale pop is the look.
 *  p     SplitText lines inside a line mask. From yPercent 250, opacity 0. 1.2s Out,
 *        stagger 0.05, delay 0.025*index.
 *  ctn   whole container: opacity 0, yPercent 100 -> 0 / 1. 1.2s Out, batched 0.05.
 *  line  hairline wipe: clip-path inset(0 100% -1px 0) -> inset(0 0 -1px 0), 1.2s Out.
 *  card  from {scale 0, rotateY -90, rotate -25}, 1.2s Out, parent perspective 1000,
 *        toggleActions "play none none reset".
 *
 * autoSplit re-splits on resize/font load and re-syncs the animation, so line
 * breaks are always the real ones. Initial hidden states come from gsap.from()
 * with immediateRender, so the page is fully readable without JS.
 */
import { gsap, ScrollTrigger, SplitText, reduced } from '../core/gsap.js';
import { $$ } from '../core/dom.js';

const WORD_FROM = [-150, 75, -75, 150];
const st = (el, extra = {}) => ({ trigger: el, start: 'top bottom', once: true, ...extra });

function words(el, i) {
  SplitText.create(el, {
    type: 'words',
    autoSplit: true,
    onSplit(self) {
      self.words.forEach((w, n) => (w.style.display = 'inline-block'));
      return gsap.from(self.words, {
        yPercent: (n) => WORD_FROM[(n + i) % 4],
        scale: 0,
        opacity: 0,
        duration: 1.2,
        ease: 'Out',
        delay: 0.2 + i * 0.05,
        stagger: { each: 0.025, from: 'random' },
        scrollTrigger: st(el),
      });
    },
  });
}

function lines(el, i) {
  SplitText.create(el, {
    type: 'lines',
    mask: 'lines',
    autoSplit: true,
    onSplit(self) {
      return gsap.from(self.lines, {
        yPercent: 250,
        opacity: 0,
        duration: 1.2,
        ease: 'Out',
        delay: 0.025 * i,
        stagger: 0.05,
        scrollTrigger: st(el),
      });
    },
  });
}

export function initReveals(root = document) {
  if (reduced) return;
  $$('[data-reveal="h"]', root).forEach(words);
  $$('[data-reveal="p"]', root).forEach(lines);

  const ctn = $$('[data-reveal="ctn"]', root);
  gsap.set(ctn, { opacity: 0, yPercent: 100 });
  ScrollTrigger.batch(ctn, {
    start: 'top bottom',
    once: true,
    onEnter: (b) => gsap.to(b, { opacity: 1, yPercent: 0, duration: 1.2, ease: 'Out', stagger: 0.05, overwrite: true }),
  });

  $$('[data-reveal="line"]', root).forEach((el) =>
    gsap.fromTo(el, { clipPath: 'inset(0 100% -1px 0)' }, { clipPath: 'inset(0 0% -1px 0)', duration: 1.2, ease: 'Out', scrollTrigger: st(el) })
  );

  $$('[data-reveal="card"]', root).forEach((el) => {
    el.parentElement.style.perspective = '1000px';
    gsap.from(el, {
      scale: 0, rotateY: -90, rotate: -25, duration: 1.2, ease: 'Out',
      scrollTrigger: { trigger: el, start: 'top bottom', toggleActions: 'play none none reset' },
    });
  });
}
