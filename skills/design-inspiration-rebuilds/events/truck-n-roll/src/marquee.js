/**
 * marquee.js - footer: two tilted bands (-3deg and ghost +3deg). Content is duplicated, the track
 * moves xPercent 0 -> -50 linear, 28s loop. Scroll velocity from Lenis scales timeScale
 * (1 + |v| * .35, decaying back at .08/frame) and flips direction with scroll direction.
 */
import gsap from 'gsap';
import { reduced } from './scroll.js';

const UNIT = '<span class="bw">Tour</span><span class="bm">Rigline&reg;<br>Tour Freight<br>&amp; Staging.</span><span class="bw">It\'s a</span><span class="bl"><span>RIG</span><span>\'LINE</span></span>';

export function marquee(lenis) {
  const tracks = document.querySelectorAll('.band__t');
  tracks.forEach((t) => { t.innerHTML = UNIT.repeat(4); });
  if (reduced) return;
  const tweens = [...tracks].map((t, i) => gsap.fromTo(t, { xPercent: i ? -50 : 0 }, { xPercent: i ? 0 : -50, ease: 'none', duration: 28, repeat: -1 }));
  if (!lenis) return;
  let boost = 0;
  lenis.on('scroll', ({ velocity }) => { boost = Math.min(Math.abs(velocity) * 0.35, 6); });
  gsap.ticker.add(() => {
    boost *= 0.92;
    tweens.forEach((tw) => tw.timeScale(1 + boost));
  });
}
