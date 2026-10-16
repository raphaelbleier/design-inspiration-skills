// Gate + sound. Procedural drone (two detuned sines 55/55.7 Hz through a lowpass 220 Hz) plus a
// slow LFO on gain; fades 2s. No audio files. Toggle in the header.
import gsap from 'gsap';

let ctx, master;
function start() {
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  master = ctx.createGain(); master.gain.value = 0;
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 220;
  [55, 55.7, 110.2].forEach((f, i) => { const o = ctx.createOscillator(); o.frequency.value = f; const g = ctx.createGain(); g.gain.value = i === 2 ? .15 : .5; o.connect(g).connect(lp); o.start(); });
  const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = .08; lg.gain.value = .25; lfo.connect(lg).connect(master.gain); lfo.start();
  lp.connect(master).connect(ctx.destination);
}
function set(on) {
  const btn = document.getElementById('snd');
  btn.setAttribute('aria-pressed', on); btn.querySelector('span').textContent = on ? 'on' : 'off';
  if (!ctx) { if (!on) return; start(); }
  ctx.resume();
  gsap.to(master.gain, { value: on ? .35 : 0, duration: 2, ease: 'power2.out' });
}

export function initGate(done) {
  const gate = document.getElementById('gate');
  const leave = (sound) => {
    if (gate.classList.contains('off')) return;
    gate.classList.add('off'); document.body.classList.remove('gated'); set(sound); done();
  };
  document.body.classList.add('gated');
  gate.addEventListener('click', (e) => leave(e.target.id !== 'skip'));
  document.getElementById('snd').addEventListener('click', () => set(document.getElementById('snd').getAttribute('aria-pressed') !== 'true'));
}
