import '@fontsource-variable/anybody/wdth.css';
import '@fontsource-variable/saira/wdth.css';
import './style.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { startScroll } from './scroll.js';
import { runLoader } from './loader.js';
import { initHero } from './hero.js';
import { initExpertises } from './expertises.js';
import { initSpines } from './spines.js';
import { initCitation } from './citation.js';
import { initClients } from './clients.js';
import { initCursor } from './cursor.js';
import { initMenu } from './menu.js';
import { initFooter } from './footer.js';

gsap.registerPlugin(ScrollTrigger);
history.scrollRestoration = 'manual';
scrollTo(0, 0);

initCursor(); initMenu(); initFooter(); initSpines(); initClients();
initHero(); initExpertises(); initCitation();
// Nav goes light over the dark productions block and over the footer.
const nav = document.querySelector('.nav');
const dark = new Set();
const track = (key) => (st) => { st.isActive ? dark.add(key) : dark.delete(key); nav.classList.toggle('light', dark.size > 0); };
ScrollTrigger.create({ trigger: '.prods', start: 'top 60px', end: 'bottom 60px', onToggle: track('prods') });
ScrollTrigger.create({ trigger: '.page', start: 'bottom 60px', end: () => '+=' + innerHeight, onToggle: track('footer') });
runLoader().then(() => { startScroll(); ScrollTrigger.refresh(); });
addEventListener('load', () => ScrollTrigger.refresh());
