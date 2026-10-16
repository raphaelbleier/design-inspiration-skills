// Technique: "design tool" cards. Each card has corner handles, a tag chip and a cursor-name pill.
// Columns drift at different speeds (data-lag px, scrubbed) so the grid breathes; cards pop in with a tilt.
// Values: reveal .9s back.out(1.3) from rotate +-4, y 80; parallax = data-lag px over the section; cursor pill wobbles on hover.
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';

export function initSpeakers(reduced) {
  if (reduced) return;
  document.querySelectorAll('.card').forEach((card, i) => {
    gsap.from(card, { y: 80, rotate: i % 2 ? 4 : -4, opacity: 0, duration: 0.9, ease: 'back.out(1.3)',
      scrollTrigger: { trigger: card, start: 'top 88%', once: true } });
    gsap.to(card, { y: Number(card.dataset.lag), ease: 'none',
      scrollTrigger: { trigger: '.speakers', start: 'top bottom', end: 'bottom top', scrub: true } });
    const name = card.querySelector('.cursor');
    card.addEventListener('pointerenter', () => gsap.to(name, { x: 14, y: -8, rotate: -4, duration: 0.5, ease: 'elastic.out(1,.5)' }));
    card.addEventListener('pointerleave', () => gsap.to(name, { x: 0, y: 0, rotate: 0, duration: 0.5, ease: 'power3.out' }));
  });
}

// shared: every h2 reveals line by line
export function initHeadings(reduced) {
  document.querySelectorAll('.h2[data-split]').forEach((el) => {
    const s = SplitText.create(el, { type: 'lines', mask: 'lines' });
    if (reduced) return;
    gsap.from(s.lines, { yPercent: 110, duration: 0.9, ease: 'power3.out', stagger: 0.1,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });
}
