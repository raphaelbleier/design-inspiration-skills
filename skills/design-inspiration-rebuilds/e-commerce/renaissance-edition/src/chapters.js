// Technique: build chapters from content.js, drive the panel chapter list with ScrollTrigger.
// Active chapter: top 50% of viewport inside the section; dotted leader grows on the active link.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { chapters } from './content.js';
const roman = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
export function initChapters(lenis) {
  document.getElementById('chapters').innerHTML = chapters.map((c, i) => `
  <section class="chap" id="${c.id}">
    <div class="chap__head"><h2 class="chap__name">${c.name}<small>${roman[i]}</small></h2><p class="chap__lead">${c.lead}</p></div>
    ${c.img ? `<div class="chap__img"><img src="./img/${c.img}.webp" alt="" loading="lazy"></div>` : ''}
    <div class="rows">${c.f.map(([t, d]) => `<div class="row"><b>${t}</b><p>${d}</p></div>`).join('')}</div>
  </section>`).join('') + `<footer class="foot">The next edition arrives<br>when it is ready.</footer>`;
  const toc = document.getElementById('toc');
  toc.innerHTML = chapters.map((c, i) => `<a href="#${c.id}" data-id="${c.id}">${c.name}<i>${roman[i]}</i></a>`).join('');
  toc.addEventListener('click', (e) => { const a = e.target.closest('a'); if (!a) return; e.preventDefault();
    lenis ? lenis.scrollTo('#' + a.dataset.id, { duration: 1.4 }) : document.getElementById(a.dataset.id).scrollIntoView(); });
  chapters.forEach((c) => ScrollTrigger.create({ trigger: '#' + c.id, start: 'top 50%', end: 'bottom 50%',
    toggleClass: { targets: toc.querySelector(`[data-id=${c.id}]`), className: 'on' } }));
  // Row reveal: opacity + 14px rise, grey description darkens as it settles.
  document.querySelectorAll('.row').forEach((r) => {
    gsap.fromTo(r, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .9, ease: 'power3.out',
      scrollTrigger: { trigger: r, start: 'top 90%', once: true, onEnter: () => r.classList.add('in') } });
  });
  // Image parallax: inner img scale 1.12 -> 1 scrubbed while the frame crosses the viewport.
  document.querySelectorAll('.chap__img').forEach((f) => {
    gsap.to(f.querySelector('img'), { scale: 1, ease: 'none', scrollTrigger: { trigger: f, start: 'top bottom', end: 'bottom 30%', scrub: true } });
  });
}
