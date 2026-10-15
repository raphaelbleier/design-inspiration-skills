/**
 * helmets.js - builds the 16-card hall of fame (4 columns, columns 2 and 4 offset) from data,
 * then reveals each card with the image ellipse preset. Images are reused (8 files for 16 cards).
 */
import { gsap, ScrollTrigger, reduced } from './scroll.js';

const data = [
  ['Season', 2025, 1], ['Discoball', 2025, 2], ['Dark glitter', 2025, 6], ['Season', 2024, 1],
  ['Garden', 2024, 3], ['Pixel', 2024, 5], ['Race', 2023, 2], ['Las Solenza', 2023, 4],
  ['Chrome', 2023, 2], ['Beachball', 2023, 7], ['Basketball', 2022, 4], ['Season', 2021, 7],
  ['Silverstone', 2020, 3], ['Season', 2019, 7], ['Testing', 2019, 6], ['Karting', 2018, 1],
];
// card outline: rounded rect with a slanted label tab at the bottom right
const outline = `<svg class="card__bg" viewBox="0 0 340 342" preserveAspectRatio="none" aria-hidden="true"><path d="M16 .5H324Q339.5 .5 339.5 16V326Q339.5 341.5 324 341.5H208Q199 341.5 204 335L226 316Q231 310.5 238 310.5H16Q.5 310.5 .5 295V16Q.5 .5 16 .5Z" fill="none" stroke="currentColor" vector-effect="non-scaling-stroke"/></svg>`;

export function initHelmets() {
  const grid = document.querySelector('[data-helmets]');
  const cols = [0, 1, 2, 3].map(() => { const c = document.createElement('div'); c.className = 'helmets__col'; grid.append(c); return c; });
  data.forEach(([name, year, img], i) => {
    cols[i % 4].insertAdjacentHTML('beforeend', `
      <a class="card" href="on-track.html" data-transition>${outline}
        <span class="card__img"><img src="./img/h${img}.webp" alt="${name} ${year} helmet" loading="lazy"></span>
        <span class="card__label">${name} <b>${year}</b></span>
      </a>`);
  });
  if (reduced) return;
  grid.querySelectorAll('.card__img').forEach((el) => {
    const img = el.querySelector('img');
    gsap.set(img, { scale: 0.7, opacity: 0 });
    ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true,
      onEnter: () => gsap.to(img, { scale: 1, opacity: 1, duration: 0.9, ease: 'power3.out' }) });
  });
}
