/**
 * chrome.js - the persistent UI shell (header + full-screen menu) injected into every page,
 * so both HTML files stay free of duplicated markup.
 */
const bag = `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 7h10l1 10H4L5 7Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M7.5 7V5.5a2.5 2.5 0 0 1 5 0V7" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`;

/** Fictional "27" mark: two slanted strokes. */
export const mark = `<svg viewBox="0 0 48 40" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="miter" transform="skewX(-10) translate(4 0)"><path d="M4 6h15v14H4v14h17"/><path d="M27 6h17l-12 28"/></g></svg>`;

const laurel = `<svg viewBox="0 0 60 36" aria-hidden="true" class="laurel"><g fill="none" stroke="currentColor" stroke-width="1.4"><path d="M10 30C3 24 2 12 8 3M10 30c-2-6-1-12 3-18M8 18c-3 0-5-2-6-4M9 11c-3 0-4-2-5-4"/><path d="M50 30c7-6 8-18 2-27M50 30c2-6 1-12-3-18M52 18c3 0 5-2 6-4M51 11c3 0 4-2 5-4"/><ellipse cx="30" cy="17" rx="11" ry="12"/><path d="M19 17h22M21 11h18M21 23h18M30 5v24"/></g></svg>`;

export const icons = { bag, mark, laurel };

const navLinks = [
  ['Home', 'index.html'],
  ['On Track', 'on-track.html'],
  ['Off Track', 'index.html#gallery'],
  ['Calendar', 'index.html#calendar'],
];

export function mountChrome({ page = 'home' } = {}) {
  const here = page === 'home' ? 'Home' : 'On Track';
  document.body.insertAdjacentHTML('afterbegin', `
  <header class="header" data-ink="light">
    <a class="logo" href="index.html" data-transition aria-label="Remy Vasseur - home">
      <span class="logo__a">Remy</span><span class="logo__b">Vasseur</span>
    </a>
    <a class="header__mark" href="index.html" data-transition aria-label="Home">${mark}</a>
    <span class="header__tag">Halcyon Racing since 2021</span>
    <div class="header__right">
      <a class="btn btn--lime btn--store" href="#store">${bag}<span>Store</span></a>
      <button class="btn-menu" type="button" aria-label="Menu" aria-expanded="false" data-menu-toggle><i></i><i></i></button>
    </div>
  </header>

  <div class="menu" data-menu aria-hidden="true">
    <div class="menu__imgs">
      <figure class="menu__img duo"><img src="./img/g-walk.webp" alt=""></figure>
      <figure class="menu__img"><img src="./img/g-main.webp" alt=""></figure>
      <figure class="menu__img duo"><img src="./img/g-prize.webp" alt=""></figure>
      <figure class="menu__img duo"><img src="./img/g-golf.webp" alt=""></figure>
    </div>
    <nav class="menu__nav">
      <ul>${navLinks.map(([t, h]) => `<li><a href="${h}" ${h.startsWith('on-track') || h === 'index.html' ? 'data-transition' : ''} class="menu__link${t === here ? ' is-current' : ''}"><span>${t}</span>${t === here ? '<svg class="menu__squig" viewBox="0 0 200 20" preserveAspectRatio="none"><path d="M0 11c12-14 24-14 36 0s24 14 36 0 24-14 36 0 24 14 36 0 24-14 36 0 12 6 20 0" fill="none" stroke="#d2ff00" stroke-width="3.2" vector-effect="non-scaling-stroke"/></svg>' : ''}</a></li>`).join('')}</ul>
      <div class="menu__badge">${laurel}<small>Halcyon Racing<br>since 2021</small></div>
    </nav>
    <div class="menu__foot">
      <a class="menu__biz" href="#">Business enquiries</a>
      <button class="btn-smooth" data-smooth-toggle type="button" aria-pressed="true" title="Toggle smooth scrolling"><span></span>Smooth scroll</button>
      <div class="menu__social"><a href="#">TikTok</a><a href="#">Instagram</a><a href="#">YouTube</a><a href="#">Twitch</a></div>
    </div>
  </div>

  <div class="wipe" data-wipe aria-hidden="true"><span class="wipe__mark">${mark}</span></div>
  `);
}
