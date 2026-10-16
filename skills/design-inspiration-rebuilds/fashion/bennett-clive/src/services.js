/**
 * services.js - image frame + difference-blended service list on a 400vh sticky track.
 * Technique: scrub 0-.35 opens .frame via clip-path inset(50% -> 0); scrub .15-1 translates the
 * list up through the frame; the second image cross-fades in at .6. The list uses
 * mix-blend-mode: difference with white ink, so it reads black on white and inverts over the photo.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initServices(reduced) {
  const root = document.querySelector('[data-services]');
  const frame = root.querySelector('[data-frame]');
  const svc = root.querySelector('[data-svc]');
  if (reduced) { frame.style.clipPath = 'inset(0)'; return; }
  const dist = () => svc.offsetHeight - innerHeight * 0.55;
  const tl = gsap.timeline({ defaults: { ease: 'none' },
    scrollTrigger: { trigger: root, start: 'top top', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true } });
  tl.to(frame, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.35, ease: 'power2.out' }, 0)
    .fromTo(svc, { y: () => innerHeight * 0.45 }, { y: () => -dist(), duration: 0.85 }, 0.15)
    .to(frame.children[1], { opacity: 1, duration: 0.15 }, 0.6);
}
