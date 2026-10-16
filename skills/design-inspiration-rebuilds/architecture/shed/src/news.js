/**
 * news.js - "Visit" cursor bubble inside news cards: violet 76px circle scales 0 -> 1 (.5s expo.out) and follows
 * the pointer through gsap.quickTo (x/y .35s power3.out). Native cursor hidden over the image (CSS).
 */
import gsap from 'gsap';
import { reduced } from './scroll.js';

export function initNews() {
  if (reduced || !matchMedia('(hover: hover)').matches) return;
  document.querySelectorAll('.card-img').forEach((box) => {
    const dot = box.querySelector('.visit');
    const qx = gsap.quickTo(dot, 'x', { duration: 0.35, ease: 'power3.out' });
    const qy = gsap.quickTo(dot, 'y', { duration: 0.35, ease: 'power3.out' });
    box.addEventListener('mouseenter', (e) => {
      const r = box.getBoundingClientRect();
      gsap.set(dot, { x: e.clientX - r.left, y: e.clientY - r.top });
      gsap.to(dot, { scale: 1, duration: 0.5, ease: 'expo.out' });
    });
    box.addEventListener('mousemove', (e) => { const r = box.getBoundingClientRect(); qx(e.clientX - r.left); qy(e.clientY - r.top); });
    box.addEventListener('mouseleave', () => gsap.to(dot, { scale: 0, duration: 0.4, ease: 'expo.out' }));
  });
}
