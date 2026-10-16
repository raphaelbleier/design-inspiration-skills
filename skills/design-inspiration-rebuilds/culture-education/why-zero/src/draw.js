/* "Draw a zero": the pointer path is painted into a low-res canvas (fades each frame, alpha .06)
 * which the shader reads. A zero is detected when the path since pointerdown winds >= 300 deg
 * around its centroid and ends within 22% of its bbox diagonal from its start. */
import gsap from 'gsap';

export function createDraw({ onZero }) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  let pts = [], down = false, last = null;

  const xy = (e) => [e.clientX / innerWidth * c.width, (1 - e.clientY / innerHeight) * c.height];
  function stroke(e) {
    const [x, y] = xy(e);
    if (last) { g.strokeStyle = '#fff'; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(...last); g.lineTo(x, y); g.stroke(); }
    last = [x, y];
  }
  function isZero(p) {
    if (p.length < 12) return false;
    const cx = p.reduce((s, q) => s + q[0], 0) / p.length, cy = p.reduce((s, q) => s + q[1], 0) / p.length;
    let wind = 0, a0 = Math.atan2(p[0][1] - cy, p[0][0] - cx);
    for (let i = 1; i < p.length; i++) {
      const a = Math.atan2(p[i][1] - cy, p[i][0] - cx); let d = a - a0;
      if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI;
      wind += d; a0 = a;
    }
    const xs = p.map((q) => q[0]), ys = p.map((q) => q[1]);
    const diag = Math.hypot(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
    const end = Math.hypot(p.at(-1)[0] - p[0][0], p.at(-1)[1] - p[0][1]);
    return Math.abs(wind) > (300 * Math.PI) / 180 && end < diag * 0.22 && diag > 30;
  }
  addEventListener('pointerdown', (e) => { if (e.target.closest('button,a')) return; down = true; pts = []; last = null; });
  addEventListener('pointermove', (e) => { if (!down) return; stroke(e); pts.push(xy(e)); });
  addEventListener('pointerup', (e) => {
    if (!down) return; down = false; last = null;
    if (isZero(pts)) onZero(e.clientX, e.clientY);
  });
  return { canvas: c, fade() { g.fillStyle = 'rgba(0,0,0,.06)'; g.fillRect(0, 0, c.width, c.height); } };
}
