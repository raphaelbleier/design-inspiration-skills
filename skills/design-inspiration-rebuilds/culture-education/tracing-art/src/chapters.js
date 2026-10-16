// Technique: one 100vh stage pinned for 400vh (ScrollTrigger pin, scrub off, snap-free).
// Each beat (owner pair + artwork) switches when progress crosses i/N: owners rise from a mask
// (yPercent 110 -> 0, 1s power3.out), the artwork opens with inset clip-path (1.1s power3.inOut),
// and the stage background tints to the beat's colour (1.2s, power2.inOut).
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { chapters, works, src } from './data.js';
import { reduced } from './scroll.js';

export function initChapters() {
  const sec = document.querySelector('#chapters');
  const stage = sec.querySelector('.stage');
  const L = sec.querySelector('.o-left'), Rr = sec.querySelector('.o-right');
  const img = sec.querySelector('#artImg'), frame = sec.querySelector('.frame');
  const title = sec.querySelector('#artTitle'), meta = sec.querySelector('#artMeta');
  const dots = [...document.querySelectorAll('.progress b')];
  const wrap = (el) => { el.innerHTML = `<span style="display:block;overflow:hidden;padding-bottom:.08em"><span class="in" style="display:block"></span></span>`; return el.querySelector('.in'); };
  const lIn = wrap(L), rIn = wrap(Rr);
  let cur = -1;

  function show(i) {
    if (i === cur) return; cur = i;
    const c = chapters[i], w = works[c.work];
    dots.forEach((d, k) => d.classList.toggle('on', k === i));
    lIn.textContent = c.left; rIn.textContent = c.right;
    img.style.visibility = ''; img.onerror = () => { img.style.visibility = 'hidden'; }; img.src = src(w); title.textContent = w.title; meta.textContent = `${w.by} - ${c.meta}`;
    frame.style.aspectRatio = w.ar.replace('/', ' / ');
    if (reduced) { stage.style.background = c.tint; return; }
    gsap.fromTo([lIn, rIn], { yPercent: 110 }, { yPercent: 0, duration: 1, ease: 'power3.out', stagger: 0.12, overwrite: true });
    gsap.fromTo(frame, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power3.inOut', overwrite: true });
    gsap.fromTo(img, { scale: 1.3 }, { scale: 1, duration: 1.4, ease: 'power3.out', overwrite: true });
    gsap.to(stage, { backgroundColor: c.tint, duration: 1.2, ease: 'power2.inOut' });
  }

  ScrollTrigger.create({
    trigger: stage, start: 'top top', end: `+=${chapters.length * 100}%`, pin: true,
    onUpdate: (s) => show(Math.min(chapters.length - 1, Math.floor(s.progress * chapters.length))),
    onEnter: () => show(0),
  });
  show(0);
  // dots belong to the chapter section only
  const prog = document.querySelector('.progress');
  gsap.set(prog, { autoAlpha: 0 });
  ScrollTrigger.create({ trigger: sec, start: 'top 60%', end: 'bottom 40%',
    onToggle: (s) => gsap.to(prog, { autoAlpha: s.isActive ? 1 : 0, duration: 0.4 }) });
}
