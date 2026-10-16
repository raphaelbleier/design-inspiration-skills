/* Pinned "wearable" scene. A dashed frame sweeps left -> right over the giant word; inside the frame a
   duplicate of the word is blurred and glowing (clip = overflow hidden). The coaster follows the frame
   because both read the shared pose.x (-.6 -> .6 of the half viewport). Portrait and warning fade in late. */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { pose } from './disc.js';
import { reduced } from './scroll.js';

export function initWear() {
  const sec = document.querySelector('.wear');
  const main = sec.querySelector('.g-main');
  const frame = sec.querySelector('.frame');
  const blur = sec.querySelector('.g-blur');
  const place = () => {
    gsap.set(frame, { x: pose.x * innerWidth / 2 });
    const f = frame.getBoundingClientRect(), m = main.getBoundingClientRect();
    blur.style.left = `${m.left - f.left - 1}px`;   // 1px = dashed border
    blur.style.top = `${m.top - f.top - 1}px`;
  };
  if (reduced) { gsap.set(frame, { display: 'none' }); return; }
  ScrollTrigger.create({ trigger: sec, start: 'top top', end: 'bottom bottom', onUpdate: place, onRefresh: place });
  gsap.fromTo(pose, { x: -0.6 }, { x: 0.6, ease: 'none', immediateRender: false,
    scrollTrigger: { trigger: sec, start: 'top top', end: 'bottom bottom', scrub: 0.4 } });
  gsap.to('.portrait, .warn', { opacity: 1, duration: 1, ease: 'power2.out',
    scrollTrigger: { trigger: sec, start: '55% top', toggleActions: 'play none none reverse' } });
}
