// Technique: scroll-scrubbed curtain. As the manifesto section rises over the fixed canvas,
// a black veil fades to .65 and the row drifts up 12vh; the "discover" card flips black -> white
// at the same moment. Manifesto lines: SplitText lines, yPercent 100 -> 0 in a masked line,
// .9s power3.out, stagger .06, start 'top 70%'.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

export function initReveals(state) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  ScrollTrigger.create({
    trigger: '.manifesto', start: 'top bottom', end: 'top top', scrub: true,
    onUpdate: (self) => {
      gsap.set('.dim', { opacity: self.progress * 0.65 });
      state.lift = self.progress * state.h * 0.12;
      document.body.classList.toggle('past-hero', self.progress > 0.5);
    },
  });
  if (reduce) return;
  document.fonts.ready.then(() => {
    const split = SplitText.create('.mf', { type: 'lines', mask: 'lines', linesClass: 'ln' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 0.9, ease: 'power3.out', stagger: 0.06,
      scrollTrigger: { trigger: '.mf', start: 'top 70%', once: true },
    });
  });
}
