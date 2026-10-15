/*
 * SLOT-MACHINE TEXT ROLLOVER
 * --------------------------
 * Every character is wrapped in an overflow-hidden box that stacks two copies (original + clone).
 * Each char owns a paused timeline: yPercent -= 100, ease none, duration 1, repeat random(8..14). Because the clone
 * is identical, each loop is seamless, so progress 1 lands exactly on the original letter.
 *
 * play():  tween all char timelines to progress 1, duration 2, ease expo.out, stagger 0.04 from "random"
 *          then reset to progress 0 (that reset is invisible).
 * Schedule (see Roller): 2 s after the slide settles, then every 6 s while idle; scrolling pauses it for 1 s.
 */
import gsap from 'gsap';

export function split(el) {
  if (el._ro) return el._ro;
  const text = el.textContent.trim();
  el.setAttribute('aria-label', text);
  el.textContent = '';
  const chars = [];
  text.split(' ').forEach((word, wi, arr) => {
    const w = document.createElement('span'); w.className = 'ro-word'; w.setAttribute('aria-hidden', 'true');
    [...word].forEach((c) => {
      const box = document.createElement('span'); box.className = 'ro-ch';
      const inner = document.createElement('span'); inner.className = 'ro-in';
      inner.innerHTML = `<span>${c}</span><span>${c}</span>`;
      box.appendChild(inner); w.appendChild(box); chars.push(inner);
    });
    el.appendChild(w);
    if (wi < arr.length - 1) el.appendChild(document.createTextNode(' '));
  });
  const tls = chars.map((c) => gsap.timeline({ paused: true }).to(c, { yPercent: -50, ease: 'none', duration: 1, repeat: gsap.utils.random(8, 14, 1) }));
  el._ro = {
    chars, tls,
    play() {
      gsap.killTweensOf(tls);
      gsap.to(tls, { progress: 1, duration: 2, ease: 'expo.out', stagger: { each: 0.04, ease: 'none', from: 'random' }, onComplete: () => tls.forEach((t) => t.progress(0)) });
    },
    kill() { gsap.killTweensOf(tls); tls.forEach((t) => t.progress(0).kill()); },
  };
  return el._ro;
}

/** Scheduler for one "active" set of elements. */
export class Roller {
  constructor(reduced) { this.reduced = reduced; this.timer = null; this.pausedUntil = 0; this.els = []; }
  start(els) {
    this.stop(); if (this.reduced) return;
    this.els = els.map(split);
    const run = () => {
      if (performance.now() < this.pausedUntil) { this.timer = setTimeout(run, 1000); return; }
      this.els.forEach((r) => r.play());
      this.timer = setTimeout(run, 6000);
    };
    this.timer = setTimeout(run, 2000);
  }
  bump() { this.pausedUntil = performance.now() + 1000; }
  stop() { clearTimeout(this.timer); this.els.forEach((r) => gsap.killTweensOf(r.tls)); this.els.forEach((r) => r.tls.forEach((t) => t.progress(0))); this.els = []; }
}
