// Hotspots: DOM buttons re-projected each frame from image-uv via room.toScreen (so they ride the parallax),
// pop in with back.out(2) .6s stagger .1. Bag spots open a side card (.8s cubic-bezier(.23,1,.32,1) in CSS).
import gsap from 'gsap';
import { ROOMS, BAGS } from './rooms.js';

const BAG_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M5 9h14l1 11H4z"/><path d="M9 9V7a3 3 0 0 1 6 0v2"/></svg>';
const DOOR_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="6" y="3" width="12" height="18"/><circle cx="15" cy="12" r=".8" fill="currentColor"/></svg>';

export function createHotspots(room, { onSay }) {
  const host = document.getElementById('hotspots');
  const card = document.getElementById('card');
  const hint = document.getElementById('hint');
  let live = [], roomIdx = 0;

  const closeCard = () => { card.classList.remove('open'); card.setAttribute('aria-hidden', 'true'); };
  document.getElementById('card-x').onclick = closeCard;
  addEventListener('keydown', (e) => e.key === 'Escape' && closeCard());

  function openBag(i) {
    const b = BAGS[i];
    card.querySelector('.card__img').style.backgroundImage = `url(${b.img})`;
    card.querySelector('.card__name').textContent = b.name;
    card.querySelector('.card__note').textContent = b.note;
    card.classList.add('open'); card.setAttribute('aria-hidden', 'false');
  }

  function show(i) {
    roomIdx = i; host.innerHTML = ''; live = [];
    ROOMS[i].spots.forEach((s) => {
      const b = document.createElement('button');
      b.className = 'hs ' + s.type; b.innerHTML = s.type === 'bag' ? BAG_ICON : DOOR_ICON;
      b.setAttribute('aria-label', s.type === 'bag' ? BAGS[s.bag].name : s.label);
      b.onclick = async () => {
        if (s.type === 'bag') return openBag(s.bag);
        closeCard(); hide();
        await room.go(s.to, { x: s.x, y: s.y }); show(s.to);
      };
      host.append(b); live.push({ b, s });
    });
    gsap.from(host.children, { scale: 0, duration: .6, ease: 'back.out(2)', stagger: .1, delay: .2 });
    document.getElementById('hint-text').textContent = ROOMS[i].hint;
    hint.classList.add('on'); setTimeout(() => hint.classList.remove('on'), 5000);
    onSay(ROOMS[i].line);
    document.querySelectorAll('#rooms button').forEach((b, k) => b.setAttribute('aria-current', k === i));
  }
  const hide = () => { host.innerHTML = ''; live = []; hint.classList.remove('on'); };

  gsap.ticker.add(() => live.forEach(({ b, s }) => {
    const p = room.toScreen(s.x, s.y);
    b.style.left = p.x + 'px'; b.style.top = p.y + 'px';
  }));

  return { show, hide, closeCard, get index() { return roomIdx; } };
}
