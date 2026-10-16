import gsap from 'gsap';
import { initBg } from './bg.js';
import { go, initRouter } from './router.js';
import { initHome } from './home.js';
import { initChapters } from './chapters.js';
import { initAbout } from './about.js';
import { initStars } from './stars.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
gsap.ticker.lagSmoothing(0);
initBg(document.getElementById('bg'), reduced);
initStars(document.getElementById('stars'), reduced);
initHome(); initChapters(); initAbout();
initRouter();

// in-app links go through the curtain, not the browser's instant hash jump
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[data-nav]');
  if (!a) return;
  e.preventDefault();
  history.pushState(null, '', '#' + a.dataset.nav);
  go(a.dataset.nav);
});
