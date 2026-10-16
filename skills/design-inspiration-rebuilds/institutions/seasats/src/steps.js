/**
 * steps.js - one pinned stage, three acts (Deploy / Detect / React), scrubbed on a 600vh track.
 * Each act: background photo crossfades (opacity, 'none' ease), headline rises yPercent 100 -> 0 behind the
 * stage, the 4-column feature row fades up (y 30 -> 0, stagger .1). Previous act leaves with opacity 0.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reduced } from './scroll.js';

export function initSteps() {
  if (reduced) return;
  const bg = gsap.utils.toArray('.step-bg img');
  const heads = gsap.utils.toArray('.step-heads h2');
  const cols = gsap.utils.toArray('.step-cols ul');
  const tl = gsap.timeline({ scrollTrigger: { trigger: '.steps', start: 'top top', end: 'bottom bottom', scrub: 0.6, pin: '.steps-pin', anticipatePin: 1 } });
  gsap.set(heads, { opacity: 0 });
  heads.forEach((h, i) => {
    const t = i * 3;
    if (i) tl.to(bg[i], { opacity: 1, duration: 0.8, ease: 'none' }, t - 0.4);
    tl.fromTo(h, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, t);
    tl.fromTo(cols[i], { opacity: 0 }, { opacity: 1, duration: 0.01 }, t + 0.2);
    tl.fromTo(cols[i].children, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', stagger: 0.1 }, t + 0.2);
    if (i < heads.length - 1) {
      tl.to([h, cols[i]], { opacity: 0, duration: 0.5, ease: 'power2.in' }, t + 2.4);
    }
  });
  tl.to({}, { duration: 0.6 });
}
