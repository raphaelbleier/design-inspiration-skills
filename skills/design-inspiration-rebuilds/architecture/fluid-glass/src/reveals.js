// About statement: each word goes opacity .15 -> 1, scrubbed across the block (start 'top 80%', end 'bottom 55%').
// Collection cards: clip-path inset reveal from the bottom, then parallax with a per-card data-speed (px).
import { gsap } from 'gsap';

export function initReveals(reduced) {
  const p = document.querySelector('[data-words]');
  p.innerHTML = p.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ');
  if (reduced) return;
  gsap.to('.about__text .w', { opacity: 1, ease: 'none', stagger: 0.1,
    scrollTrigger: { trigger: p, start: 'top 80%', end: 'bottom 55%', scrub: true } });

  gsap.utils.toArray('.card').forEach((card) => {
    const img = card.querySelector('.card__img');
    gsap.fromTo(img, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.3, ease: 'power3.inOut',
      scrollTrigger: { trigger: card, start: 'top 88%', once: true } });
    gsap.fromTo(card.querySelector('h3'), { opacity: 0 }, { opacity: 1, duration: .8, delay: .5, ease: 'power2.out',
      scrollTrigger: { trigger: card, start: 'top 88%', once: true } });
    const speed = +card.dataset.speed;
    if (speed) gsap.fromTo(card, { y: -speed / 2 }, { y: speed / 2, ease: 'none',
      scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  gsap.utils.toArray('.projects figure').forEach((f, i) => gsap.from(f, { y: 60, opacity: 0, duration: 1, delay: i * 0.1, ease: 'power3.out',
    scrollTrigger: { trigger: f, start: 'top 90%', once: true } }));
}
