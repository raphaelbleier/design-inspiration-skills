import gsap from 'gsap';
import './style.css';
import { initBg } from './bg.js';
import { initHero } from './hero.js';
import { createGame } from './game.js';
const $ = (id) => document.getElementById(id);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
initBg(reduced); initHero(reduced);

// Sound: tiny oscillator blips, no assets.
let on = true, ac;
const blip = (f) => { if (!on) return; ac ||= new AudioContext(); const o = ac.createOscillator(), g = ac.createGain();
  o.frequency.value = f; g.gain.setValueAtTime(.06, ac.currentTime); g.gain.exponentialRampToValueAtTime(.001, ac.currentTime + .1);
  o.connect(g).connect(ac.destination); o.start(); o.stop(ac.currentTime + .1); };
$('sound').onclick = () => { on = !on; $('sound').textContent = on ? 'SOUND ON' : 'SOUND OFF'; $('sound').setAttribute('aria-pressed', on); };

const game = createGame($('cv'), {
  blip,
  hud: (s) => { $('score').textContent = s.score; $('setn').textContent = s.set; $('lives').textContent = '●'.repeat(s.lives); },
  end: (win, score) => { $('game').classList.remove('on'); const e = $('end'); e.classList.add('on');
    $('endKick').textContent = win ? 'GAME, SET, MATCH' : 'DOUBLE FAULT';
    $('endTitle').textContent = win ? 'Ace broken' : 'Next serve';
    $('endScore').textContent = score + ' pts'; gsap.fromTo(e.children, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: .9, ease: 'power3.out', stagger: .1 }); },
});
const show = (sel) => { ['home', 'game', 'end'].forEach((i) => { $(i).classList.remove('on'); if (i !== 'home') $(i).style.display = ''; });
  $('home').style.display = sel === 'home' ? '' : 'none'; if (sel !== 'home') $(sel).classList.add('on'); };
const startGame = () => { show('game'); game.start(); };
$('play').onclick = startGame; $('again').onclick = startGame;

// Menu: ellipse clip-path grows from the button, links rise with back.out(1.2).
let open = false;
const origin = 'calc(100% - 3.4rem) 2.6rem';
const toggle = (v = !open) => { open = v; document.body.classList.toggle('menu-open', open);
  gsap.to('#menu', { clipPath: open ? `ellipse(150% 150% at ${origin})` : `ellipse(0% 0% at ${origin})`, duration: .8, ease: 'power3.out' });
  if (open) gsap.fromTo('#menu a', { yPercent: 110, rotate: 4 }, { yPercent: 0, rotate: 0, duration: .9, ease: 'back.out(1.2)', stagger: .07, delay: .25 }); };
$('menuBtn').onclick = () => toggle();
$('menu').addEventListener('click', (e) => { const a = e.target.closest('a'); if (!a) return; e.preventDefault();
  const act = a.dataset.act; if (act === 'rules') return void gsap.to('#rules', { opacity: 1, duration: .6 });
  game.stop(); toggle(false); show('home'); if (act === 'home') setTimeout(startGame, 400); });
