/* Optional typing blips (WebAudio, off by default, toggled bottom-right).
   Square wave, 700-1100Hz random pitch, 35ms, gain .03 - tiny terminal tick. */
let ctx = null;
export let enabled = false;

export function toggleSound(btn) {
  enabled = !enabled;
  if (enabled && !ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (enabled) ctx.resume();
  btn.textContent = enabled ? 'sound on' : 'sound off';
  btn.setAttribute('aria-pressed', String(enabled));
}

export function blip() {
  if (!enabled || !ctx) return;
  const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime;
  o.type = 'square'; o.frequency.value = 700 + Math.random() * 400;
  g.gain.setValueAtTime(0.03, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);
  o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + 0.04);
}
