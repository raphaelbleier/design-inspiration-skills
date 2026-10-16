/* Small widgets: count-up numbers (1.6s power2.out), temperature buttons that re-shape the heat bars,
   the flip-to-encrypt coin (rotateX 180deg, 1s) and the circle's bezier ring that wobbles in. */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reduced } from './scroll.js';

const SETS = { 10: [90, 25, 70, 15, 95, 40, 60, 20], 1: [55, 60, 52, 58, 56, 61, 54, 59], 0.1: [50, 50, 50, 50, 50, 50, 50, 50] };

export function initFeatures() {
  document.querySelectorAll('.count').forEach((el) => {
    const to = +el.dataset.to, dec = +el.dataset.dec, o = { v: reduced ? to : 0 };
    const draw = () => (el.textContent = o.v.toFixed(dec));
    draw();
    if (reduced) return;
    gsap.to(o, { v: to, duration: 1.6, ease: 'power2.out', onUpdate: draw,
      scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
  });

  const bars = [...document.querySelectorAll('.heat i')];
  const paint = (t) => bars.forEach((b, i) => b.style.setProperty('--h', SETS[t][i] + '%'));
  paint(1);
  document.querySelectorAll('.temp button').forEach((b) => b.addEventListener('click', () => {
    document.querySelectorAll('.temp button').forEach((x) => x.classList.toggle('on', x === b));
    paint(b.dataset.t);
  }));

  const flip = document.querySelector('.flip');
  const msg = document.getElementById('msg'), enc = document.getElementById('enc');
  enc.textContent = [...msg.textContent].reverse().map((c) => (c === ' ' ? ' ' : String.fromCharCode(0x2580 + (c.charCodeAt(0) % 8)))).join('');
  const set = (on) => {
    flip.classList.toggle('enc', on);
    document.getElementById('encode').classList.toggle('on', !on);
    document.getElementById('decode').classList.toggle('on', on);
  };
  document.getElementById('encode').onclick = () => set(true);
  document.getElementById('decode').onclick = () => set(false);

  if (!reduced) gsap.from('.ring circle', { scale: 0.6, rotate: -40, transformOrigin: '50% 50%', duration: 1.4, ease: 'elastic.out(1,.6)', stagger: 0.12,
    scrollTrigger: { trigger: '.ring', start: 'top 85%', once: true } });
}
