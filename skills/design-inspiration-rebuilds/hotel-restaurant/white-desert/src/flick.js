/* Card flick: six portrait panels in a flex row. The open card has flex-grow 4, the rest 1;
   flex-grow transitions .9s cubic-bezier(.65,.05,0,1) (CSS). Closed cards are blurred 6px / scaled 1.06,
   text fades in after .4s. Hover opens on fine pointers, click/tap opens on coarse ones. */
export function initFlick() {
  const cards = [...document.querySelectorAll('#flick .card')];
  const open = (c) => cards.forEach((x) => x.classList.toggle('is-open', x === c));
  const fine = matchMedia('(hover: hover) and (min-width: 1001px)');
  cards.forEach((c) => {
    c.addEventListener('pointerenter', () => fine.matches && open(c));
    c.addEventListener('click', () => open(c));
  });
}
