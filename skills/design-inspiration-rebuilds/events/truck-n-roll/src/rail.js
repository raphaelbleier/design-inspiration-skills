/**
 * rail.js - use-case cards. Desktop: section pinned for one rail length, rail translates
 * x 0 -> -(scrollWidth - viewport) with scrub 0.5, ease none. Mobile: stacked, no pin.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reduced } from './scroll.js';

export function rail() {
  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', () => {
    if (reduced) { document.querySelector('.uc__pin').style.overflowX = 'auto'; return; }
    const r = document.querySelector('.uc__rail');
    const dist = () => r.scrollWidth - innerWidth + 16;
    gsap.to(r, { x: () => -dist(), ease: 'none',
      scrollTrigger: { trigger: '.uc', start: 'top top', end: () => '+=' + dist(), pin: '.uc__pin', scrub: 0.5, invalidateOnRefresh: true } });
  });
}
