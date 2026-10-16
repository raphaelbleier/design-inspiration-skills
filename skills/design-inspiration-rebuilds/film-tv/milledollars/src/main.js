/* App shell: hash router, per-route background colour, hero copy, works hover preview, project page,
   word-rise reveals. Background tween .6s; copy reveals 1s cubic-bezier(.38,.005,.215,1) (the original's single curve). */
import '@fontsource-variable/hanken-grotesk';
import '@fontsource-variable/fraunces';
import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CustomEase from 'gsap/CustomEase';
import { projects, slides } from './data.js';
import { initScroll, lenis, reduced } from './scroll.js';
import { initSlider } from './slider.js';
import { initWorks } from './works.js';
import { initProject } from './project.js';

gsap.registerPlugin(ScrollTrigger, CustomEase);
CustomEase.create('mille', '.38,.005,.215,1');

const view = document.getElementById('view');
const BG = { home: '#161414', works: '#e0dee1', info: '#d5bcdc', contact: '#ffeebf', project: '#e0dee1' };
const esc = (s) => s.replace(/&/g, '&amp;');
const words = (t) => t.split(' ').map((w) => `<span class="w"><span>${esc(w)}</span></span>`).join(' ');

/* ---------- pages ---------- */
const pages = {
  home: () => `
    <section class="hero" id="hero">
      <span class="h-n"></span><span class="h-year"></span>
      <p class="h-client"></p><h2 class="h-title"></h2>
      <a class="discover" id="discover" href="#/works/${slides[0].slug}"><i></i>Discover</a>
    </section>`,
  works: () => `
    <section class="works"><ul class="list">${projects.map((p) => `
      <li><a class="it" href="#/works/${p.slug}" data-i="${p.i}">
        <span class="y">${p.year}</span><span class="t">${p.title}</span><span class="c">${p.client}</span>
      </a></li>`).join('')}</ul></section>`,
  info: () => `
    <section class="split info">
      <div class="col txt">
        <h1 class="big rv">${words('We capture the essence of your brand through the industry’s most exciting publishers.')}</h1>
        <div class="two">
          <div><h3>Crafting stories that move audiences</h3>
            <p>As a full-service production bureau, we specialise in creating powerful visual content that resonates. From commercials to branded films, we bring your story to life with creativity, precision and a deep understanding of your brand’s unique voice.</p>
            <h3>Bringing your vision to screen</h3>
            <p>We turn ideas into compelling visuals that connect with your audience. With a seamless process from concept to delivery, our bureau combines innovation and storytelling to produce content that leaves a lasting impact.</p></div>
          <div><h3>Services</h3><ul class="svc"><li>Production</li><li>Storyboard</li><li>Sound Design</li><li>Shooting</li><li>Colour</li></ul></div>
        </div>
        ${contactRow()}
      </div>
      <figure class="ph portrait"><img src="./img/info.webp" alt="" loading="eager"></figure>
    </section>`,
  contact: () => `
    <section class="split contact">
      <figure class="ph portrait left"><img src="./img/contact.webp" alt=""></figure>
      <div class="col txt">
        <h1 class="big rv">${words('Don’t be shy, write us !')}</h1>
        <h3 class="chat">Wanna chat?</h3>
        <p class="lead">Being natural communicators, there is nothing we like more than talking with other people. If you have a project idea, some work you would like to share, or just feel lonely, do get in touch.</p>
        ${contactRow()}
      </div>
    </section>`,
  project: (p) => {
    const n = projects[(p.i + 1) % projects.length], o = projects[(p.i + 5) % projects.length];
    return `
    <section class="p-hero"><img src="${p.img}" alt="">
      <div class="p-head"><span>${p.title}</span><span>${p.client}</span><span>${p.year}</span></div>
      <div class="p-meta"><div><h4>Client :</h4><p>${p.client}</p></div><div><h4>Role :</h4><p>${p.role}</p></div></div>
    </section>
    <section class="sb"><div class="sb-row">${[1, 2, 3].map((k) => `<figure class="sheet"><img src="./img/storyboard-${k}.webp" alt=""></figure>`).join('')}</div></section>
    <section class="p-body">
      <p class="lead2 rv">${words(`A single idea carried the whole film for ${p.client}: keep the camera close, let the light do the talking, and cut on breath. We built it frame by frame on paper before a single day on set.`)}</p>
      <figure class="ph wide"><img src="${o.img}" alt=""></figure>
    </section>
    <a class="next" href="#/works/${n.slug}"><span>Next project</span><strong>${n.title}</strong><em>${n.client}</em></a>`;
  },
};
function contactRow() {
  return `<div class="row3"><div><h3>Socials.</h3><a href="#/contact">Behance</a><a href="#/contact">Instagram</a><a href="#/contact">LinkedIn</a></div>
    <div><h3>Contact.</h3><a href="#/contact">hello@petitpixels.example</a></div>
    <div><h3>Location.</h3><span>Lyon, France</span></div></div>`;
}

