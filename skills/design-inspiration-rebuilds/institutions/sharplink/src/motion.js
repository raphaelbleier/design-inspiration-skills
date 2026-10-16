// Scroll choreography.
//  - theme: body.is-light + topo/crystal modes flip per section (dark hero -> light -> dark frame -> light -> dark footer)
//  - frame: dark panel margins grow 28px -> 0 (scrub) as it pins into the next block
//  - char scrub: each character opacity .18 -> 1, stagger scrubbed over the paragraph
//  - blur-in: .blur copy un-blurs (14px -> 0), .rv rises 36px with opacity, power3.out .9s
//  - footer wordmark rises from 40% -> 0 and fades in
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { topo } from './topo.js';
import { crystal } from './crystal.js';
gsap.registerPlugin(ScrollTrigger);
export function initMotion() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const set = (light, wire = 0) => { document.body.classList.toggle('is-light', light); topo.theme = light ? 1 : 0; gsap.to(crystal, { wire, duration: .6 }); };
  ScrollTrigger.create({ trigger: '#hero', start: 'top top', end: 'bottom 60%', onEnter: () => set(false), onEnterBack: () => set(false), onLeave: () => set(true) });
  ScrollTrigger.create({ trigger: '#about', start: 'top 60%', end: 'bottom 40%', onEnter: () => set(true), onEnterBack: () => set(true) });
  ScrollTrigger.create({ trigger: '#investors', start: 'top 50%', end: 'bottom 30%', onEnter: () => set(false, 1), onEnterBack: () => set(false, 1), onLeave: () => set(true), onLeaveBack: () => set(true) });
  ScrollTrigger.create({ trigger: '#why', start: 'top 60%', onEnter: () => set(true), onEnterBack: () => set(true) });
  ScrollTrigger.create({ trigger: 'footer', start: 'top 40%', onEnter: () => set(false), onLeaveBack: () => set(true) });
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (s) => (crystal.p = s.progress) });
  if (reduce) { document.querySelectorAll('.scrub .c').forEach((c) => (c.style.opacity = 1)); return; }

  gsap.to('.frame', { marginLeft: 0, marginRight: 0, ease: 'none', scrollTrigger: { trigger: '.frame-wrap', start: 'top 70%', end: 'top top', scrub: true } });
  const sc = document.getElementById('scrub');
  sc.innerHTML = sc.textContent.split(' ').map((w) => `<span style="white-space:nowrap">${[...w].map((ch) => `<span class="c">${ch}</span>`).join('')}</span>`).join(' ');
  gsap.to('.scrub .c', { opacity: 1, ease: 'none', stagger: .05, scrollTrigger: { trigger: '.scrub', start: 'top 80%', end: 'bottom 40%', scrub: .6 } });
  document.querySelectorAll('.blur').forEach((el) => {
    el.style.setProperty('--b', '14px');
    ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => el.style.setProperty('--b', '0px') });
  });
  gsap.utils.toArray('.rv').forEach((el) => gsap.from(el, { y: 36, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } }));
  gsap.fromTo('#mark', { '--my': '40%', opacity: 0 }, { '--my': '0%', opacity: 1, ease: 'none', scrollTrigger: { trigger: 'footer', start: 'top 30%', end: 'bottom bottom', scrub: true } });
  gsap.from('.hero .display, .hero .btns, .newscard', { y: 40, opacity: 0, duration: 1.2, ease: 'power3.out', stagger: .12, delay: .2 });
}
