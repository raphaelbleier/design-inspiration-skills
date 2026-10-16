// Hero: product cut-outs float around a centred headline.
// - cursor parallax: each card moves by (mouse offset * data-d * 14px) through gsap.quickTo (.9s power3.out)
// - scroll drift: cards rise at depth-scaled speed while the hero leaves (scrub 0.6)
// - intro: cards scale .6 -> 1 + fade, stagger .08, 1.1s power3.out; headline slides up 40px.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

export function initHero() {
  const cards = gsap.utils.toArray('.fl');
  gsap.from(cards, { scale: 0.6, autoAlpha: 0, duration: 1.1, ease: 'power3.out', stagger: 0.08, delay: 0.2 });
  gsap.from('.hero-title', { yPercent: 40, autoAlpha: 0, duration: 1.2, ease: 'power3.out', delay: 0.1 });

  const setters = cards.map((c) => ({
    d: +c.dataset.d,
    x: gsap.quickTo(c, 'x', { duration: 0.9, ease: 'power3.out' }),
    y: gsap.quickTo(c, 'y', { duration: 0.9, ease: 'power3.out' }),
  }));
  addEventListener('pointermove', (e) => {
    const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
    setters.forEach((s) => { s.x(nx * s.d * 28); s.y(ny * s.d * 28); });
  });

  cards.forEach((c) => gsap.to(c, {
    yPercent: -80 * (+c.dataset.d), ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 },
  }));
}
