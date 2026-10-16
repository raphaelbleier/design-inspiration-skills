// Technique: hero = split screen. Left: giant condensed wordmark. Right: vertical colour strips,
// each holding one photo. Strips slide in from the right on load (stagger .12, power4.out 1.4s),
// the hovered strip widens 36% -> 52% (.7s, cubic-bezier(.65,.05,0,1)).
// Fixed bar: pill buttons fade in once the hero's wordmark has left (scroll > 60vh).
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initHero(reduce) {
  const bar = document.querySelector('.bar');
  const strips = gsap.utils.toArray('.strip');
  ScrollTrigger.create({
    start: () => innerHeight * 0.6, end: 'max',
    onToggle: (s) => bar.classList.toggle('show', s.isActive),
  });
  if (reduce) return;
  gsap.from(strips, { xPercent: 110, duration: 1.4, ease: 'power4.out', stagger: 0.12 });
  gsap.from('.wordmark', { yPercent: 40, opacity: 0, duration: 1.2, ease: 'power3.out', delay: 0.2 });
  if (innerWidth < 900) return;
  strips.forEach((s) => {
    s.addEventListener('mouseenter', () => gsap.to(s, { width: '52%', duration: 0.7, ease: 'cubic-bezier(.65,.05,0,1)' }));
    s.addEventListener('mouseleave', () => gsap.to(s, { width: '36%', duration: 0.7, ease: 'cubic-bezier(.65,.05,0,1)' }));
  });
}
