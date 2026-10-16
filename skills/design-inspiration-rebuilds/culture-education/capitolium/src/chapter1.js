/* Technique: three arched windows -> the centre one grows to fill the viewport while the sides slide off,
   then a giant script word rises over it, then a pinned horizontal track of image/text panels.
   Arch: border-radius 999px 999px 0 0. Grow: scale to 94vw wide, origin 50% 100%.
   Track: pin + x tween scrubbed (scrub 0.8), distance = scrollWidth - viewport. */
import { gsap } from 'gsap';
import { reduced } from './scroll.js';

export function initChapter1() {
  if (reduced) return;
  const bandH = () => document.querySelector('#ch1 .band').offsetHeight;
  const c = document.getElementById('archC');

  gsap.timeline({ defaults: { ease: 'power2.inOut' }, scrollTrigger: {
    trigger: '#arches', start: () => `top ${bandH()}`, end: '+=140%', pin: true, scrub: 0.8, invalidateOnRefresh: true } })
    .to('.arch--l', { xPercent: -160, opacity: 0, duration: 1 }, 0)
    .to('.arch--r', { xPercent: 160, opacity: 0, duration: 1 }, 0)
    .to(c, { scale: () => (innerWidth * 0.94) / c.offsetWidth, transformOrigin: '50% 100%', duration: 1.2 }, 0)
    .fromTo('#giant', { opacity: 0, yPercent: 60 }, { opacity: 1, yPercent: 0, ease: 'power3.out', duration: 0.8 }, 0.9);

  const track = document.getElementById('track');
  gsap.to(track, { x: () => -(track.scrollWidth - innerWidth), ease: 'none', scrollTrigger: {
    trigger: track, start: () => `top ${bandH()}`, end: () => '+=' + (track.scrollWidth - innerWidth),
    pin: true, scrub: 0.8, invalidateOnRefresh: true } });
}
