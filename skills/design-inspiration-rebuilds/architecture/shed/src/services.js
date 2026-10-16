/**
 * services.js - pinned stage with four huge words.
 * Pin: ScrollTrigger pin, end '+=300%', scrub .4. Progress p (0..1) is split in 4 steps; word i fills
 * its sky-blue band from the bottom via the CSS var --h (0% -> 100%, background-clip:text), and the photo of
 * the active word cross-fades (.8s cubic-bezier(.9,0,.1,1) in CSS). Hover on a word does the same on desktop.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reduced } from './scroll.js';

gsap.registerPlugin(ScrollTrigger);

export function initServices() {
  const words = [...document.querySelectorAll('.svc-word')];
  const imgs = [...document.querySelectorAll('.svc-media img')];
  let active = 0;
  const show = (i) => {
    if (i === active) return;
    active = i;
    imgs.forEach((im, k) => im.classList.toggle('on', k === i));
  };

  if (reduced) { words.forEach((w) => w.style.setProperty('--h', '0%')); return; }

  ScrollTrigger.create({
    trigger: '.services-pin', start: 'top top', end: '+=300%', pin: true, scrub: 0.4,
    onUpdate: (self) => {
      const p = self.progress * words.length;
      words.forEach((w, i) => {
        const fill = gsap.utils.clamp(0, 1, p - i);            // word i fills while p goes i -> i+1
        w.style.setProperty('--h', `${fill * 100}%`);
      });
      show(Math.min(words.length - 1, Math.floor(p)));
    },
  });

  words.forEach((w, i) => w.addEventListener('mouseenter', () => show(i)));
}
