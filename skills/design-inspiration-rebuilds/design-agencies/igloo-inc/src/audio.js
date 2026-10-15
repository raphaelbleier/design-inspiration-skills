/**
 * Sound toggle (muted by default, like the original: `muted: true`, master volume 1).
 *
 * TECHNIQUE: no audio files. A tiny Web Audio graph is synthesised on first unmute:
 *  - a low drone (three sines 55 / 82.4 / 110 Hz through a 420 Hz lowpass),
 *  - "wind": looping white noise through a bandpass whose centre drifts with an LFO.
 * Page volumes are set from the scroll location (igloo = wind, cubes = quiet drone,
 * entry = drone swells towards the room), smoothed with setTargetAtTime.
 */
let ctx, drone, wind, on = false;

function build() {
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  const master = ctx.createGain();
  master.gain.value = 0.5;
  master.connect(ctx.destination);

  drone = ctx.createGain(); drone.gain.value = 0;
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420;
  [55, 82.4, 110].forEach((f, i) => {
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f; o.detune.value = i * 4;
    const g = ctx.createGain(); g.gain.value = 0.18 / (i + 1);
    o.connect(g).connect(lp); o.start();
  });
  lp.connect(drone).connect(master);

  const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const n = ctx.createBufferSource(); n.buffer = buf; n.loop = true;
  const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 500; bp.Q.value = 0.6;
  const lfo = ctx.createOscillator(); lfo.frequency.value = 0.08;
  const lg = ctx.createGain(); lg.gain.value = 260;
  lfo.connect(lg).connect(bp.frequency); lfo.start();
  wind = ctx.createGain(); wind.gain.value = 0;
  n.connect(bp).connect(wind).connect(master); n.start();
}

export function createAudio(button) {
  const label = button.querySelector('span');
  button.addEventListener('click', () => {
    on = !on;
    if (on && !ctx) build();
    if (ctx) (on ? ctx.resume() : ctx.suspend());
    label.textContent = on ? 'On' : 'Off';
    button.setAttribute('aria-pressed', String(on));
  });
  return {
    /** page index + progress -> mix */
    update(i, p) {
      if (!ctx || !on) return;
      const t = ctx.currentTime;
      const w = i === 0 ? 0.16 : i === 2 ? 0.05 : 0.02;
      const d = i === 0 ? 0.25 : i === 1 ? 0.45 : 0.3 + p * 0.6;
      wind.gain.setTargetAtTime(w, t, 0.4);
      drone.gain.setTargetAtTime(d, t, 0.4);
    },
  };
}
