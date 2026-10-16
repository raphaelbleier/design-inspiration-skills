// Expertise cassettes. Technique: position: sticky (top 15.5vh) so each cassette stacks over the last;
// as the next one arrives the previous scales to .94 and dims (scrub). Reels rotate 360deg per section.
import { gsap } from 'gsap';
import { reduced } from './scroll.js';

export function initExpertises() {
  if (reduced) return;
  const cards = gsap.utils.toArray('.cassette');
  cards.forEach((card, i) => {
    gsap.to(card.querySelector('.reel'), { rotate: 360, ease: 'none',
      scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true } });
    const next = cards[i + 1];
    if (!next) return;
    gsap.to(card, { scale: 0.94, filter: 'brightness(.7)', ease: 'none',
      scrollTrigger: { trigger: next, start: 'top 80%', end: 'top 20%', scrub: true } });
  });
}
