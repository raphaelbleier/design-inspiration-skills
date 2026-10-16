// Technique: intro card. A white rounded card (rotated -8deg) sits on the grey page, spins to 0,
// grows until it covers the viewport, then the overlay lifts and hero lines rise out of their masks.
// Values: spin 1s power3.inOut, grow 0.9s expo.inOut, hero lines 1.1s expo.out stagger .12.
import gsap from 'gsap';

export function intro() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const loader = document.getElementById('loader');
  const lines = document.querySelectorAll('.title .ln span');
  if (reduce) { gsap.set(lines, { yPercent: 0 }); return; }
  gsap.set(lines, { yPercent: 110 });
  gsap.set('.head, .hint, .scroll', { autoAlpha: 0 });
  gsap.timeline()
    .to('.card', { rotate: 0, duration: 1, ease: 'power3.inOut' })
    .to('.card', { scale: 8, borderRadius: 0, duration: 0.9, ease: 'expo.inOut' }, '>-.1')
    .to(loader, { autoAlpha: 0, duration: 0.3 }, '>-.15')
    .to(lines, { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.12 }, '<')
    .to('.head, .hint, .scroll', { autoAlpha: 1, duration: 0.6 }, '>-.6');
}
