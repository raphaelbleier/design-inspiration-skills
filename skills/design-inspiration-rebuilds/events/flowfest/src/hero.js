// Technique: headline lines pop up from a masked baseline (SplitText), sticker rotates in with overshoot,
// the three hero photos fan out of one stack, corner rainbow arcs slide in from off-screen.
// Values: lines yPercent 110 -> 0, .9s back.out(1.4), stagger .12; sticker rotate -12 -> -2.5, .8s elastic.out(1,.6);
// photos rotation -2 / 4 / -6 deg, scroll-scrubbed 0 -> 100vh fan (x +-14%).
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';

export function initHero(reduced) {
  const split = SplitText.create('.hero .h1', { type: 'lines', mask: 'lines', linesClass: 'line' });
  if (reduced) return;
  const tl = gsap.timeline({ defaults: { ease: 'back.out(1.4)' } });
  tl.from('.badge', { scale: 0, rotate: -20, duration: 0.7, transformOrigin: '10% 50%' })
    .from(split.lines, { yPercent: 110, duration: 0.9, stagger: 0.12 }, '-=.3')
    .from('.sticker', { rotate: -12, scale: 0.4, opacity: 0, duration: 0.8, ease: 'elastic.out(1,.6)' }, '-=.4')
    .from('.arc-r', { xPercent: 120, yPercent: -120, duration: 1.2, ease: 'power3.out' }, 0.2)
    .from('.arc-l', { xPercent: -120, yPercent: 120, duration: 1.2, ease: 'power3.out' }, 0.2)
    .from('.ph', { y: 120, opacity: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out' }, 0.6);

  gsap.to('.ph2', { xPercent: 14, rotate: 9, ease: 'none', scrollTrigger: { trigger: '.stack', start: 'top 85%', end: 'top 15%', scrub: true } });
  gsap.to('.ph3', { xPercent: -14, rotate: -11, ease: 'none', scrollTrigger: { trigger: '.stack', start: 'top 85%', end: 'top 15%', scrub: true } });
}
