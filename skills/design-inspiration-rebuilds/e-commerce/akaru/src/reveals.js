// Technique: scroll reveals. Headings/paragraphs rise out of an overflow mask (yPercent 105 -> 0,
// 1.1s power4.out, start top 88%). Project images are stacked and scrub-parallaxed (img yPercent -8 -> 8).
// Award rows wipe in line by line (stagger .06). Counter ticks 0 -> 35 over 1.6s.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initReveals(reduce) {
  if (reduce) return;
  gsap.utils.toArray('.reveal').forEach((el) => {
    el.style.overflow = 'hidden';
    const inner = document.createElement('span');
    inner.style.display = 'block';
    inner.append(...el.childNodes);
    el.append(inner);
    gsap.from(inner, { yPercent: 105, duration: 1.1, ease: 'power4.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });
  gsap.utils.toArray('.proj-imgs .ph img').forEach((img) =>
    gsap.fromTo(img, { yPercent: -8, scale: 1.18 }, { yPercent: 8, ease: 'none',
      scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true } }));
  gsap.from('.proj-list li', { opacity: 0, x: 40, stagger: 0.12, duration: 0.9, ease: 'power3.out',
    scrollTrigger: { trigger: '.proj-list', start: 'top 85%', once: true } });
  gsap.from('.aw-list li', { opacity: 0, yPercent: 60, stagger: 0.06, duration: 0.8, ease: 'power3.out',
    scrollTrigger: { trigger: '.aw-list', start: 'top 92%', once: true } });
  const n = { v: 0 }, c = document.getElementById('count');
  gsap.to(n, { v: 35, duration: 1.6, ease: 'power2.out', onUpdate: () => (c.textContent = `(${Math.round(n.v)})`),
    scrollTrigger: { trigger: '.awards', start: 'top 60%', once: true } });
  gsap.from('.giant', { yPercent: 35, ease: 'none',
    scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'bottom bottom', scrub: true } });
}
