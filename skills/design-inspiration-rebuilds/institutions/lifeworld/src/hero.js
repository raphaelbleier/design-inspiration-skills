/**
 * hero.js - 300vh section with a sticky stage.
 * 0.00-0.18  black statement words fade in on load, scroll hint fades out
 * 0.20-0.55  white wordmark panel rises from the bottom (yPercent 100 -> 0)
 * 0.25-0.85  each of the nine letters is a clipped cell; the glyph starts displaced
 *            (y +-0.7 stage height, scaleY x0.4-0.9, skewY +-14deg, scaleX x0.7-1.3) and settles
 *            to a perfect fit (scaleX/scaleY computed from canvas metrics), stagger .06 of the timeline.
 * Scrub: true (Lenis already smooths). Stage clips the glyphs so they look sliced mid-assembly.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { metrics } from './glyph.js';
import { reduced, scrollToY } from './scroll.js';

gsap.registerPlugin(ScrollTrigger, SplitText);
const WORD = 'GLASSHOUR';

export function initHero() {
  const stage = document.querySelector('.hero-stage');
  const word = stage.querySelector('.wm-word');
  const panel = stage.querySelector('.wm-line');
  const statement = document.getElementById('statement');
  const split = SplitText.create(statement, { type: 'words', wordsClass: 'w' });

  // build letter cells
  const letters = [...WORD].map((ch) => {
    const cell = document.createElement('span'); cell.className = 'wm-ch';
    const g = document.createElement('span'); g.textContent = ch;
    cell.append(g); word.append(cell); return { ch, g };
  });

  let tl;
  const build = () => {
    tl && tl.scrollTrigger && tl.scrollTrigger.kill(); tl && tl.kill();
    const H = stage.clientHeight, W = stage.clientWidth, cw = W / WORD.length;
    letters.forEach(({ ch, g }) => {
      const m = metrics(ch, 200);
      const sy = (H * 0.97) / m.cap, sx = (cw * 0.98) / m.width;
      Object.assign(g.style, { fontSize: '200px', top: `${H * 0.985 - m.base}px`, left: '50%' });
      g.dataset.sx = sx; g.dataset.sy = sy;
      gsap.set(g, { xPercent: -50, transformOrigin: `50% ${m.base}px`, scaleX: sx, scaleY: sy, y: 0, skewY: 0 });
    });
    if (reduced) return;
    gsap.set(panel, { yPercent: 100 });
    const rnd = gsap.utils.random;
    tl = gsap.timeline({ defaults: { ease: 'none' },
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom bottom', scrub: true } });
    tl.to('#down, .headnote', { opacity: 0, duration: 0.1 }, 0.06)
      .fromTo(panel, { yPercent: 100 }, { yPercent: 0, duration: 0.35, ease: 'power2.inOut' }, 0.2);
    letters.forEach(({ g }, i) => {
      const sx = +g.dataset.sx, sy = +g.dataset.sy;
      tl.fromTo(g, { y: rnd(-0.7, 0.7) * H, scaleY: sy * rnd(0.4, 0.9), scaleX: sx * rnd(0.7, 1.3), skewY: rnd(-14, 14) },
        { y: 0, scaleY: sy, scaleX: sx, skewY: 0, duration: 0.45, ease: 'power3.out' }, 0.25 + i * 0.06);
    });
    tl.to({}, { duration: 0.1 }, 0.9);
    ScrollTrigger.refresh();
  };
  build();
  addEventListener('resize', build);

  if (!reduced) {
    gsap.from(split.words, { opacity: 0.12, yPercent: 40, duration: 1.2, ease: 'power3.out', stagger: 0.08, delay: 0.2 });
    gsap.from('.headnote, #down', { opacity: 0, duration: 1.2, delay: 1 });
  }
  document.getElementById('down').addEventListener('click', () => scrollToY(innerHeight * 3));
}
