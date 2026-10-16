/* Burger toggles the dropdown (clip-path inset 0 0 100% 0 -> inset(0), .6s cubic-bezier(.65,.05,0,1)). */
export function initMenu() {
  const b = document.querySelector('.burger'), d = document.querySelector('.drop');
  const set = (o) => { b.setAttribute('aria-expanded', o); d.classList.toggle('open', o); d.setAttribute('aria-hidden', !o); };
  b.addEventListener('click', () => set(b.getAttribute('aria-expanded') !== 'true'));
  d.addEventListener('click', () => set(false));
}
