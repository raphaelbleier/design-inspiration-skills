// Hero intro + looping racket/ball mini rally.
// Title chars rise 110% -> 0 with 4deg rotate, 1s expo.out, stagger .03; rule draws via dashoffset 1.2s.
// Rally loop: ball falls to the racket, bounces back diagonally (1.4s total, sine ease), racket slides under it.
import gsap from 'gsap';
export function initHero(reduced) {
  const split = (el) => { const t = el.textContent; el.textContent = '';
    return [...t].map((c) => { const s = document.createElement('span'); s.className = 'char'; s.textContent = c === ' ' ? ' ' : c; el.append(s); return s; }); };
  const chars = [...document.querySelectorAll('.title span')].flatMap(split);
  const rule = document.getElementById('rule'), len = rule.getTotalLength();
  if (reduced) return;
  gsap.set(rule, { strokeDasharray: len, strokeDashoffset: len });
  gsap.set('.title', { overflow: 'hidden', paddingBottom: '.06em' });
  gsap.set('.cta', { autoAlpha: 0, y: 30 });
  gsap.timeline({ delay: .3 })
    .from(chars, { yPercent: 110, rotate: 4, duration: 1, ease: 'expo.out', stagger: .03 })
    .to(rule, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' }, '-=.6')
    .to('#play', { autoAlpha: 1, y: 0, duration: .9, ease: 'back.out(1.4)' }, '-=.7');
  const tl = gsap.timeline({ repeat: -1, delay: 1.2 });
  tl.set('.ball', { left: '-4%', top: '-40%' }).set('.pad', { x: '-60%' }).set('.trail', { opacity: 0 })
    .to('.ball', { left: '36%', top: '56%', duration: .7, ease: 'sine.in' })
    .to('.pad', { x: 0, duration: .7, ease: 'power2.out' }, 0)
    .to('.trail', { opacity: 1, duration: .5 }, .2)
    .to('.ball', { left: '86%', top: '-30%', duration: .7, ease: 'sine.out' })
    .to('.trail', { opacity: 0, duration: .4 }, '<.2').to({}, { duration: .5 });
}
