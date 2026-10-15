import '@fontsource-variable/bricolage-grotesque/wdth.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/cormorant-garamond/600.css';
import './styles/base.css';
import './styles/chrome.css';
import './styles/home.css';
import './styles/work.css';
import './styles/case.css';
import './styles/about.css';
import './styles/contact.css';
import './styles/boot.css';

import gsap from 'gsap';
import { GL } from './gl.js';
import { Router } from './router.js';
import { preloader } from './preloader.js';
import { spread } from './parts.js';
import './cursor.js';
import './ticket.js';

document.querySelectorAll('.logo-sub').forEach((el) => { el.setAttribute('aria-hidden', 'true'); el.innerHTML = spread(el.textContent); });
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
GL.init(document.querySelector('[data-gl="c"]'));
document.documentElement.classList.toggle('gl-on', GL.ok);

// --100vh from innerHeight (mobile browser chrome safe), like the original
const setVh = () => document.documentElement.style.setProperty('--100vh', innerHeight + 'px');
setVh(); addEventListener('resize', setVh);

const render = (time) => GL.render(time);
preloader(reduced).then(() => Router.start(render));
