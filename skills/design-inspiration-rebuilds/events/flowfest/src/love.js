// Technique: pinned (CSS sticky) section, scroll-scrubbed. The big "Marmalade Love" word is
// revealed by tweet cards that fly in tilted and stack; the word slides apart as cards arrive.
// Values: section 330vh, scrub .6; each card y 140vh -> 0, rotate +-8 -> +-2, stagger by 1/3 of the range; words move +-12vw.
import { gsap } from 'gsap';

export function initLove(reduced) {
  const cards = gsap.utils.toArray('.tweet');
  if (reduced) { gsap.set(cards, { y: (i) => i * 14, rotate: (i) => (i - 1) * 2 }); return; }
  const tl = gsap.timeline({ defaults: { ease: 'none' },
    scrollTrigger: { trigger: '.love', start: 'top top', end: 'bottom bottom', scrub: 0.6 } });
  gsap.set(cards, { y: '140vh', rotate: (i) => (i % 2 ? 8 : -8) });
  cards.forEach((c, i) => {
    tl.to(c, { y: i * 18, rotate: (i - 1) * 2.5, ease: 'power2.out', duration: 1 }, i * 0.9);
  });
  tl.to('.lw1', { x: '-12vw', duration: 2.6 }, 0).to('.lw2', { x: '12vw', duration: 2.6 }, 0);
}
