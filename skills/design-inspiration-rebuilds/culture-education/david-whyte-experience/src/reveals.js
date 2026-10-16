/* Technique: SplitText line masks. Headings rise out of a clipped line box; poem lines fade in on scrub;
   hero tiles drift at different speeds (parallax, scrub: true).
   Values: heading yPercent 105 -> 0, 1.3s power3.out, stagger .12, start 'top 88%'; poem line opacity .12 -> 1;
   tiles y = data-speed * 100vh across the whole page. */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { reduced } from './scroll.js';

gsap.registerPlugin(ScrollTrigger, SplitText);

export function initReveals() {
  if (reduced) return;
  document.fonts.ready.then(() => {
    document.querySelectorAll('[data-reveal]').forEach((el) => {
      const split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'ln' });
      gsap.from(split.lines, { yPercent: 105, duration: 1.3, ease: 'power3.out', stagger: 0.12,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });
    document.querySelectorAll('[data-scrub] p').forEach((p) => {
      const split = SplitText.create(p, { type: 'lines', linesClass: 'ln' });
      gsap.fromTo(split.lines, { opacity: 0.12 }, { opacity: 1, stagger: 0.25, ease: 'none',
        scrollTrigger: { trigger: p, start: 'top 75%', end: 'bottom 45%', scrub: true } });
    });
    ScrollTrigger.refresh();
  });

  document.querySelectorAll('.tile').forEach((t) => {
    gsap.to(t, { y: () => parseFloat(t.dataset.speed) * innerHeight * 4, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  });
}
