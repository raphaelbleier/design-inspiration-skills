/* Dark section starfield (2D canvas): 140 pin stars twinkling + 16 soft teal glow dots, all drifting upward.
 * Pin star: 1-2px, alpha = .35 + .65 * sin(t * speed + phase)^2. Glow: radial gradient radius 6-9px, alpha .55. */
export function initStars(canvas, reduced) {
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, dpr = 1;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const stars = Array.from({ length: 156 }, (_, i) => ({ x: Math.random(), y: Math.random(), r: i < 140 ? rnd(0.6, 1.5) : rnd(6, 9), glow: i >= 140, s: rnd(0.4, 1.4), ph: rnd(0, 6.28), v: rnd(0.004, 0.012) }));
  function resize() {
    dpr = Math.min(devicePixelRatio, 2); w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  new ResizeObserver(resize).observe(canvas); resize();
  let t = 0;
  function frame() {
    t += 0.016; ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      if (!reduced) { s.y -= s.v / 4; if (s.y < -0.02) s.y = 1.02; }
      const a = 0.35 + 0.65 * Math.sin(t * s.s + s.ph) ** 2, x = s.x * w, y = s.y * h;
      if (s.glow) {
        const g = ctx.createRadialGradient(x, y, 0, x, y, s.r);
        g.addColorStop(0, `rgba(130,200,200,${0.55 * a})`); g.addColorStop(1, 'rgba(130,200,200,0)');
        ctx.fillStyle = g; ctx.fillRect(x - s.r, y - s.r, s.r * 2, s.r * 2);
      } else { ctx.fillStyle = `rgba(254,236,227,${a})`; ctx.fillRect(x, y, s.r, s.r); }
    }
    requestAnimationFrame(frame);
  }
  frame();
}
