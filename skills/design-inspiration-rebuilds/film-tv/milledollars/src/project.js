/* Project page: hero cover (100vh), then a pinned horizontal storyboard row.
   Pin: trigger .sb, scrub 1, row translates from 0 to -(rowWidth - viewport); each sheet has a paper shadow. */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reduced } from './scroll.js';

export function initProject() {
  const row = document.querySelector('.sb-row');
  if (!row || reduced) return;
  const dist = () => row.scrollWidth - innerWidth + innerWidth * 0.08;
  gsap.to(row, {
    x: () => -dist(), ease: 'none',
    scrollTrigger: { trigger: '.sb', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true },
  });
}
