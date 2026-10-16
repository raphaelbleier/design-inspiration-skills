/*
 * SEASON SWITCHER ("Hold and move").
 * A draggable knob rides an SVG path. Pointer position is projected onto the nearest of
 * 101 samples along the path (getPointAtLength), giving a progress 0..1 even when the
 * pointer wanders off the curve. Release snaps to 0 or 1 in 0.8s "Ease". Below 0.4 the
 * season is summer, above 0.5 winter (hysteresis gap avoids flicker at the midpoint).
 *
 * The scene holds two halftone layers (summer / winter photos). Switching cross-fades them
 * through the shader threshold over 1.2s "Ease": 255 = fully drawn, 0 = dissolved (bright
 * cells vanish first). The original does the same with black/white-point pairs
 * ({0,255} vs {254,255}); threshold gives an equivalent dissolve with simpler maths.
 */
import { gsap, reduced } from '../core/gsap.js';
import { createHalftone } from './halftone.js';
import { $ } from '../core/dom.js';

const COPY = {
  summer: 'Summer turns this area into an exciting adventure map: hiking trails, mountain river rafting, cultural festivals, and culinary journeys.',
  winter: 'In winter the valley goes quiet and bright: groomed ski runs, snowshoe routes, thermal baths and long evenings by the fire.',
};

export function initSeasons(images) {
  const common = { xSquares: 120, ySquares: 56, bgOpacity: 0, fill: '--sand', blackPoint: 15, whitePoint: 225, gamma: 1 };
  const scene = createHalftone($('#sea-ht'), [
    { source: images.summer, ...common, threshold: 0 },
    { source: images.winter, ...common, threshold: 0 },
  ]);
  const [sum, win] = scene ? scene.layers.map((l) => l.cfg) : [{}, {}];
  if (scene) {
    if (reduced) sum.threshold = 255;
    else gsap.to(sum, { threshold: 255, duration: 1.6, ease: 'Out', scrollTrigger: { trigger: '#sea-ht', start: 'top 75%', once: true } });
  }

  const knob = $('#knob'), handle = $('#knob-handle'), path = $('#knob-path'), endEl = $('.knob_end');
  const L = path.getTotalLength();
  const pts = Array.from({ length: 101 }, (_, i) => path.getPointAtLength((L * i) / 100));
  const scale = () => knob.clientWidth / 400;
  const place = (el, p) => { const s = scale(); el.style.left = p.x * s + 'px'; el.style.top = p.y * s + 'px'; };
  const state = { p: 0, season: 'summer' };
  const draw = () => place(handle, pts[Math.round(state.p * 100)]);
  place(endEl, pts[100]); draw();
  addEventListener('resize', () => { place(endEl, pts[100]); draw(); });

  const copy = $('#sea-copy');
  function setSeason(s) {
    if (s === state.season) return;
    state.season = s;
    if (scene) {
      const [a, b] = s === 'summer' ? [sum, win] : [win, sum];
      gsap.to(a, { threshold: 255, duration: 1.2, ease: 'Ease', overwrite: true });
      gsap.to(b, { threshold: 0, duration: 1.2, ease: 'Ease', overwrite: true });
    }
    gsap.to(copy, { opacity: 0, yPercent: 20, duration: 0.4, ease: 'In', onComplete: () => {
      copy.textContent = COPY[s];
      gsap.fromTo(copy, { opacity: 0, yPercent: 20 }, { opacity: 1, yPercent: 0, duration: 0.8, ease: 'Out' });
    } });
  }

  let dragging = false;
  handle.addEventListener('pointerdown', (e) => { dragging = true; handle.setPointerCapture(e.pointerId); gsap.killTweensOf(state); });
  handle.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const r = knob.getBoundingClientRect(), s = scale();
    const x = (e.clientX - r.left) / s, y = (e.clientY - r.top) / s;
    let best = 0, bd = Infinity;
    pts.forEach((p, i) => { const d = (p.x - x) ** 2 + (p.y - y) ** 2; if (d < bd) { bd = d; best = i; } });
    state.p = best / 100; draw();
    if (state.p < 0.4) setSeason('summer'); else if (state.p > 0.5) setSeason('winter');
  });
  const release = () => {
    if (!dragging) return; dragging = false;
    const to = state.p < 0.5 ? 0 : 1;
    gsap.to(state, { p: to, duration: 0.8, ease: 'Ease', onUpdate: draw });
    setSeason(to ? 'winter' : 'summer');
  };
  handle.addEventListener('pointerup', release); handle.addEventListener('pointercancel', release);
  endEl.addEventListener('click', () => { setSeason('winter'); gsap.to(state, { p: 1, duration: 0.8, ease: 'Ease', onUpdate: draw }); });
}
