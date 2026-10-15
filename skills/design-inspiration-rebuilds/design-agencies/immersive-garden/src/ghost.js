/* GHOST CURSOR
   The studied site keeps its plaster alive when nobody touches it: a second, autonomous
   "cursor" (mouse2) draws 1-3 rough wiggles (GSAP RoughEase, 0.7-1.0 s each) every 1-3 s.
   Here it is a tiny state machine that returns a normalised position each frame; relief.js
   stamps it into the flowmap exactly like the real pointer.

   Values: wait 1-3 s | 1-3 wiggles | 0.7-1.0 s per wiggle | stroke length 0.15-0.35 of the
   viewport width | wiggle = RoughEase(points 14, strength 1, randomize) applied perpendicular
   to the straight path, amplitude 0.05. */
import { gsap } from 'gsap';
import { RoughEase } from 'gsap/EasePack';
gsap.registerPlugin(RoughEase);

export function createGhost() {
  const g = { x: 0.5, y: 0.5, active: false, speed: 0 };
  let wait = 1.2, wiggles = 0, t = 0, dur = 0.8, ax = 0, ay = 0, bx = 0, by = 0, rough = null, lx = 0.5, ly = 0.5;

  function nextStroke(aspect) {
    ax = bx || 0.3 + Math.random() * 0.4; ay = by || 0.3 + Math.random() * 0.4;
    const ang = Math.random() * Math.PI * 2, len = 0.15 + Math.random() * 0.2;
    bx = Math.min(0.9, Math.max(0.1, ax + Math.cos(ang) * len));
    by = Math.min(0.85, Math.max(0.15, ay + (Math.sin(ang) * len) * aspect));
    dur = 0.7 + Math.random() * 0.3; t = 0;
    rough = RoughEase.ease.config({ strength: 1, points: 14, randomize: true, clamp: false, taper: 'none' });
  }

  /** dt in seconds; aspect = width/height (keeps strokes roughly isotropic) */
  g.update = (dt, aspect = 1.6) => {
    if (!wiggles) {
      g.active = false; g.speed = 0;
      wait -= dt;
      if (wait <= 0) { wiggles = 1 + Math.floor(Math.random() * 3); bx = 0; by = 0; nextStroke(aspect); lx = ax; ly = ay; }
      return g;
    }
    t += dt / dur;
    const k = Math.min(t, 1);
    const eased = k * k * (3 - 2 * k);                 // smooth travel along the stroke
    const wob = (rough(k) - k) * 0.05;                  // perpendicular wiggle
    const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1;
    g.x = ax + dx * eased + (-dy / L) * wob;
    g.y = ay + dy * eased + (dx / L) * wob;
    g.active = true;
    g.speed = Math.hypot(g.x - lx, (g.y - ly) / aspect) ; lx = g.x; ly = g.y;
    if (t >= 1) { wiggles--; if (wiggles) nextStroke(aspect); else wait = 1 + Math.random() * 2; }
    return g;
  };
  return g;
}
