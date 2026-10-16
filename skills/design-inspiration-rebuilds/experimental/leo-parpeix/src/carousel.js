// Technique: hand-rolled drag carousel with a cursor-following yellow "DRAG" pill.
// Values: slide step = slide width + gap; release throws with velocity * 0.25 s then snaps to the
// nearest slide (0.9s power3.out). Pill follows with quickTo .35s power3, scales to 1 on hover, .8 while dragging.
import gsap from 'gsap';
import { projects } from './data.js';

const esc = (s) => s.replace(/&/g, '&amp;');

export function initCarousels() {
  const host = document.getElementById('projects');
  host.innerHTML = projects.map(([id, title, cat, aw, yr, team, org, roles, color], i) => `
    <article class="proj">
      <div class="car"><div class="track">
        <div class="slide"><img src="./img/${id}-1.webp" alt="${esc(title)} — ${cat}" draggable="false" loading="lazy"></div>
        <div class="slide"><img src="./img/${id}-2.webp" alt="" draggable="false" loading="lazy"></div>
        <div class="slide tint" style="background:${color}">${esc(title)}</div>
      </div></div>
      <div class="meta">
        <span>${i + 1}</span>
        <span class="t">${esc(title)} <i>${cat}</i></span>
        <span class="aw">${aw}</span>
        <span class="yr">${yr}</span>
        <span class="team">${team}<br>@${org.replace(' ', '')}</span>
        <span></span><span></span><span></span><span></span>
        <span class="roles"><em>Roles</em>${roles.join('<br>')}</span>
      </div>
      <a class="link" href="#">Project link <span aria-hidden="true">↗</span></a>
    </article>`).join('');

  const pill = document.getElementById('drag');
  const px = gsap.quickTo(pill, 'x', { duration: 0.35, ease: 'power3' });
  const py = gsap.quickTo(pill, 'y', { duration: 0.35, ease: 'power3' });

  host.querySelectorAll('.car').forEach((car) => {
    const track = car.querySelector('.track');
    const slides = [...track.children];
    let x = 0, i = 0, startX = 0, startPos = 0, v = 0, last = 0, down = false;
    const step = () => slides[1].offsetLeft - slides[0].offsetLeft;
    const set = gsap.quickSetter(track, 'x', 'px');
    const bound = () => -step() * (slides.length - 1);

    car.addEventListener('pointerenter', () => gsap.to(pill, { autoAlpha: 1, scale: 1, duration: 0.3, ease: 'power3.out' }));
    car.addEventListener('pointerleave', () => { if (!down) gsap.to(pill, { autoAlpha: 0, scale: 0.6, duration: 0.3 }); });
    car.addEventListener('pointermove', (e) => { px(e.clientX); py(e.clientY); });
    car.addEventListener('pointerdown', (e) => {
      down = true; startX = last = e.clientX; startPos = x; v = 0;
      gsap.killTweensOf(track); car.setPointerCapture(e.pointerId);
      gsap.to(pill, { scale: 0.8, duration: 0.25 });
    });
    car.addEventListener('pointermove', (e) => {
      if (!down) return;
      v = e.clientX - last; last = e.clientX;
      x = gsap.utils.clamp(bound() - 60, 60, startPos + e.clientX - startX); set(x);
    });
    const up = () => {
      if (!down) return; down = false;
      gsap.to(pill, { scale: 1, duration: 0.25 });
      i = gsap.utils.clamp(0, slides.length - 1, Math.round(-(x + v * 0.25 * 60) / step()));
      gsap.to({ p: x }, { p: -i * step(), duration: 0.9, ease: 'power3.out', onUpdate() { x = this.targets()[0].p; set(x); } });
    };
    car.addEventListener('pointerup', up);
    car.addEventListener('pointercancel', up);
    addEventListener('resize', () => { x = -i * step(); set(x); });
  });
}
