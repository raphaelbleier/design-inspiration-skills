/**
 * Procedural audio (no sound files). The original ships .ogg loops; we synthesise instead.
 * - Music: four detuned triangle oscillators on a soft chord + random pentatonic plucks, master gain 0.1
 *   (same volume as the original's music loop). Starts on the first click (autoplay policy).
 * - SFX: short square/triangle blips for hover, click, type, jump, whoosh.
 */
let ctx, master, on = true;
const notes = [261.6, 293.7, 329.6, 392, 440, 523.3];

export function startAudio() {
  if (ctx) { ctx.resume(); return; }
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  master = ctx.createGain(); master.gain.value = 0.1; master.connect(ctx.destination);
  [130.8, 196, 246.9, 329.6].forEach((f, i) => {
    const o = ctx.createOscillator(), g = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
    o.type = 'triangle'; o.frequency.value = f; o.detune.value = i * 4;
    g.gain.value = 0.18; lfo.frequency.value = 0.07 + i * 0.03; lg.gain.value = 0.1;
    lfo.connect(lg); lg.connect(g.gain); o.connect(g); g.connect(master); o.start(); lfo.start();
  });
  const pluck = () => {
    if (on) tone(notes[(Math.random() * notes.length) | 0], 1.4, 'sine', 0.35);
    setTimeout(pluck, 1400 + Math.random() * 2600);
  };
  pluck();
}
function tone(f, d, type = 'square', v = 0.2, to = master) {
  if (!ctx) return;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.value = f;
  g.gain.setValueAtTime(v, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + d);
  o.connect(g); g.connect(to); o.start(); o.stop(ctx.currentTime + d);
}
export const sfx = {
  hover: () => tone(880, 0.06, 'square', 0.25),
  click: () => { tone(520, 0.08, 'square', 0.4); tone(780, 0.1, 'triangle', 0.4); },
  type: () => tone(300 + Math.random() * 120, 0.03, 'square', 0.12),
  jump: () => tone(420, 0.18, 'triangle', 0.4),
  whoosh: () => { tone(180, 0.6, 'sawtooth', 0.12); },
  pop: () => tone(660, 0.1, 'sine', 0.5),
};
export function toggleMusic() {
  on = !on;
  if (master) master.gain.setTargetAtTime(on ? 0.1 : 0, ctx.currentTime, 0.1);
  return on;
}
