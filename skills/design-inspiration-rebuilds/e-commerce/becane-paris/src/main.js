import './style.css';
import { initScroll, onFrame } from './scroll.js';
import { createRow } from './row.js';
import { initReveals } from './reveals.js';
import { products } from './data.js';

initScroll();
const name = document.querySelector('.pick-name');
const no = document.querySelector('.pick-no');
const thumb = document.querySelector('.pick-thumb');
const row = createRow(document.getElementById('gl'), (i) => {
  const p = products[i];
  name.textContent = p ? p.name : 'Collection';
  no.textContent = p ? `${String(i + 1).padStart(2, '0')} / ${products.length}` : '01 / 01';
  thumb.hidden = !p;
  if (p) thumb.src = p.a;
});
thumb.addEventListener('error', () => { thumb.hidden = true; });
onFrame(row.frame);
initReveals();
