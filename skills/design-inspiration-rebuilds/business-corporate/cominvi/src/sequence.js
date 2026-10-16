// Technique: scroll-scrubbed frame sequence on a <canvas>, pinned with CSS sticky (hero is 420vh tall).
// Original scrubs a video-frame sequence; rebuild cross-fades 4 stills with a slow 1.12 -> 1 push-in.
// Values: scrub 0.6, cover-fit draw, hero text fades 0 -> 0.12 progress, counter eased to 1,000,000.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reduced } from './scroll.js';
const names = ['hero-1', 'hero-2', 'hero-3', 'hero-4'];
export function initSequence() {
  const cv = document.querySelector('.seq');
  const ctx = cv.getContext('2d');
  const imgs = names.map((n) => { const i = new Image(); i.src = `${import.meta.env.BASE_URL}img/${n}.webp`; i.onload = draw; return i; });
  const state = { p: 0 };
  function draw() {
    const w = (cv.width = cv.clientWidth * Math.min(devicePixelRatio, 2));
    const h = (cv.height = cv.clientHeight * Math.min(devicePixelRatio, 2));
    ctx.clearRect(0, 0, w, h);
    const f = state.p * (imgs.length - 1);
    const a = Math.floor(f), t = f - a;
    [[a, 1], [Math.min(a + 1, imgs.length - 1), t]].forEach(([i, alpha]) => {
      const im = imgs[i];
      if (!im.naturalWidth || alpha <= 0) return;
      const s = Math.max(w / im.naturalWidth, h / im.naturalHeight) * (1.12 - 0.12 * state.p);
      ctx.globalAlpha = i === a ? 1 : alpha;
      ctx.drawImage(im, (w - im.naturalWidth * s) / 2, (h - im.naturalHeight * s) / 2, im.naturalWidth * s, im.naturalHeight * s);
    });
    ctx.globalAlpha = 1;
  }
  addEventListener('resize', draw);
  draw();
  if (reduced) return;
  const count = document.querySelector('.hero-count b');
  const c = { v: 0 };
  gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom bottom', scrub: 0.6 } })
    .to(state, { p: 1, ease: 'none', duration: 1, onUpdate: draw }, 0)
    .to(c, { v: 1000000, ease: 'power1.out', duration: 0.8, onUpdate: () => (count.textContent = Math.round(c.v).toLocaleString('de-DE')) }, 0)
    .to('.hero h1, .hero-count', { opacity: 0, y: -40, ease: 'none', duration: 0.12 }, 0.02)
    .to('.hero-cards', { yPercent: 130, ease: 'none', duration: 0.1 }, 0.9);
  ScrollTrigger.refresh();
}
