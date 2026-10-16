/* Technique: scroll-scrubbed word opacity for the statement (each word .14 -> 1 as the paragraph crosses the
   viewport, start "top 80%" end "bottom 45%", stagger spread over the scrub); big serif headline lines slide
   up out of an overflow mask (yPercent 105 -> 0, .9s power3.out, stagger .12). */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reduced } from './scroll.js';

export function initReveals() {
  document.querySelectorAll('[data-split]').forEach((el) => {
    el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ');
    if (reduced) { gsap.set(el.querySelectorAll('.w'), { opacity: 1 }); return; }
    gsap.to(el.querySelectorAll('.w'), { opacity: 1, ease: 'none', stagger: 0.5,
      scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true } });
  });

  document.querySelectorAll('.giant h2 span').forEach((s) => { s.innerHTML = `<i>${s.textContent}</i>`; });
  if (!reduced) {
    gsap.from('.giant h2 span > i', { yPercent: 105, duration: 0.9, ease: 'power3.out', stagger: 0.12,
      scrollTrigger: { trigger: '.giant', start: 'top 70%', once: true } });
    gsap.from('.giant-sparks', { rotate: -90, scale: 0.4, opacity: 0, duration: 1.2, ease: 'power3.out',
      scrollTrigger: { trigger: '.giant', start: 'top 70%', once: true } });
    // partner rows slide their rule in from the left
    gsap.utils.toArray('.giving .row').forEach((r) =>
      gsap.from(r, { clipPath: 'inset(0 100% 0 0)', duration: 1, ease: 'power3.inOut',
        scrollTrigger: { trigger: r, start: 'top 85%', once: true } }));
  }
}
