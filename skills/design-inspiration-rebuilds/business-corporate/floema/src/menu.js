// Mobile menu: yellow panel wipes down via clip-path inset(0 0 100% 0) -> inset(0), .8s cubic-bezier(.65,.05,0,1) (CSS).
export function initMenu() {
  const b = document.querySelector('.burger'), m = document.querySelector('.menu');
  const set = (o) => { b.setAttribute('aria-expanded', o); m.classList.toggle('open', o); m.setAttribute('aria-hidden', !o); };
  b.addEventListener('click', () => set(b.getAttribute('aria-expanded') !== 'true'));
  m.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => set(false)));
}
