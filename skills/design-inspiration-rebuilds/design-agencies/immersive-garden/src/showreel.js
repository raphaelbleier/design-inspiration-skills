/* SHOWREEL SLIDESHOW + FULLSCREEN POP-IN
   Plane: 8 of 12 columns, 16:9. Slides crossfade (1.2 s) every 5 s; arrows step manually.
   Hover: plane scales to .97 over 2 s, a dark shade rises .2 -> .48, cursor label "Play".
   Click opens the pop-in: the plane's rectangle expands to the full viewport in two beats
   (uFullscreen 0 -> .5 in 1 s power2.inOut, -> 1 in 1.5 s power2.inOut); controls fade in 2.25 s.
   Implemented with a fixed clone animated through clip-path so the layout never shifts. */
import { gsap } from 'gsap';
import { state } from './state.js';
import { stop, start } from './scroll.js';

export function mountShowreel(root) {
  const box = root.querySelector('[data-showreel]'); if (!box) return;
  const slides = [...box.querySelectorAll('.showreel__slide')], count = box.querySelector('.count');
  let i = 0, timer;
  const go = (n) => { slides[i].classList.remove('is-on'); i = (n + slides.length) % slides.length; slides[i].classList.add('is-on'); count.textContent = `${i + 1} / ${slides.length}`; };
  const auto = () => { clearInterval(timer); if (!state.reduced) timer = setInterval(() => go(i + 1), 5000); };
  auto();
  box.querySelector('[data-prev]').addEventListener('click', (e) => { e.stopPropagation(); go(i - 1); auto(); });
  box.querySelector('[data-next]').addEventListener('click', (e) => { e.stopPropagation(); go(i + 1); auto(); });

  let pop = document.getElementById('popin');
  if (!pop) { pop = document.createElement('div'); pop.id = 'popin'; pop.innerHTML = '<img alt=""><div class="popin__ui"><span style="position:absolute;left:40px;bottom:40px">Showreel</span><button class="popin__close" type="button">Close</button></div>'; document.body.append(pop); }
  const pimg = pop.querySelector('img'), ui = pop.querySelector('.popin__ui');
  const close = () => {
    const r = box.getBoundingClientRect();
    gsap.to(ui, { opacity: 0, duration: 0.4 });
    gsap.to(pop, { clipPath: `inset(${r.top}px ${innerWidth - r.right}px ${innerHeight - r.bottom}px ${r.left}px)`, duration: state.reduced ? 0.01 : 1.2, ease: 'power2.inOut', onComplete: () => { pop.classList.remove('is-open'); start(); } });
  };
  pop.querySelector('.popin__close').onclick = close;
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && pop.classList.contains('is-open')) close(); });
  box.addEventListener('click', () => {
    const r = box.querySelector('.showreel__frame').getBoundingClientRect();
    pimg.src = slides[i].querySelector('img').src; pop.classList.add('is-open'); stop();
    const from = `inset(${r.top}px ${innerWidth - r.right}px ${innerHeight - r.bottom}px ${r.left}px)`;
    gsap.set(pop, { clipPath: from });
    const tl = gsap.timeline();
    const mid = `inset(${r.top * 0.5}px ${(innerWidth - r.right) * 0.5}px ${(innerHeight - r.bottom) * 0.5}px ${r.left * 0.5}px)`;
    tl.to(pop, { clipPath: mid, duration: state.reduced ? 0.01 : 1, ease: 'power2.inOut' })
      .to(pop, { clipPath: 'inset(0px 0px 0px 0px)', duration: state.reduced ? 0.01 : 1.5, ease: 'power2.inOut' })
      .to(ui, { opacity: 1, duration: state.reduced ? 0.01 : 2.25 }, '<0.5');
  });
  return () => { clearInterval(timer); };
}
