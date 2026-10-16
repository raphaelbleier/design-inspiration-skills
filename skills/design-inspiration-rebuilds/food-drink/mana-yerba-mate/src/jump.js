/**
 * jump.js - footer mini game: the figure walks (CSS), Space / click / tap makes it jump
 * (y -> -22vh up .35s power2.out, back .45s bounce.out).
 */
import gsap from 'gsap';

export function initJump() {
  const w = document.getElementById('walker');
  const btn = document.getElementById('jump-btn');
  if (!w) return;
  let air = false;
  const jump = () => {
    if (air) return; air = true;
    gsap.timeline({ onComplete: () => (air = false) })
      .to(w, { y: () => -innerHeight * 0.22, duration: 0.35, ease: 'power2.out' })
      .to(w, { y: 0, duration: 0.45, ease: 'bounce.out' });
  };
  addEventListener('keydown', (e) => { if (e.code === 'Space' && w.getBoundingClientRect().top < innerHeight && w.getBoundingClientRect().bottom > 0 && document.activeElement === document.body && scrollY + innerHeight >= document.documentElement.scrollHeight - 40) { e.preventDefault(); jump(); } });
  btn.addEventListener('click', jump);
  w.addEventListener('click', jump);
}
