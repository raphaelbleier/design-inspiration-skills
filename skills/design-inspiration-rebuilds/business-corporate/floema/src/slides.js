// Pinned slideshow: stage pinned for 5 x 100vh of scroll, scrubbed.
// Each next slide is a full-screen layer revealed by clip-path inset(100% 0 0 0) -> inset(0) (bottom-up wipe),
// image scale 1.2 -> 1 inside; outgoing slide's copy fades up. Counter (01-05) and header colour follow progress.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

export function initSlides() {
  const slides = gsap.utils.toArray('.slide');
  const count = document.querySelector('.count');
  const bar = document.querySelector('.bar');
  const n = slides.length;

  slides.forEach((s, i) => { s.style.zIndex = i; if (i) gsap.set(s, { clipPath: 'inset(100% 0% 0% 0%)' }); });
  slides.forEach((s, i) => { if (i) gsap.set(s.querySelector('img'), { scale: 1.2 }); });

  const tl = gsap.timeline({
    defaults: { ease: 'power2.inOut' },
    scrollTrigger: {
      trigger: '.stage', start: 'top top', end: () => `+=${innerHeight * (n - 1) * 1.1}`,
      pin: true, scrub: 0.5, anticipatePin: 1,
      onUpdate: (self) => {
        const k = Math.min(n, Math.round(self.progress * (n - 1)) + 1);
        count.textContent = String(k).padStart(2, '0');
      },
      onToggle: (self) => bar.classList.toggle('on-dark', self.isActive),
    },
  });
  for (let i = 1; i < n; i++) {
    tl.to(slides[i], { clipPath: 'inset(0% 0% 0% 0%)', duration: 1 }, i - 1)
      .to(slides[i].querySelector('img'), { scale: 1, duration: 1 }, i - 1)
      .fromTo(slides[i].querySelector('.slide-copy'), { yPercent: 25, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.6 }, i - 0.6)
      .to(slides[i - 1].querySelector('.slide-copy'), { yPercent: -25, autoAlpha: 0, duration: 0.5 }, i - 1);
  }
  gsap.set(slides.slice(1).map((s) => s.querySelector('.slide-copy')), { autoAlpha: 0 });
}
