// Showroom: the framed image starts inset 12% on the dark panel and expands to full-bleed while pinned;
// second image crossfades in at 55% of the scrub. Scrub 1 for a slight lag.
import { gsap } from 'gsap';

export function initShowroom(reduced) {
  const frame = document.querySelector('.showroom__frame');
  if (reduced) { frame.style.clipPath = 'none'; return; }
  const tl = gsap.timeline({ defaults: { ease: 'none' },
    scrollTrigger: { trigger: '.showroom__stage', start: 'top 85%', end: 'bottom 40%', scrub: 1 } });
  tl.fromTo(frame, { '--inset': '12%' }, { '--inset': '0%', duration: 1 })
    .fromTo('.showroom__frame .s2', { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.55)
    .fromTo('.showroom__title', { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.4 }, 0.3);
}
