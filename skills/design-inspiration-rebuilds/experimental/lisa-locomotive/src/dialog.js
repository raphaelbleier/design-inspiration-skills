/* Chat engine. Messages type in with the scramble effect; the previous message shrinks to
   scale .7, blur 4px, opacity .5 (CSS .is-past, .8s cubic-bezier(.65,.05,0,1)) and the one before
   that disappears. Controls (chips / name input / gallery) pop in after the last message:
   y 14 -> 0, scale .9 -> 1, `back.out(1.6)` .5s, stagger .08. History stack powers the round back button. */
import gsap from 'gsap';
import { flow, EMAIL } from './flow.js';
import { scrambleIn } from './scramble.js';
import { blip } from './sound.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function createDialog({ dialog, controls, back, progress, onTalk, onStep }) {
  const history = [];
  let name = 'friend';
  let run = 0;                  // token: a newer step cancels any older, still-typing one
  let typing = null;

  const pop = (nodes) => !reduced && gsap.from(nodes, { y: 14, scale: 0.9, opacity: 0, duration: 0.5, ease: 'back.out(1.6)', stagger: 0.08 });

  function render(node) {
    controls.innerHTML = '';
    const items = [];
    if (node.ask) {
      const f = document.createElement('form');
      f.className = 'ask';
      f.innerHTML = '<input name="n" maxlength="24" autocomplete="off" placeholder="Your name" aria-label="Your name" /><button aria-label="Send">→</button>';
      f.onsubmit = (e) => { e.preventDefault(); const v = f.n.value.trim(); if (!v) return f.n.focus(); name = v; go(node.ask); };
      controls.append(f); items.push(f); setTimeout(() => f.n.focus({ preventScroll: true }), 50);
    }
    if (node.gallery) {
      const g = document.createElement('div');
      g.className = 'gallery';
      for (let i = 1; i <= node.gallery; i++) g.insertAdjacentHTML('beforeend', `<div><img src="./img/culture-${i}.webp" alt="" loading="lazy" onerror="this.remove()"></div>`);
      controls.append(g); items.push(...g.children);
    }
    (node.chips || []).forEach(([label, to]) => {
      const b = document.createElement('button');
      b.className = 'chip'; b.textContent = label; b.onclick = () => go(to);
      controls.append(b); items.push(b);
    });
    if (node.mail) {
      const m = document.createElement('span');
      m.className = 'mail';
      m.innerHTML = `Write us: <u>${EMAIL}</u><button aria-label="Copy e-mail"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg></button>`;
      m.querySelector('button').onclick = () => navigator.clipboard?.writeText(EMAIL);
      controls.append(m); items.push(m);
    }
    pop(items);
  }

  function typeMessages(node, token) {
    const msgs = node.say.map((s) => s.replace('{name}', esc(name)));
    controls.innerHTML = '';
    const next = (i) => {
      if (token !== run) return;
      if (i === msgs.length) return node.next ? setTimeout(() => token === run && go(node.next), 700) : render(node);
      const prev = dialog.lastElementChild;
      if (prev) {
        dialog.querySelectorAll('.msg.is-past').forEach((m) => m.classList.add('is-gone'));
        prev.classList.add('is-past'); prev.querySelector('.cursor')?.remove();
      }
      const el = document.createElement('div');
      el.className = 'msg'; dialog.append(el);
      typing = scrambleIn(el, msgs[i], { reduced, onTick: (d) => d % 2 === 0 && blip(), onDone: () => setTimeout(() => next(i + 1), 350) });
    };
    next(0);
  }

  function go(id) {
    const node = flow[id];
    run++; typing?.kill();
    if (!node.next && history.at(-1) !== id) history.push(id);   // intro auto-advances, never a back target
    back.hidden = history.length < 2;
    progress.style.setProperty('--progress', node.progress);
    onStep?.(id);
    typeMessages(node, run);
  }

  back.onclick = () => { if (history.length > 1) { history.pop(); const id = history.pop(); go(id); } };
  document.querySelectorAll('[data-go]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); history.length = 0; dialog.innerHTML = ''; go(a.dataset.go); }));
  return { start: () => go('intro'), isTyping: () => !!typing };
}
