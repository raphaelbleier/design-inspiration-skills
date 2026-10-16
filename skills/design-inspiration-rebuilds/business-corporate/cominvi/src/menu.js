// Technique: full-screen menu opened with a circle clip-path from the burger button.
// Values: open .9s power3.inOut from circle(0% at 3.5rem,3rem top-right) to circle(150%); links y 100% -> 0, stagger .06.
import gsap from 'gsap';
export function initMenu() {
  const btn = document.querySelector('.menu-btn'), menu = document.querySelector('.menu'), label = btn.querySelector('span');
  let open = false;
  const toggle = (v = !open) => {
    open = v;
    btn.setAttribute('aria-expanded', open);
    label.textContent = open ? 'Close' : 'Menu';
    document.querySelector('.hero-cards').style.visibility = open ? 'hidden' : '';
    menu.classList.toggle('open', open);
    gsap.to(menu, { clipPath: open ? 'circle(150% at calc(100% - 3.5rem) 3rem)' : 'circle(0% at calc(100% - 3.5rem) 3rem)', duration: 0.9, ease: 'power3.inOut' });
    if (open) gsap.fromTo('.menu a', { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.06, delay: 0.3 });
  };
  btn.addEventListener('click', () => toggle());
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => toggle(false)));
}
