/**
 * hero.js - the pinned hero: the full-screen topo canvas shrinks into the
 * "message from Remy" frame on dark green; a lime signature draws itself over it.
 *
 * The shrinking element is the DOM `.frame`; topo.js reads its rect every frame and uses it as
 * the shader mask, so there is no canvas resizing at all. Scrub timeline over 120% of the
 * viewport height of pinned scroll.
 */
import { gsap, ScrollTrigger, reduced } from './scroll.js';

export function initHero() {
  const hero = document.querySelector('[data-hero]');
  const frame = hero.querySelector('[data-frame]');
  const video = frame.querySelector('.frame__video');
  const msg = hero.querySelector('[data-msg]');
  const sig = hero.querySelector('[data-sig]');
  const rails = hero.querySelectorAll('.rail');
  const ui = hero.querySelectorAll('.hero__next, .hero__tap');
  const header = document.querySelector('.header');

  const mm = gsap.matchMedia();
  mm.add('(min-width: 0px)', () => {
    if (reduced) {                                  // no pin, no scrub: show the final "message" state
      gsap.set(frame, { width: '35.4rem', height: '22.9rem' });
      gsap.set(ui, { autoAlpha: 0 });
      hero.classList.add('is-static');
      return;
    }
    const small = window.matchMedia('(max-width: 479px)').matches;
    const endW = small ? '24rem' : '35.4rem';
    const endH = small ? '17rem' : '22.9rem';

    header.setAttribute('data-ink', 'dark');
    gsap.set(frame, { width: hero.clientWidth, height: hero.clientHeight });   // starts as the full (large) viewport
    gsap.set(msg, { autoAlpha: 0, y: 20 });
    gsap.set(sig, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(rails, { xPercent: (i) => (i ? 20 : -20), autoAlpha: 0 });

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: hero, start: 'top top', end: '+=120%', pin: true, scrub: 0.6, anticipatePin: 1,
        // header ink: dark on the light hero, light once the frame has shrunk onto dark green
        onUpdate: (self) => header.setAttribute('data-ink', self.progress < 0.2 ? 'dark' : 'light') },
    });
    tl.to(ui, { autoAlpha: 0, duration: 0.15 }, 0)
      .to(frame, { width: endW, height: endH, duration: 0.8, ease: 'power2.inOut' }, 0)
      .to(video, { opacity: 1, duration: 0.4 }, 0.5)
      .to(msg, { autoAlpha: 1, y: 0, duration: 0.25, ease: 'power2.out' }, 0.55)
      .to(rails, { autoAlpha: 1, duration: 0.1 }, 0.25)
      .to(rails[0], { xPercent: -45, duration: 0.9 }, 0.25)
      .to(rails[1], { xPercent: 45, duration: 0.9 }, 0.25)
      .to(rails, { autoAlpha: 0, duration: 0.15 }, 0.85)
      .to(sig, { strokeDashoffset: 0, duration: 0.3, ease: 'power1.inOut' }, 0.7)
      .to(sig, { opacity: 0.0, duration: 0.15 }, 1.05);
  });
}
