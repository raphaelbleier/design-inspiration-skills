/**
 * wellness.js - pinned wellness section; scrolling 3 viewport heights steps through the
 * four tabs (Spa/Yoga/Fitness/Cafe). Each step swaps the active image (clip-path inset
 * 1s expo-out wipe + opacity) and text (translateY 16px -> 0, .8s). Tabs are also clickable.
 * Pin: ScrollTrigger pin, end "+=300%", snap off, scrub-free (discrete index from progress).
 */
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reduced } from './scroll.js';

export function initWellness() {
  const tabs = [...document.querySelectorAll('#tabs li')];
  const imgs = [...document.querySelectorAll('#wImgs figure')];
  const txts = [...document.querySelectorAll('#wTexts p')];
  let cur = 0;
  const set = (i) => {
    if (i === cur) return; cur = i;
    [tabs, imgs, txts].forEach((l) => l.forEach((el, k) => el.classList.toggle('is-on', k === i)));
  };
  tabs.forEach((t, i) => t.addEventListener('click', () => set(i)));
  if (reduced || innerWidth <= 900) return;
  ScrollTrigger.create({
    trigger: '#wellness', start: 'top top', end: '+=300%', pin: '.wellness__pin',
    onUpdate: (s) => set(Math.min(3, Math.floor(s.progress * 4))),
  });
}
