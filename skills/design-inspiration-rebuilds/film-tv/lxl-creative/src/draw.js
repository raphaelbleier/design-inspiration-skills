// Technique: hand-drawn orange squiggles drawn on scroll with DrawSVGPlugin (1.5s osmo, start "top 80%", once).
// Reveals: every [data-split] heading is split into lines (SplitText mask: 'lines') and each line slides up
// from yPercent 110 (1s osmo, stagger .08, start "top 85%").
import { gsap } from 'gsap';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { SplitText } from 'gsap/SplitText';
import { reduced } from './scroll.js';

gsap.registerPlugin(DrawSVGPlugin, SplitText);

export function initDraw() {
  document.querySelectorAll('[data-draw]').forEach((svg) => {
    const path = svg.querySelector('path');
    if (reduced) return;
    gsap.fromTo(path, { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.5, ease: 'osmo', scrollTrigger: { trigger: svg, start: 'top 80%', once: true } });
  });
  document.querySelectorAll('[data-split]').forEach((el) => {
    if (reduced) return el.classList.add('ready');
    document.fonts.ready.then(() => SplitText.create(el, {
      type: 'lines', mask: 'lines', autoSplit: true,
      onSplit: (self) => {
        el.classList.add('ready');
        return gsap.from(self.lines, { yPercent: 110, duration: 1, ease: 'osmo', stagger: 0.08, scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
      },
    }));
  });
}
