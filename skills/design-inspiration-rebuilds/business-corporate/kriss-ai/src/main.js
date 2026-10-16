/* One rAF loop: eased stage value -> camera keyframes, panel opacity, hotspot positions. */
import { gsap } from 'gsap';
import { createStage } from './stage.js';
import { initScroll, step, goTo, STAGES } from './scroll.js';
import { typeLoop } from './typewriter.js';
import { initChat } from './chat.js';

const stage = createStage(document.getElementById('stage'));
const panels = [...document.querySelectorAll('.panel')];
const navBtns = [...document.querySelectorAll('nav [data-go]')];
const hsBox = document.getElementById('hotspots');
const hint = document.querySelector('.hint');
const hs = Array.from({ length: STAGES }, (_, i) => {
  const b = document.createElement('button'); b.className = 'hs'; b.setAttribute('aria-label', ['Home', 'Setup', 'Plans', 'About', 'FAQ'][i]);
  b.onclick = () => goTo(i); hsBox.append(b); return b;
});
document.querySelectorAll('[data-go]').forEach((el) => el.addEventListener('click', (e) => { e.preventDefault(); goTo(+el.dataset.go); }));
document.querySelectorAll('[data-demo]').forEach((el) => el.addEventListener('click', (e) => { e.preventDefault(); document.getElementById('fab').click(); }));
initScroll(); initChat();
typeLoop(document.getElementById('who'), ['dentists', 'doctors', 'pharmacists', 'healthcare teams']);
typeLoop(document.getElementById('typed'), ["I'm built into your website to help with booking.", "I'm built into your website to help with prices.", "I'm built into your website to help with opening hours."]);

gsap.from('.top, .hero > *', { y: 20, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.08, delay: 0.2 });

let last = performance.now();
gsap.ticker.add((time) => {
  const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000); last = now;
  const t = step(dt);
  const pts = stage.render(t, time);
  panels.forEach((p, i) => {
    const d = t - i, o = Math.max(0, 1 - Math.abs(d) * 1.8);
    p.style.opacity = i === 0 ? o : o; p.style.visibility = o > 0.01 ? 'visible' : 'hidden';
    p.style.setProperty('--dy', `${-d * 36}px`); p.classList.toggle('on', o > 0.6);
  });
  const cur = Math.round(t);
  hs.forEach((b, i) => { b.style.left = `${pts[i][0]}px`; b.style.top = `${pts[i][1]}px`; b.classList.toggle('on', i === cur); });
  navBtns.forEach((b) => b.classList.toggle('on', +b.dataset.go === cur));
  hint.style.opacity = t > 0.5 ? 0 : 1;
});
