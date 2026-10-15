/*
 * TICKET NAV STATE
 * ----------------
 * The ticket always shows the "current film" (thumbnail, title, DOCUMENTARY | 2024 | MIN.88). The router sets
 * body[data-page]; CSS swaps the left cell for about ("ORIEL | ADMIT ONE | 004") and contact ("LET'S TALK").
 * The film list panel (chevron) is only meaningful on home/work, where picking an entry jumps the slider.
 */
import gsap from 'gsap';
import { films, pad } from './data.js';
import { img } from './assets.js';

const $ = (s) => document.querySelector(s);
const title = $('.t-title'), thumb = $('.t-thumb'), meta = [...document.querySelectorAll('.t-meta i')];
let handler = null;

export const Ticket = {
  mode(page) {
    document.body.dataset.page = page;
    if (['about', 'contact', 'policy', '404'].includes(page)) {
      meta[0].textContent = 'ORIEL'; meta[1].textContent = 'ADMIT ONE'; meta[2].textContent = '004';
    }
    $('#list-toggle').checked = false; $('#menu-toggle').checked = false;
  },
  film(i, instant) {
    const f = films[i];
    const apply = () => {
      title.textContent = f.title; thumb.src = img[f.w]; meta[0].textContent = f.kind; meta[1].textContent = f.year; meta[2].textContent = `MIN.${f.min}`;
    };
    document.querySelectorAll('.film-item').forEach((el, n) => el.setAttribute('aria-current', n === i ? 'true' : 'false'));
    if (instant) apply(); else gsap.timeline().to(title, { yPercent: -30, autoAlpha: 0, duration: 0.2, ease: 'power2.in' }).add(apply).fromTo(title, { yPercent: 30, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.6, ease: 'expo.out' });
  },
  /** Fill the film list and call pick(i) on click (home/work register their own handler). */
  list(pick) {
    handler = pick;
    $('#film-list').innerHTML = films.map((f, i) => `<a class="film-item" href="#/" data-i="${i}" data-hover="bggrow"><img src="${img[f.w]}" alt=""><span>${f.title}</span></a>`).join('');
  },
};
$('#film-list').addEventListener('click', (e) => {
  const a = e.target.closest('.film-item'); if (!a) return;
  e.preventDefault(); $('#list-toggle').checked = false;
  handler && handler(+a.dataset.i);
});
// the left cell only opens the list on home/work
$('.t-left').addEventListener('click', (e) => { if (!['home', 'work'].includes(document.body.dataset.page)) e.preventDefault(); });
