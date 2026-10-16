import gsap from 'gsap';
import { ROOMS } from './rooms.js';
import { createRoom } from './room.js';
import { createHotspots } from './hotspots.js';
import { playIntro, leaveIntro } from './intro.js';
import { say } from './subtitles.js';

const room = createRoom(document.getElementById('gl'), ROOMS);
const spots = createHotspots(room, { onSay: say });

const nav = document.getElementById('rooms');
ROOMS.forEach((r, i) => {
  const b = document.createElement('button'); b.type = 'button'; b.textContent = r.name;
  b.onclick = async () => {
    if (room.busy || i === room.current) return;
    spots.closeCard(); spots.hide(); await room.go(i); spots.show(i);
  };
  nav.append(b);
});

// Sound toggle is visual only: the original ships an ambient bed; the rebuild has no audio assets.
const snd = document.getElementById('sound');
snd.setAttribute('aria-pressed', 'true');
snd.onclick = () => snd.setAttribute('aria-pressed', snd.getAttribute('aria-pressed') !== 'true');

playIntro();
document.getElementById('enter').onclick = async () => {
  document.getElementById('ui').hidden = false;
  gsap.from('#ui', { opacity: 0, duration: .9, delay: .3 });
  spots.show(0);
  await leaveIntro();
};
