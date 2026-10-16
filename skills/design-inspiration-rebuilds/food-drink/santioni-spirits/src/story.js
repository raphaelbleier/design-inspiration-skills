/* The story: ONE master GSAP timeline, scrubbed by one pinned ScrollTrigger.
 *
 * 11 panels, panel i starts at T = i * 3 timeline units. Around each seam:
 *   ink seam p   0 -> 1   duration 1,  power2.inOut, starts at T - .6     (new colour pours in from the bottom)
 *   old panel    autoAlpha 1 -> 0  .3 at T - .3       new panel  0 -> 1  .3 at T
 *   caption box  clip-path inset(0 100% 0 0) -> inset(0)  .5 power2.out, from T + .6, .5 apart
 *   caption text SplitText chars, autoAlpha 0 -> 1, stagger .008, same start
 *   picture      scale 1.08 -> 1 over the whole dwell (3 units, linear)
 * Scroll length: 14 viewport heights. Nav targets are computed from the same unit grid.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { state } from './ink.js';
import { lenis } from './scroll.js';

gsap.registerPlugin(ScrollTrigger, SplitText);
const UNIT = 3;

export function buildStory() {
  const panels = gsap.utils.toArray('.stage .panel');
  const tl = gsap.timeline({ defaults: { ease: 'none' } });
  const T = (i) => i * UNIT;

  panels.forEach((p, i) => {
    if (i > 0) {
      tl.fromTo(state.p[i - 1], { v: 0 }, { v: 1, duration: 1, ease: 'power2.inOut' }, T(i) - 0.6);
      tl.to(panels[i - 1], { autoAlpha: 0, duration: 0.3 }, T(i) - 0.3);
      tl.fromTo(p, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, T(i));
    }
    const pic = p.querySelector('.full img, .frame img');
    if (pic) tl.fromTo(pic, { scale: 1.08 }, { scale: 1, duration: UNIT }, T(i));

    p.querySelectorAll('.cap').forEach((cap, k) => {
      const at = T(i) + 0.6 + k * 0.5;
      const text = cap.querySelector('span');
      const split = new SplitText(text, { type: 'chars,words', charsClass: 'ch' });
      tl.fromTo(cap, { autoAlpha: 0, clipPath: 'inset(0 100% 0 0)' }, { autoAlpha: 1, clipPath: 'inset(0 0% 0 0)', duration: 0.5, ease: 'power2.out' }, at);
      tl.fromTo(split.chars, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01, stagger: 0.008 }, at + 0.15);
    });
  });

  // hero title drifts up while it is still on screen
  tl.to('.hero .h1', { yPercent: -10, duration: T(1) - 0.3 }, 0);
  // ruins title letters slide in
  const ri = panels.findIndex((p) => p.querySelector('.ruins-title'));
  tl.fromTo('.ruins-title .line', { yPercent: 100 }, { yPercent: 0, duration: 0.6, ease: 'power3.out', stagger: 0.12 }, T(ri) + 0.5);
  // pour: stream falls, bottle drops in, name appears
  const pi = panels.length - 1;
  tl.fromTo('.stream', { scaleY: 0 }, { scaleY: 1, duration: 0.8, ease: 'power1.in' }, T(pi) + 0.4);
  tl.fromTo('.pour-bottle', { yPercent: -120 }, { yPercent: 0, duration: 0.9, ease: 'power3.out' }, T(pi) + 0.3);
  tl.fromTo('.flavour', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out' }, T(pi) + 0.9);
  tl.to({}, { duration: 1 }, T(pi) + UNIT);   // hold the last frame

  const st = ScrollTrigger.create({
    animation: tl, trigger: '#stage', start: 'top top', end: () => '+=' + innerHeight * 14,
    pin: true, scrub: 0.6, invalidateOnRefresh: true,
    onUpdate: (self) => document.body.classList.toggle('on-light', [1, 2, 3, 8, 9].includes(Math.round(tl.time() / UNIT))),
  });

  const goTo = (t) => {
    const y = st.start + (t / tl.duration()) * (st.end - st.start);
    if (lenis) lenis.scrollTo(y, { duration: 2.2, easing: (x) => 1 - Math.pow(1 - x, 4) });
    else scrollTo({ top: y });
  };
  return {
    toStory: () => goTo(0),
    toSelect: () => goTo(T(9) + 1.2),
    toPour: () => goTo(T(10) + 1.4),
    handIndex: 4,
  };
}
