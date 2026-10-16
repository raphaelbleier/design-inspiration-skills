/* Pinned horizontal product gallery: a flex track translates by (track width - viewport) while the
   section is pinned (sticky-style, linear scrub 1:1 with the wheel). */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reduced } from './scroll.js';

export function initHScroll() {
  if (reduced) return;
  const sec = document.querySelector('.buy');
  const track = sec.querySelector('.track');
  const dist = () => track.scrollWidth - innerWidth;
  sec.style.height = '';
  gsap.to(track, { x: () => -dist(), ease: 'none',
    scrollTrigger: { trigger: sec, start: 'top top', end: () => '+=' + (dist() + innerHeight * 0.5),
      pin: '.hpin', scrub: 0.5, invalidateOnRefresh: true } });
}
