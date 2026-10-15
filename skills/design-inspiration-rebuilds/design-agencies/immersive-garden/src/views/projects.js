/* /projects: alphabetical list. Row hover dims the other rows' type labels to .1 and draws the name underline (scaleX, transform-origin right -> left); a fixed 22.8vw preview slides in at the left. */
import { projects } from '../data.js';

export function renderProjects() {
  return `
  <section class="plist">
    <ul class="plist__rows">
      ${[...projects].sort((a, b) => a.title.localeCompare(b.title)).map((p) => `
      <li class="plist__row" data-img="${p.img[0]}" data-tags="${p.tags}">
        <a href="#/projects/${p.slug}"><span class="plist__type">${p.type}</span><span class="plist__name">${p.title}</span></a>
      </li>`).join('')}
    </ul>
    <div class="plist__preview"><img alt="" src="./img/${projects[0].img[0]}.webp"><p></p></div>
  </section>`;
}

export function mountProjects(root) {
  const list = root.querySelector('.plist'), prev = root.querySelector('.plist__preview'), img = prev.querySelector('img'), cap = prev.querySelector('p');
  root.querySelectorAll('.plist__row').forEach((row) => {
    row.addEventListener('pointerenter', () => { img.src = `./img/${row.dataset.img}.webp`; cap.textContent = row.dataset.tags; list.classList.add('has-hover'); });
  });
  root.querySelector('.plist__rows').addEventListener('pointerleave', () => list.classList.remove('has-hover'));
}
