// Small HTML-string helpers shared by the pages.
import { films, pad } from './data.js';
import { img } from './assets.js';

export const arrow = '<svg viewBox="0 0 16 16"><path d="M2 8h11M9 3.5L13.5 8 9 12.5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';
export const arrowLeft = '<svg viewBox="0 0 16 16" width="14" height="14"><path d="M14 8H3M7 3.5L2.5 8 7 12.5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
export const arrowDown = '<svg viewBox="0 0 16 16" width="14" height="14"><path d="M8 2v11M3.5 9L8 13.5 12.5 9" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';

export const btnTicket = (label, href, cls = '') => `<a class="btn-ticket ${cls}" href="${href}"><span class="bt-l">${label}</span><span class="bt-r">${arrow}</span></a>`;

/** Laurel wreath: two mirrored branches of leaf ellipses along a circle that stays open at the top.
 *  (Hand-drawn script is illegible, geometry is not: leaf i sits at angle phi, rotated to the circle tangent.) */
export function laurel(w = 64) {
  let leaves = '';
  for (const s of [-1, 1]) for (let i = 0; i < 11; i++) {
    const t = i / 10, phi = 0.12 + t * 2.2, R = 34 + (i % 2 ? 4 : -2);
    const x = 50 + s * R * Math.sin(phi), y = 52 + R * Math.cos(phi) * 0.98;
    const dx = s * Math.cos(phi), dy = -Math.sin(phi);
    const rot = (Math.atan2(-dx, dy) * 180) / Math.PI + (i % 2 ? 22 : -22) * s;
    leaves += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="3.4" ry="7.4" transform="rotate(${rot.toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
  }
  return `<svg class="laurel" viewBox="0 0 100 100" width="${w}" height="${w}" fill="currentColor" aria-hidden="true">${leaves}</svg>`;
}

export const stars = '<div class="stars" aria-label="5 stars">★★★★★</div>';

/** "ruled stack": giant display words between full-width hairlines (contact headline, footer, about hero). */
export const ruled = (words, cls = '') => `<div class="ruled ${cls}">${words.map((w) => `<div class="ruled-row"><span class="display ruled-word">${w}</span></div>`).join('')}</div>`;

export const footer = () => `
<footer class="footer" data-color="dark">
  <div class="footer-mark" aria-hidden="true"><svg viewBox="0 0 56 56" width="56" height="56"><path d="M1 1h54v54H1z" fill="none" stroke="currentColor" stroke-dasharray="3 3"/><path d="M10 52V30C10 18 20 11 28 6c8 5 18 12 18 24v22" fill="none" stroke="currentColor" stroke-dasharray="3 3"/><text x="28" y="45" text-anchor="middle" font-family="var(--font-display)" font-weight="800" font-size="13" fill="currentColor">ORIEL</text></svg></div>
  ${ruled(['PRODUCTION', 'DOCUMENTARY', 'FILM TV'], 'footer-ruled')}
  <div class="footer-cols">
    <form class="news" onsubmit="return false"><span class="eyebrow">STAY UP TO DATE</span>
      <label class="news-field"><input type="email" placeholder="ENTER YOUR EMAIL" aria-label="Email"><button type="submit" aria-label="Subscribe">${arrow}</button></label></form>
    <div class="sitemap"><span class="eyebrow">SITEMAP</span><ul class="display"><li><a href="#/">HOME</a></li><li><a href="#/work">WORK</a></li><li><a href="#/about">ABOUT</a></li><li><a href="#/contact">CONTACT</a></li></ul></div>
    <div class="fcontact"><span class="eyebrow">CONTACT US</span><p class="rowline"><i class="eyebrow">INQUIRIES</i><a class="display" href="mailto:hello@oriel.example">HELLO@ORIEL.EXAMPLE</a></p></div>
  </div>
  <div class="footer-legal"><span class="follow eyebrow">FOLLOW US — <b>f</b> <b>in</b> <b>ig</b></span><span class="eyebrow">©ORIEL. ALL RIGHTS RESERVED</span><span class="eyebrow">COOKIE · PRIVACY · TERMS</span></div>
</footer>`;

/** CTA block: rounded still with scan lines, "OUR FILMS" + EXPLORE */
export const ourFilms = () => `
<section class="cta" data-color="dark"><div class="cta-media"><img src="${img.h5}" alt="" loading="lazy"></div>
  <div class="cta-in"><h2 class="display">OUR FILMS</h2>${btnTicket('EXPLORE', '#/work', 'cream')}</div></section>`;

/** Letters spread edge to edge (the logo sub-line is as wide as the wordmark). */
export const spread = (t) => [...t].map((c) => `<i>${c === ' ' ? '&nbsp;' : c}</i>`).join('');
