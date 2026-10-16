/*
 * BOOT ORDER matters for ScrollTrigger: pinned scenes are created first (so every trigger
 * created after them measures the pin spacing), then the rest in document order, then one
 * refresh once fonts and images have settled.
 */
import './styles/main.css';
import { gsap, ScrollTrigger, reduced } from './core/gsap.js';
import { initLenis, initInnerScrollers } from './core/lenis.js';
import { bindTheme, refreshThemes } from './core/theme.js';
import { $ } from './core/dom.js';
import { buildGrid } from './effects/transition-grid.js';
import { runPreloader } from './effects/preloader.js';
import { initHeader } from './effects/header.js';
import { initMenu } from './effects/menu.js';
import { initAnchors } from './effects/anchors.js';
import { initNavHover } from './effects/nav-hover.js';
import { initMagnetic } from './effects/magnetic.js';
import { initTip } from './effects/floating-tip.js';
import { initReveals } from './effects/reveal.js';
import { initHighlight } from './effects/prologue-highlight.js';
import { initParallax } from './effects/parallax.js';
import { loadSources } from './effects/sources.js';
import { startHalftoneLoop } from './effects/halftone.js';
import { initWordmark } from './effects/wordmark.js';
import { initHero } from './effects/hero.js';
import { initBenefits } from './effects/benefits.js';
import { initScenes } from './effects/scenes.js';
import { initSeasons } from './effects/season-knob.js';
import { initMarquee } from './effects/marquee.js';
import { initMapPins } from './effects/map-pins.js';
import { initApartmentTabs } from './effects/tabs-apartments.js';
import { initCounters } from './effects/count.js';
import { initClipSlider } from './effects/clip-slider.js';
import { initDragList } from './effects/drag-list.js';
import { initEdgeBars } from './effects/edge-bars.js';
import { initAccordion } from './effects/accordion.js';
import { initFooterReveal } from './effects/footer-reveal.js';
import { initModal } from './effects/cta-modal.js';
import { initSound } from './effects/sound.js';
import { initCookie } from './effects/cookie.js';

history.scrollRestoration = 'manual';
if (reduced) document.documentElement.classList.add('reduced');

buildGrid();
initLenis();
initInnerScrollers();
bindTheme($('#header'));
bindTheme($('#sound'));

let menu;
async function boot() {
  const images = await loadSources();
  startHalftoneLoop();
  await Promise.all([document.fonts.ready, initWordmark()]);

  // pinned scenes first
  initHero(images);
  initBenefits(images);
  // everything else, document order
  initParallax();
  initHighlight();
  initMarquee();
  initMapPins();
  initApartmentTabs();
  initCounters();
  initScenes(images);
  initSeasons(images);
  initClipSlider();
  initDragList();
  initEdgeBars();
  initAccordion();
  initFooterReveal();
  initModal();
  initSound();
  initCookie();
  initHeader();
  initNavHover();
  initMagnetic();
  initTip();
  menu = initMenu();
  initAnchors(menu);

  ScrollTrigger.refresh();
  refreshThemes();
  addEventListener('load', () => { ScrollTrigger.refresh(); refreshThemes(); });
}

const ready = boot().catch((e) => console.error('boot failed', e));
runPreloader(ready, () => initReveals());
