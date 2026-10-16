/**
 * living.js - pinned horizontal bento track (desktop only, > 900px).
 * ScrollTrigger pins the wrapper (red marquee + track) for (trackWidth - viewport) px and scrubs x with scrub: 1 (1s lag),
 * ease 'none'; anticipatePin 1. Below 900px (or reduced motion) the cards simply stack.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reduced } from './scroll.js';

export function initLiving() {
  if (reduced) return;
  const wrap = document.querySelector('.pin-wrap');
  const track = document.getElementById('track');
  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', () => {
    const dist = () => Math.max(0, track.scrollWidth - wrap.clientWidth);
    gsap.to(track, { x: () => -dist(), ease: 'none',
      scrollTrigger: { trigger: wrap, start: 'top 22px', end: () => '+=' + dist(), pin: true,
        scrub: 1, anticipatePin: 1, invalidateOnRefresh: true } });
  });
}
