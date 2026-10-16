/* About: Lenis on the page wrapper + ScrollTrigger (scroller = wrapper).
 *  - headline lines slide up out of an overflow mask on enter (1s power3.out, stagger .12)
 *  - the big illustration rises: y 40vh -> -30vh, scrubbed over the hero (scrub: 1)
 *  - the dark section's diagonal top edge flattens from 12vh to 0 as it arrives (scrubbed)
 *  - paragraphs/headings: y 40 + opacity, .9s power2.out, start 'top 88%'
 *  - header turns cream once the dark section reaches the top
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { onEnter, onLeave } from './router.js';

gsap.registerPlugin(ScrollTrigger);

export function initAbout() {
  const wrap = document.getElementById('about-scroll');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scroller = wrap;
  let lenis, built = false;

  function build() {
    built = true;
    gsap.from('.a-title i', { yPercent: 110, duration: 1, ease: 'power3.out', stagger: 0.12, delay: 0.2 });
    if (reduced) return;
    gsap.fromTo('.a-scene', { y: '40vh' }, { y: '-30vh', ease: 'none', scrollTrigger: { scroller, trigger: '.a-hero', start: 'top top', end: 'bottom top', scrub: 1 } });
    const dark = document.getElementById('a-dark');
    gsap.fromTo(dark, { clipPath: 'polygon(0 12vh, 100% 0, 100% 100%, 0 100%)' }, { clipPath: 'polygon(0 0vh, 100% 0, 100% 100%, 0 100%)', ease: 'none', scrollTrigger: { scroller, trigger: dark, start: 'top bottom', end: 'top 20%', scrub: true } });
    gsap.utils.toArray('.rv').forEach((el) =>
      gsap.from(el, { y: 40, opacity: 0, duration: 0.9, ease: 'power2.out', scrollTrigger: { scroller, trigger: el, start: 'top 88%', once: true } }));
    ScrollTrigger.create({ scroller, trigger: dark, start: 'top 40px', onToggle: (s) => document.body.classList.toggle('hdr-light', s.isActive && document.body.dataset.view === 'about') });
  }

  onEnter('about', () => {
    wrap.scrollTop = 0;
    if (!reduced) {
      lenis = new Lenis({ wrapper: wrap, content: document.getElementById('about-inner'), lerp: 0.1, smoothWheel: true, autoRaf: false });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(tick);
    }
    if (!built) build();
    ScrollTrigger.refresh();
  });
  onLeave('about', () => { gsap.ticker.remove(tick); lenis?.destroy(); lenis = null; });
  const tick = (t) => lenis?.raf(t * 1000);
}
