/* Pinned horizontal gallery over a fixed ice texture: the track translates by -(scrollWidth - innerWidth)
   while the section is pinned; each frosted frame also scales .9 -> 1 as it approaches the viewport centre
   (containerAnimation-driven). Desktop only: below 1000px the track swipes natively. */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initCamps() {
  const track = document.getElementById('track');
  ScrollTrigger.matchMedia({
    '(min-width: 1001px)': () => {
      const dist = () => track.scrollWidth - innerWidth;
      const tween = gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: { trigger: '#camps', start: 'top top', end: () => '+=' + dist(), pin: '.camps__pin', scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1 },
      });
      gsap.utils.toArray('.camp').forEach((c) =>
        gsap.fromTo(c, { scale: 0.9 }, {
          scale: 1, ease: 'none',
          scrollTrigger: { trigger: c, containerAnimation: tween, start: 'left 95%', end: 'left 40%', scrub: true },
        }));
    },
    '(max-width: 1000px)': () => {
      const pin = document.querySelector('.camps__pin');
      pin.style.overflowX = 'auto';
      return () => { pin.style.overflowX = ''; };
    },
  });
}
