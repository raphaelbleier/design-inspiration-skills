/*
 * audio.js - tiny Web Audio synth for UI/game feedback (the original ships a sample
 * sprite; we synthesise so no audio asset is needed). Unlocked on the first click.
 */
let ctx, muted = false
export const audio = {
  unlock() { ctx ||= new (window.AudioContext || window.webkitAudioContext)(); ctx.resume() },
  toggle() { muted = !muted; return muted },
  get muted() { return muted },
  blip(f = 520, dur = .07, type = 'sine', vol = .08, glide = 0) {
    if (!ctx || muted) return
    const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime
    o.type = type; o.frequency.setValueAtTime(f, t)
    if (glide) o.frequency.exponentialRampToValueAtTime(f * glide, t + dur)
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur)
    o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + dur)
  },
  hit: (fast) => audio.blip(fast ? 760 : 560, .06, 'triangle', .09, .7),
  click: () => audio.blip(900, .05, 'sine', .05),
  tick: () => audio.blip(440, .12, 'sine', .08),
  go: () => audio.blip(880, .3, 'sine', .09),
  score: (win) => { audio.blip(win ? 660 : 300, .18, 'sine', .09); setTimeout(() => audio.blip(win ? 990 : 220, .25, 'sine', .09), 120) },
}
