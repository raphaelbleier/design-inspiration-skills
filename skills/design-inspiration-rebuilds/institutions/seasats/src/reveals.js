/**
 * reveals.js - text and image reveals.
 * .split: words wrapped in overflow masks, inner span yPercent 110 -> 0, 1s power3.out, stagger .06, start 'top 85%'.
 * .m-img: card images clip-path inset(100% 0 0 0) -> inset(0) 1s power2.inOut while inner scale 1.2 -> 1 over 1.4s.
 * Footer wordmark rises with scrub.
 */
import gsap from 'gsap';
import { reduced } from './scroll.js';

export function initReveals() {
  if (reduced) return;
  gsap.utils.toArray('.split').forEach((el) => {
    el.innerHTML = el.textContent.split(/\s+/).map((w) => `<span class="w"><span>${w}</span></span>`).join(' ');
    gsap.from(el.querySelectorAll('.w > span'), { yPercent: 110, duration: 1, ease: 'power3.out', stagger: 0.06,
      scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
  });
  gsap.utils.toArray('.m-grid article').forEach((a, i) => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: a, start: 'top 85%', once: true }, delay: i * 0.1 });
    tl.fromTo(a.querySelector('.m-img'), { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1, ease: 'power2.inOut' })
      .to(a.querySelector('img'), { scale: 1, duration: 1.4, ease: 'power2.out' }, 0)
      .from(a.querySelectorAll('h3, p'), { y: 20, opacity: 0, duration: 0.7, ease: 'power2.out', stagger: 0.1 }, 0.5);
  });
  gsap.from('.mark', { yPercent: 60, ease: 'none', scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'bottom bottom', scrub: true } });
}
