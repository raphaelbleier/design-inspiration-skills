/*
 * FOOTER REVEAL. As the footer enters, .footer-w scales 2 -> 1 from "center 10%" and
 * .footer-w_bg scales 0.75 -> 1, both scrubbed (ease none) between the footer's top
 * touching the viewport bottom and its top reaching 20%. The page seems to settle
 * into its last screen instead of just ending.
 */
import { gsap, reduced } from '../core/gsap.js';
import { $ } from '../core/dom.js';

export function initFooterReveal() {
  if (reduced) return;
  const st = { trigger: '.footer', start: 'top bottom', end: 'top 20%', scrub: true };
  gsap.fromTo('.footer-w', { scale: 2, transformOrigin: '50% 10%' }, { scale: 1, ease: 'none', scrollTrigger: st });
  gsap.fromTo('.footer-w_bg', { scale: 0.75 }, { scale: 1, ease: 'none', scrollTrigger: st });
}
