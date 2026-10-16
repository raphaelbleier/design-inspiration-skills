// Headline reveal: SplitText lines inside overflow masks, yPercent 110 -> 0.
// Values: start 'top 85%', duration 1.1s power3.out, stagger .1, plays once.
// Quote + journal panels recolour the fixed header via ScrollTrigger toggle (dark green panel -> white logo).
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
gsap.registerPlugin(ScrollTrigger, SplitText);

export function initReveals() {
  document.fonts.ready.then(() => {
    gsap.utils.toArray('.reveal').forEach((el) => {
      SplitText.create(el, {
        type: 'lines', mask: 'lines', autoSplit: true,
        onSplit: (self) => gsap.from(self.lines, {
          yPercent: 110, duration: 1.1, ease: 'power3.out', stagger: 0.1,
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        }),
      });
    });
    ScrollTrigger.refresh();
  });
  ScrollTrigger.create({
    trigger: '.quote', endTrigger: '.journal', start: 'top 60px', end: 'bottom 60px',
    onToggle: (s) => document.querySelector('.bar').classList.toggle('on-dark', s.isActive),
  });
}
