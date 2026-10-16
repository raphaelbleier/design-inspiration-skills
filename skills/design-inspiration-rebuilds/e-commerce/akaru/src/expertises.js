// Technique: pinned horizontal scroll. Five full-width colour panels translate left
// (xPercent -100*(n-1), scrub 1 for lag-smoothing, ease none); the bottom index highlights the current panel.
// Desktop and mobile both pin; end = panel count * 100% scroll distance.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initExpertises(reduce) {
  const track = document.querySelector('.exp-track');
  const items = gsap.utils.toArray('.exp-nav li');
  const n = items.length;
  items[0].classList.add('on');
  if (reduce) { track.parentElement.style.overflowX = 'auto'; return; }
  gsap.to(track, {
    x: () => -(track.scrollWidth - innerWidth), ease: 'none',
    scrollTrigger: {
      trigger: '.expertises', pin: true, scrub: 1, start: 'top top',
      end: () => '+=' + (track.scrollWidth - innerWidth) * 1.2, invalidateOnRefresh: true,
      onUpdate: (s) => items.forEach((li, i) => li.classList.toggle('on', i === Math.min(n - 1, Math.round(s.progress * (n - 1))))),
    },
  });
}
