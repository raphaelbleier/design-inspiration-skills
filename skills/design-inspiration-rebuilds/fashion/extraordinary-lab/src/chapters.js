// Chapter text: blur + rise reveal (1.2s expo-out, stagger .12) when a chapter enters at 75%,
// figures fade in with a hairline-frame wipe (clip-path inset 100% -> 0, 1.3s).
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initChapters() {
  document.querySelectorAll('[data-ar]').forEach((f) => f.style.setProperty('--ar', f.dataset.ar));
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('.ch').forEach((ch) => {
    const items = ch.querySelectorAll('.no,h2,.body,.cta');
    gsap.set(items, { opacity: 0, y: 24, filter: 'blur(6px)' });
    gsap.to(items, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.2, ease: 'expo.out', stagger: 0.12,
      scrollTrigger: { trigger: ch, start: 'top 75%', toggleActions: 'play none none reverse' } });
    const fig = ch.querySelector('.fig');
    if (fig) gsap.fromTo(fig, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 1.3, ease: 'expo.out',
      scrollTrigger: { trigger: fig, start: 'top 85%', toggleActions: 'play none none reverse' } });
  });
  gsap.utils.toArray('.plates figure').forEach((f) =>
    gsap.fromTo(f, { opacity: 0 }, { opacity: 1, duration: 1, ease: 'power2.out', scrollTrigger: { trigger: f, start: 'top 92%' } }));
}
