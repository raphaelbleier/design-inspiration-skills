// Technique: headline line-mask reveal. Each heading is wrapped line-by-line (split on <br>) and rises
// from yPercent 105 inside overflow:hidden. Values: .9s expo-out-ish 'power4.out', stagger .08, start 'top 85%'.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

export function initReveals() {
  document.querySelectorAll('.hero-top, .mega, .intro-h, .langs-h').forEach((h) => {
    const lines = h.innerHTML.split(/<br\s*\/?>/i);
    h.innerHTML = lines.map((l) => `<span style="display:block;overflow:hidden;padding-bottom:.08em;margin-bottom:-.08em"><span class="ln" style="display:block">${l}</span></span>`).join('');
    gsap.from(h.querySelectorAll('.ln'), { yPercent: 105, duration: 0.9, ease: 'power4.out', stagger: 0.08,
      scrollTrigger: { trigger: h, start: 'top 90%', once: true } });
  });
  gsap.from('.hero-img', { clipPath: 'inset(100% 0 0 0)', duration: 1.1, ease: 'power3.inOut', delay: 0.3 });
}
