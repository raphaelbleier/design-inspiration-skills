/**
 * fleet.js - pinned vessel showcase on a 500vh track. Three scroll stops (Skiff / Dart / Hauler) or tab click.
 * Switch: current vessel leaves (x -12vw, rotate -4deg, opacity 0), next enters from (x 12vw, rotate 4deg) in .9s
 * power3.out; spec block cross-writes; page gradient is fixed, vessel uses mix-blend-mode multiply so the white
 * studio backdrop disappears into it. Floating thumbs drift in parallax (y by 18vh across the track).
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reduced, lenis, scrollToEl } from './scroll.js';

const SPECS = [
  ['Skiff', 'Persistent', '6 weeks endurance', '1.8 m, 38 kg'],
  ['Dart', 'Rapid response', '42 knots sprint', '3.2 m, 160 kg'],
  ['Hauler', 'Heavy payload', '600 kg on deck', '7.5 m, 1.9 t'],
];

export function initFleet() {
  const vs = gsap.utils.toArray('.v');
  const tabs = gsap.utils.toArray('.vtabs button');
  const specs = document.querySelector('.vspecs');
  let cur = 0;
  const write = (i) => {
    const [n, a, b, c] = SPECS[i];
    specs.innerHTML = `<small>${n}</small><span>${a}</span><span>${b}</span><span>${c}</span>`;
  };
  write(0);
  const go = (i) => {
    if (i === cur) return;
    const dir = i > cur ? 1 : -1;
    gsap.to(vs[cur], { opacity: 0, xPercent: -12 * dir, rotate: -4 * dir, duration: 0.9, ease: 'power3.out' });
    gsap.fromTo(vs[i], { opacity: 0, xPercent: 12 * dir, rotate: 4 * dir }, { opacity: 1, xPercent: 0, rotate: 0, duration: 0.9, ease: 'power3.out' });
    gsap.fromTo(specs, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
    write(i);
    tabs.forEach((t, j) => t.classList.toggle('on', j === i));
    cur = i;
  };
  gsap.set(vs.slice(1), { opacity: 0 });
  const root = document.querySelector('.fleet');
  tabs.forEach((t, i) => t.addEventListener('click', () => {
    if (reduced) return go(i);
    const st = ScrollTrigger.getAll().find((s) => s.trigger === root);
    const y = st.start + (st.end - st.start) * ((i + 0.5) / 3);
    lenis ? lenis.scrollTo(y, { duration: 1.2 }) : scrollTo(0, y);
  }));
  if (reduced) return;
  ScrollTrigger.create({ trigger: root, start: 'top top', end: 'bottom bottom', pin: '.fleet-pin', anticipatePin: 1,
    onUpdate: (s) => go(Math.min(2, Math.floor(s.progress * 3))) });
  gsap.utils.toArray('.vthumb').forEach((el, i) => gsap.fromTo(el, { yPercent: 0 }, { yPercent: 40 * (i % 2 ? -1 : 1), ease: 'none',
    scrollTrigger: { trigger: root, start: 'top top', end: 'bottom bottom', scrub: true } }));
}
