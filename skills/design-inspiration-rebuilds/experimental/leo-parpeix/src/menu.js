// Technique: full-screen menu opened by a circular clip-path that grows from the "····" button.
// Values: .8s power3.inOut open, links rise 110% -> 0 with .06 stagger.
import gsap from 'gsap';

export function initMenu() {
  const btn = document.getElementById('menuBtn');
  const menu = document.getElementById('menu');
  const links = menu.querySelectorAll('a');
  let open = false;
  const toggle = (force) => {
    open = force ?? !open;
    btn.setAttribute('aria-expanded', open);
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-hidden', !open);
    gsap.to(menu, { clipPath: `circle(${open ? 150 : 0}% at calc(100% - 50px) 50px)`, duration: 0.8, ease: 'power3.inOut' });
    if (open) gsap.fromTo(links, { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.06, delay: 0.25 });
  };
  btn.addEventListener('click', () => toggle());
  links.forEach((a) => a.addEventListener('click', () => toggle(false)));
  addEventListener('keydown', (e) => e.key === 'Escape' && open && toggle(false));
}
