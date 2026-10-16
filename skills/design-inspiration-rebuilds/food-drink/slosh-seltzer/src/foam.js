/**
 * foam.js - the eruption after the can pops.
 * Technique: ~90 pink DOM circles (inset highlight) fired from the can opening into a cone that widens
 * upward, then settling. Each: angle -38..38deg around "up-right", distance 12..58vh, size 18..120px,
 * x/y .9-1.3s `power3.out` staggered over .5s, scale 0 -> 1 `back.out(1.7)`. A slow bob keeps the mound alive.
 */
import gsap from 'gsap';
import { reduced } from './state.js';

const box = document.getElementById('foam');
const can = document.getElementById('canHero');

export function erupt() {
  const h = box.getBoundingClientRect();
  const c = can.getBoundingClientRect();
  const ox = c.left + c.width / 2 - h.left, oy = c.top + c.height / 2 - h.top;
  const D = c.width;
  for (let i = 0; i < 90; i++) {
    const el = document.createElement('i'); el.className = 'fb';
    const s = 18 + Math.pow(Math.random(), 1.6) * 100;
    const ang = (-90 + (Math.random() * 2 - 1) * 42 + 10) * Math.PI / 180;
    const dist = (0.1 + Math.random() * 0.36) * h.height + D * 0.1;
    const x = ox + Math.cos(ang) * dist, y = oy + Math.sin(ang) * dist * 1.05;
    Object.assign(el.style, { width: s + 'px', height: s + 'px', left: -s / 2 + 'px', top: -s / 2 + 'px' });
    box.appendChild(el);
    if (reduced) { gsap.set(el, { x, y, scale: 1 }); continue; }
    gsap.fromTo(el, { x: ox, y: oy + D * 0.1, scale: 0 }, {
      x, y, scale: 1, duration: 0.9 + Math.random() * 0.4, ease: 'power3.out', delay: Math.random() * 0.5,
      onComplete: () => gsap.to(el, { y: '+=' + (6 + Math.random() * 10), duration: 1.6 + Math.random(), yoyo: true, repeat: -1, ease: 'sine.inOut' }),
    });
  }
}
