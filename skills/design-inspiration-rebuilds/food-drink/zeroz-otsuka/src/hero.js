/* Hero choreography.
   Technique: #kv is 520vh tall with a sticky 100vh child; one scrubbed GSAP timeline (trigger #kv,
   top top -> bottom bottom, scrub .6) runs on a 0-100 scale:
     0-45   WebGL progress 0 -> 1 (pouch spins, lamp swells), top copy rises, bottom copy sinks,
            brackets open +-9vw, side keywords fade
     40-100 radial "bloom" disc scales 0 -> 2.8 until the screen is flat white; intro takes over.
   Load-in: every headline is split into characters that rise from yPercent 110, stagger .035,
   1.1s power3.out. */
import gsap from 'gsap';
import { reduced } from './scroll.js';

function splitChars(el) {
  const text = el.textContent; el.textContent = '';
  el.setAttribute('aria-label', text);
  return [...text].map((ch) => { const s = document.createElement('span'); s.textContent = ch; s.setAttribute('aria-hidden', 'true'); el.append(s); return s; });
}

export function initHero(stage) {
  const chars = [...document.querySelectorAll('.t-hero')].flatMap(splitChars);
  if (reduced) return;
  gsap.from(chars, { yPercent: 110, duration: 1.1, ease: 'power3.out', stagger: 0.035, delay: 0.3 });
  gsap.from('.kv-ja, .kw, .brackets', { opacity: 0, duration: 1.2, ease: 'power2.out', delay: 1.1 });

  const prog = { p: 0 };
  const tl = gsap.timeline({ defaults: { ease: 'none' },
    scrollTrigger: { trigger: '#kv', start: 'top top', end: 'bottom bottom', scrub: 0.6 } });
  tl.to(prog, { p: 1, duration: 45, onUpdate: () => stage.setProgress(prog.p) }, 0)
    .to('.copy-top', { yPercent: -60, opacity: 0, duration: 35 }, 0)
    .to('.copy-bottom', { yPercent: 60, opacity: 0, duration: 35 }, 0)
    .to('.b-l', { x: '-9vw', duration: 45 }, 0).to('.b-r', { x: '9vw', duration: 45 }, 0)
    .to('.kw, .scroll-hint', { opacity: 0, duration: 12 }, 0)
    .fromTo('.bloom', { scale: 0 }, { scale: 2.8, duration: 60 }, 40);
}