/* ---------- hero copy: words rise out / in ---------- */
function setHero(i, dir = 1, first = false) {
  const s = slides[i], el = (c) => document.querySelector(c);
  if (!el('.h-title')) return;
  el('#discover').href = `#/works/${s.slug}`;
  [['.h-n', s.n], ['.h-client', s.client.toUpperCase()], ['.h-title', s.title.toUpperCase()], ['.h-year', String(s.year)]].forEach(([c, t], k) => {
    const node = el(c), old = node.firstElementChild;
    const fresh = document.createElement('span'); fresh.className = 'ln'; fresh.textContent = t;
    node.append(fresh);
    if (first || reduced) { old?.remove(); return; }
    gsap.fromTo(fresh, { yPercent: 110 * dir }, { yPercent: 0, duration: 1, ease: 'mille', delay: 0.15 + k * 0.05 });
    if (old) gsap.to(old, { yPercent: -110 * dir, duration: 1, ease: 'mille', delay: k * 0.05, onComplete: () => old.remove() });
  });
}

/* ---------- reveals ---------- */
function reveals() {
  if (document.querySelector('.rv')) gsap.set('.rv .w > span', { yPercent: 120 });
  document.querySelectorAll('.rv').forEach((el) => ScrollTrigger.create({
    trigger: el, start: 'top 90%', once: true,
    onEnter: () => gsap.to(el.querySelectorAll('.w > span'), { yPercent: 0, duration: reduced ? 0 : 1, ease: 'mille', stagger: 0.05 }),
  }));
  gsap.fromTo('.ph, .col.txt > :not(.big), .list li, .p-meta > div, .sheet, .next',
    { opacity: 0, y: reduced ? 0 : 28 },
    { opacity: 1, y: 0, duration: reduced ? 0 : 0.9, ease: 'mille', stagger: 0.05, delay: 0.1 });
}

/* ---------- router ---------- */
let slider, route = null, cleanup = null;
const parse = () => {
  const [, a = '', b] = location.hash.split('/');
  if (a === 'works' && b) { const p = projects.find((x) => x.slug === b); if (p) return { name: 'project', p }; }
  return { name: ['works', 'info', 'contact'].includes(a) ? a : 'home' };
};

async function render(first = false) {
  const r = parse(); const key = r.name + (r.p?.slug || '');
  if (key === route) return; route = key;
  cleanup?.(); cleanup = null; ScrollTrigger.getAll().forEach((t) => t.kill());
  const isHome = r.name === 'home';
  document.body.dataset.route = r.name;
  document.querySelectorAll('#nav a').forEach((a) => a.classList.toggle('on', a.dataset.r === (r.name === 'project' ? 'works' : r.name)));
  if (!first) await gsap.to(view, { opacity: 0, duration: reduced ? 0 : 0.35, ease: 'power1.out' });
  gsap.to('body', { backgroundColor: BG[r.name], duration: reduced ? 0 : 0.6, ease: 'power2.out' });
  view.innerHTML = pages[r.name](r.p);
  window.scrollTo(0, 0); lenis?.scrollTo(0, { immediate: true });
  slider.setActive(isHome); document.getElementById('stage').classList.toggle('off', !isHome);
  document.getElementById('top').classList.toggle('dark', r.name === 'home' || r.name === 'project');
  gsap.set(view, { opacity: 1 });
  if (isHome) setHero(slider.index, 1, true);
  else {
    reveals();
    if (r.name === 'works') cleanup = initWorks();
    if (r.name === 'project') cleanup = initProject();
  }
  ScrollTrigger.refresh();
}

/* ---------- boot ---------- */
initScroll();
slider = initSlider({ onChange: (i, d) => setHero(i, d) });
addEventListener('hashchange', () => render());

const pre = document.getElementById('pre'), n = document.getElementById('pre-n');
const counter = { v: 0 };
gsap.to(counter, { v: 100, duration: reduced ? 0 : 1.4, ease: 'power2.inOut', onUpdate: () => (n.textContent = Math.round(counter.v)) });
Promise.all([slider.loaded, new Promise((r) => gsap.delayedCall(reduced ? 0 : 1.5, r)), document.fonts.ready]).then(async () => {
  await render(true);
  gsap.to(pre, { yPercent: -100, duration: reduced ? 0 : 1, ease: 'mille', onComplete: () => pre.remove() });
});
