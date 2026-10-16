/* Drink select: hover dims the others and lifts one (.45s cubic-bezier(.65,.05,0,1), see CSS), click fills the
 * pour panel and scrolls there. Data is fictional. */

const DRINKS = [
  { name: 'Pear & Smoked Honey', meta: 'N.01   13% vol   700 ml', img: 'img/bottle-blue.webp' },
  { name: 'Fig & Black Pepper', meta: 'N.02   14% vol   700 ml', img: 'img/bottle-green.webp' },
  { name: 'Quince & Cardamom', meta: 'N.03   12% vol   700 ml', img: 'img/bottle-yellow.webp' },
];

export function initSelect(goToPour, reduced) {
  const label = document.getElementById('selName');
  const buttons = [...document.querySelectorAll('.bottle')];
  buttons.forEach((b) => {
    const d = DRINKS[b.dataset.i];
    const show = () => { label.textContent = d.name; };
    b.addEventListener('pointerenter', show);
    b.addEventListener('focus', show);
    b.addEventListener('click', () => {
      document.getElementById('flavour').textContent = d.name;
      document.getElementById('pourMeta').textContent = d.meta;
      document.getElementById('pourBottle').src = d.img;
      if (!reduced) goToPour();
    });
  });
  document.querySelector('.bottles').addEventListener('pointerleave', () => { label.innerHTML = '&nbsp;'; });
}
