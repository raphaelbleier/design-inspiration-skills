// Technique: SplitText line masks. Each line of the intro paragraph slides up from a clipped box
// (yPercent 110 -> 0) as it reaches 85% of the viewport; the project meta rows fade up with the same ease.
// Values: 1s expo.out, stagger .08.
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(SplitText, ScrollTrigger);

export function initReveals() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('.split').forEach((el) => {
    SplitText.create(el, {
      type: 'lines', mask: 'lines', autoSplit: true,
      onSplit: (self) => gsap.from(self.lines, {
        yPercent: 110, duration: 1, ease: 'expo.out', stagger: 0.08,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      }),
    });
  });
  gsap.utils.toArray('.meta, .now, .play p').forEach((el) => gsap.from(el, {
    y: 24, autoAlpha: 0, duration: 1, ease: 'expo.out',
    scrollTrigger: { trigger: el, start: 'top 92%', once: true },
  }));
}
