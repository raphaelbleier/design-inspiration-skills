/* SOUND TOGGLE
   Bottom-right control: a 60px canvas in the original, here an SVG circle (2px stroke) whose
   ring draws with stroke-dashoffset 1 -> 0 (.6 s, ease circleDraw = cubic-bezier(.4,0,0,1)); the
   centre dot scales on hover and when "on". Below 560px it collapses to the label "On/Off" + small dot.
   Audio is a tiny generated pad (two detuned sines through a lowpass with a slow LFO, gain 0.05)
   so the toggle does something real without shipping an audio file. Starts muted: browsers
   require a click anyway, and the site never autoplays sound. */
let ctx, master;
export const sound = { asked: false, on: false };
window.__sound = sound;

function build() {
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 520; lp.connect(master);
  [110, 164.8, 220.6].forEach((f, i) => { const o = ctx.createOscillator(); o.type = i === 2 ? 'triangle' : 'sine'; o.frequency.value = f; const g = ctx.createGain(); g.gain.value = i === 2 ? 0.25 : 0.5; o.connect(g).connect(lp); o.start(); });
  const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.07; lg.gain.value = 180; lfo.connect(lg).connect(lp.frequency); lfo.start();
}

export function initSound() {
  const btn = document.getElementById('sound'), txt = btn.querySelector('.sound__txt');
  btn.addEventListener('click', () => {
    sound.asked = true; sound.on = !sound.on;
    btn.setAttribute('aria-pressed', sound.on); txt.textContent = sound.on ? 'On' : 'Off';
    try {
      if (!ctx) build();
      if (ctx.state === 'suspended') ctx.resume();
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.linearRampToValueAtTime(sound.on ? 0.05 : 0, ctx.currentTime + 1.5);
    } catch { /* audio blocked: the visual toggle still works */ }
  });
}
