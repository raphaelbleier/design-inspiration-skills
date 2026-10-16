// Technique: variants carousel, a flat row of colour-framed cards translated horizontally on scroll
// (scrub .8, total shift = row width - viewport). Cards are duplicated so the row is wider than the screen.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const V = [['Petit Marais Text','#18bb45','#3b5bff','card-text'],['Petit Marais Mono','#3b5bff','#d9d9d9','card-mono'],['Petit Marais Squeezed','#d92d2d','#fff','card-squeezed'],['Petit Marais Display','#ff6eb4','#1a1a1a','card-display'],['Petit Marais Italic','#ebe23e','#3b5bff','card-italic']];
export function initVariants() {
  const row = document.querySelector('.vrow');
  row.innerHTML = [...V, ...V].map(([n, c, b, img]) => `<div class="vc" style="--c:${c};--b:${b}"><p>${n}</p><div class="im"><img src="${import.meta.env.BASE_URL}img/${img}.webp" alt="" loading="lazy"></div></div>`).join('');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { row.style.overflowX = 'auto'; return; }
  gsap.fromTo(row, { x: 0 }, { x: () => -(row.scrollWidth - innerWidth), ease: 'none',
    scrollTrigger: { trigger: '.variants', start: 'top bottom', end: 'bottom top', scrub: 0.8, invalidateOnRefresh: true } });
}
