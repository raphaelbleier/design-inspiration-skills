import './style.css';
import gsap from 'gsap';
import { playIntro } from './hero.js';
import { initToggle } from './toggle.js';
import { initExplore } from './explore.js';

playIntro();
initToggle();
initExplore();

// sound pill: visual only (equaliser dots + label), no audio in the study
const snd = document.getElementById('sound');
snd.addEventListener('click', () => {
  const on = snd.getAttribute('aria-pressed') !== 'true';
  snd.setAttribute('aria-pressed', String(on));
  document.getElementById('soundLabel').textContent = on ? 'SOUND ON' : 'SOUND OFF';
});
gsap.ticker.lagSmoothing(0);
