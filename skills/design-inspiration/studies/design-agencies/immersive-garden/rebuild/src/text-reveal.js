/* TEXT REVEAL
   The original draws text as MSDF in WebGL with a per-character reveal that shades from
   vec3(.65) up to the final colour. DOM equivalent: GSAP SplitText (lines, masked) so each
   line rises out of a clipping box, while its colour travels #a6a6a6 -> #030303.
     rise      yPercent 105 -> 0     duration 1.4  ease power3.out   stagger .12 s
     colour    #a6a6a6 -> current    duration 1.2  ease sine.inOut   (same stagger)
   Triggered when the element's top reaches 88% of the viewport. Reduced motion: no tween. */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { state } from './state.js';
gsap.registerPlugin(ScrollTrigger, SplitText);

export function revealText(root = document) {
  if (state.reduced) return;
  root.querySelectorAll('[data-reveal]').forEach((el) => {
    const color = getComputedStyle(el).color;
    SplitText.create(el, {
      type: 'lines', mask: 'lines', autoSplit: true,
      onSplit(self) {
        return gsap.fromTo(self.lines, { yPercent: 105, color: '#a6a6a6' },
          { yPercent: 0, color, duration: 1.4, ease: 'power3.out', stagger: 0.12, scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
      },
    });
  });
}
