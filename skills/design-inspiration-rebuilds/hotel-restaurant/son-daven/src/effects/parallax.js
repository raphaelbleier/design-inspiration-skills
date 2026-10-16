/*
 * PARALLAX (all ease:none, scrubbed to the scroll).
 *   [data-parallax="img"]       child <img> yPercent -20 -> 20, start "top bottom"
 *   [data-parallax="img-out"]   -10 -> 30, start "top 50%", end "bottom top"
 *   [data-parallax="ctn-down"]  -10 -> 10      [data-parallax="ctn-up"]  10 -> -10
 *   [data-parallax="scale"]     scale 1 -> 1.25 from center bottom, scrub 1 (about image)
 *   [data-parallax="drift"]     children of a heading slide on x, staggered
 *                               ([5,-1,-5]% -> [-5,1,5]%), scrub 1 (line sliding)
 * Images are oversized by 40% in CSS so the yPercent travel never shows an edge.
 */
import { gsap, reduced } from '../core/gsap.js';
import { $$ } from '../core/dom.js';

export function initParallax() {
  if (reduced) return;
  $$('[data-parallax]').forEach((el) => {
    const kind = el.dataset.parallax;
    const base = { trigger: el, scrub: true, start: 'top bottom', end: 'bottom top' };
    if (kind === 'img') gsap.fromTo(el.querySelector('img'), { yPercent: -20 }, { yPercent: 20, ease: 'none', scrollTrigger: base });
    else if (kind === 'img-out') gsap.fromTo(el.querySelector('img'), { yPercent: -10 }, { yPercent: 30, ease: 'none', scrollTrigger: { ...base, start: 'top 50%' } });
    else if (kind === 'ctn-down') gsap.fromTo(el, { yPercent: -10 }, { yPercent: 10, ease: 'none', scrollTrigger: base });
    else if (kind === 'ctn-up') gsap.fromTo(el, { yPercent: 10 }, { yPercent: -10, ease: 'none', scrollTrigger: base });
    else if (kind === 'scale') gsap.fromTo(el, { scale: 1, transformOrigin: 'center bottom' }, { scale: 1.25, ease: 'none', scrollTrigger: { ...base, scrub: 1 } });
    else if (kind === 'drift') {
      const from = [5, -1, -5], to = [-5, 1, 5];
      [...el.children].forEach((c, i) =>
        gsap.fromTo(c, { xPercent: from[i % 3] }, { xPercent: to[i % 3], ease: 'none', scrollTrigger: { ...base, scrub: 1 } })
      );
    }
  });
}
