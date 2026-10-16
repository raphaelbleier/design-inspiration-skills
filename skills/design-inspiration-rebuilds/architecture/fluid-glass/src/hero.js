// Hero: title lines rise out of an overflow mask on load (yPercent 110 -> 0, 1.2s, stagger .12, expo.out);
// the image drifts down (yPercent 0 -> 18) and darkens while the hero scrolls away (scrub).
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';

export function initHero(reduced) {
  gsap.registerPlugin(SplitText);
  const title = document.querySelector('.hero__title');
  if (reduced) return;
  SplitText.create(title, {
    type: 'lines', linesClass: 'line', autoSplit: true,
    onSplit(self) {
      self.lines.forEach((l) => { l.innerHTML = `<span style="display:block">${l.innerHTML}</span>`; });
      return gsap.from(self.lines.map((l) => l.firstChild), { yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: 0.12, delay: 0.3 });
    },
  });
  gsap.fromTo('.hero__media', { scale: 1.12 }, { scale: 1, duration: 2, ease: 'power3.out' });
  gsap.to('.hero__media', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__title', { yPercent: -40, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: '30% top', scrub: true } });
}
