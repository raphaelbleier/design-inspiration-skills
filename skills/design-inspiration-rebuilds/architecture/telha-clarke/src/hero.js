/**
 * hero.js - pinned hero: a portrait window of the photo opens to full-bleed while the image counter-scales.
 * Values: clip-path inset(46% 39% 0 39%) -> inset(0), img scale 1.25 -> 1, scrub 0.6 (smoothing), pin 100vh extra,
 * tagline and hint fade out in the first 30%. Header drops from under the wordmark to the top edge in the first 40%. Wordmark scrolls away with the page; the small header logo fades in after it.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reduced } from './scroll.js';

export function initHero() {
  const wm = document.querySelector('.wordmark');
  wm.innerHTML = [...wm.textContent].map((c) => (c === ' ' ? '<span class="sp"> </span>' : `<span class="mask"><span class="ch">${c}</span></span>`)).join('');
  if (reduced) return;
  const mobile = window.matchMedia('(max-width: 700px)').matches;
  const from = mobile ? 'inset(52% 12% 0% 12%)' : 'inset(46% 39% 0% 39%)';
  const tl = gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=100%', pin: true, scrub: 0.6 } });
  tl.fromTo('.hero-img', { clipPath: from }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none' }, 0)
    .fromTo('.hero-img img', { scale: 1.25 }, { scale: 1, ease: 'none' }, 0)
    .to(['.hint', '.tagline'], { opacity: 0, duration: 0.3, ease: 'none' }, 0)
    .to('.wordmark', { yPercent: -30, ease: 'none' }, 0);
  gsap.to('.header', { paddingTop: 17, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=40%', scrub: true } });
  gsap.fromTo('.mini-logo', { opacity: 0 }, { opacity: 1, ease: 'none',
    scrollTrigger: { trigger: '.studio', start: 'top 60%', end: 'top 20%', scrub: true } });
}
