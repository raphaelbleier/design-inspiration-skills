/* Intro after the bloom: white screen, a three-line statement, then three summary blocks whose
   lines light up one by one (opacity .14 -> 1), ending on a big green wordmark.
   Technique: #intro 640vh + sticky child, one scrubbed timeline on a 0-100 scale (scrub .6).
   Copy lines rise out of an overflow:hidden mask (yPercent 105 -> 0). */
import gsap from 'gsap';
import { reduced } from './scroll.js';

export function initIntro() {
  if (reduced) return;
  const lines = gsap.utils.toArray('.intro-copy p');
  lines.forEach((p) => { p.innerHTML = `<span>${p.innerHTML}</span>`; });
  const spans = lines.map((p) => p.firstChild);
  const tl = gsap.timeline({ defaults: { ease: 'none' },
    scrollTrigger: { trigger: '#intro', start: 'top top', end: 'bottom bottom', scrub: 0.6 } });

  tl.fromTo(spans, { yPercent: 105 }, { yPercent: 0, duration: 8, stagger: 3, ease: 'power2.out' }, 0)
    .to(spans, { yPercent: -105, duration: 6, stagger: 2 }, 18);

  const blocks = gsap.utils.toArray('.summary-block');
  const at = [[26, 50], [52, 70], [72, 86]];
  blocks.forEach((b, i) => {
    const [s, e] = at[i], ps = b.querySelectorAll('p');
    tl.set(b, { visibility: 'visible' }, s)
      .to(ps, { opacity: 1, duration: 4, stagger: (e - s - 10) / ps.length }, s)
      .to(b, { opacity: 0, duration: 3 }, e)
      .set(b, { visibility: 'hidden' }, e + 3);
  });
  tl.fromTo('.intro-logo', { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 10, ease: 'power2.out' }, 88);
}
