/* Chapters: a tilted cover carousel + pill player + circular-reveal reader.
 * Each cover is placed from its distance d to the current index:
 *   x = d * 1.12 * size, rotation = d * 9deg, rotateY = -d * 16deg, scale = d == 0 ? 1 : .78, y = |d| * 2vh
 * moves use 0.9s power3.out; drag past 60px (or arrow keys / buttons) changes chapter.
 * Reader opens with clip-path circle(0% -> 150%) from the player's play button.
 */
import gsap from 'gsap';
import { onEnter } from './router.js';

export function initChapters() {
  const stage = document.getElementById('stage');
  const covers = [...stage.querySelectorAll('.cover')];
  const title = document.getElementById('p-title'), time = document.getElementById('p-time');
  const prev = document.getElementById('prev'), next = document.getElementById('next');
  let cur = 0;

  const size = () => covers[0].offsetWidth;
  function layout(animate = true) {
    const s = size();
    covers.forEach((c, i) => {
      const d = i - cur;
      gsap.to(c, {
        x: d * s * 1.12, y: Math.abs(d) * innerHeight * 0.02, rotation: d * 9, rotationY: -d * 16,
        scale: d === 0 ? 1 : 0.78, opacity: Math.abs(d) > 2 ? 0 : 1, zIndex: 10 - Math.abs(d),
        duration: animate ? 0.9 : 0, ease: 'power3.out', overwrite: 'auto',
      });
    });
    title.textContent = covers[cur].dataset.title;
    time.textContent = covers[cur].dataset.time;
    prev.disabled = cur === 0; next.disabled = cur === covers.length - 1;
  }
  const to = (i) => { cur = Math.max(0, Math.min(covers.length - 1, i)); layout(); };

  prev.onclick = () => to(cur - 1);
  next.onclick = () => to(cur + 1);
  addEventListener('keydown', (e) => {
    if (document.body.dataset.view !== 'chapters' || reader.open) return;
    if (e.key === 'ArrowLeft') to(cur - 1);
    if (e.key === 'ArrowRight') to(cur + 1);
  });

  let x0 = null, moved = 0;
  stage.addEventListener('pointerdown', (e) => { x0 = e.clientX; moved = 0; stage.classList.add('is-drag'); });
  addEventListener('pointermove', (e) => { if (x0 !== null) moved = e.clientX - x0; });
  addEventListener('pointerup', () => {
    if (x0 === null) return;
    stage.classList.remove('is-drag');
    if (moved < -60) to(cur + 1); else if (moved > 60) to(cur - 1);
    x0 = null;
  });
  covers.forEach((c, i) => c.addEventListener('click', () => {
    if (Math.abs(moved) > 6) return;
    if (i === cur) reader.show(); else to(i);
  }));
  addEventListener('resize', () => layout(false));

  /* reader */
  const el = document.getElementById('reader'), img = document.getElementById('r-img'), count = document.getElementById('r-count');
  const pages = ['page-01', 'page-02', 'page-03'];
  let p = 0;
  const reader = {
    open: false,
    show() {
      const b = document.getElementById('play').getBoundingClientRect();
      const at = `${b.left + b.width / 2}px ${b.top + b.height / 2}px`;
      reader.open = true; el.style.visibility = 'visible'; el.setAttribute('aria-hidden', 'false');
      gsap.fromTo(el, { clipPath: `circle(0% at ${at})` }, { clipPath: `circle(150% at ${at})`, duration: 0.9, ease: 'power3.inOut' });
      gsap.from('.reader__page', { scale: 0.85, rotate: -3, duration: 0.9, delay: 0.3, ease: 'back.out(1.2)' });
    },
    hide() {
      reader.open = false; el.setAttribute('aria-hidden', 'true');
      gsap.to(el, { clipPath: 'circle(0% at 50% 50%)', duration: 0.6, ease: 'power3.inOut', onComplete: () => (el.style.visibility = 'hidden') });
    },
  };
  const page = (n) => {
    p = (n + pages.length) % pages.length;
    gsap.fromTo(img, { xPercent: 8, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 0.5, ease: 'power2.out' });
    img.src = `img/${pages[p]}.webp`; count.textContent = `${p + 1} / ${pages.length}`;
  };
  document.getElementById('play').onclick = reader.show;
  document.getElementById('r-close').onclick = reader.hide;
  document.getElementById('r-prev').onclick = () => page(p - 1);
  document.getElementById('r-next').onclick = () => page(p + 1);

  onEnter('chapters', () => {
    layout(false);
    if (reader.open) { el.style.visibility = 'hidden'; reader.open = false; }
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.from(covers, { y: '+=120', opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.08, delay: 0.3 });
    gsap.from('.player', { yPercent: 160, duration: 0.9, ease: 'back.out(1.3)', delay: 0.5 });
  });
}
