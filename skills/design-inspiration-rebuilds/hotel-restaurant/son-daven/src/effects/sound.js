/*
 * AMBIENT SOUND TOGGLE (opt-in, off by default: no autoplay).
 * No audio file ships: a soft wind bed is synthesised with WebAudio (brown noise through
 * a slow-swept low-pass, plus two quiet detuned drones). Master volume fades 0 -> 0.25
 * over 0.8s. The ten equaliser bars scale with yoyo tweens of random 0.3-0.6s duration,
 * centre bars tallest.
 */
import { gsap } from '../core/gsap.js';
import { $, $$ } from '../core/dom.js';

let ctx, master;

function build() {
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
  const len = ctx.sampleRate * 4, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
  const noise = ctx.createBufferSource(); noise.buffer = buf; noise.loop = true;
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 500;
  const lfo = ctx.createOscillator(); lfo.frequency.value = 0.07;
  const lfoG = ctx.createGain(); lfoG.gain.value = 260; lfo.connect(lfoG); lfoG.connect(lp.frequency);
  noise.connect(lp); lp.connect(master);
  [110, 164.9].forEach((f, i) => {
    const o = ctx.createOscillator(); o.frequency.value = f; o.detune.value = i ? 7 : -5;
    const g = ctx.createGain(); g.gain.value = 0.015; o.connect(g); g.connect(master); o.start();
  });
  noise.start(); lfo.start();
}

export function initSound() {
  const btn = $('#sound'), bars = $$('i', btn);
  const tweens = bars.map((b, i) => {
    const centre = 1 - Math.abs(i - 4.5) / 5;
    return gsap.to(b, { scaleY: 0.35 + centre * 0.65, duration: 0.3 + Math.random() * 0.3, yoyo: true, repeat: -1, ease: 'sine.inOut', paused: true });
  });
  btn.addEventListener('click', async () => {
    const on = btn.getAttribute('aria-pressed') !== 'true';
    btn.setAttribute('aria-pressed', on);
    if (on) {
      if (!ctx) build();
      await ctx.resume();
    }
    master && gsap.to(master.gain, { value: on ? 0.25 : 0, duration: 0.8 });
    tweens.forEach((t) => (on ? t.play() : t.pause()));
    if (!on) gsap.to(bars, { scaleY: 0.3, duration: 0.4 });
  });
}
