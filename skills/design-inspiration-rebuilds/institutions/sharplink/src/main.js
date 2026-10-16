import './style.css';
import { gsap } from 'gsap';
import { initScroll } from './scroll.js';
import { initTopo } from './topo.js';
import { initCrystal } from './crystal.js';
import { initMotion } from './motion.js';

const topo = initTopo(document.getElementById('topo'));
const crystal = initCrystal(document.getElementById('crystal'));
initScroll();
initMotion();
gsap.ticker.add((t) => { topo(t); crystal(t); });
document.getElementById('cookie-x').onclick = () => {
  const c = document.getElementById('cookie');
  gsap.to(c, { height: 0, paddingTop: 0, paddingBottom: 0, opacity: 0, duration: .5, ease: 'power3.out', onComplete: () => c.remove() });
  document.body.classList.add('cookie-gone');
};
