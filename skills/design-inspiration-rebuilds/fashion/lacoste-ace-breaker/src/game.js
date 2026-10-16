// Breakout-style game on a canvas. Racket: 22% of width, speed follows pointer with lerp .35.
// Ball: speed 5.2px/frame (x set), +6% per tile row cleared; bounce angle = offset from racket centre * 60deg.
// Tiles: 6 rows x 8 cols, alternate yellow / cream / deep green, 1 hit each. 3 lives, 3 sets.
import gsap from 'gsap';
const W = 360, H = 520, COLS = 8, ROWS = 6, PAD = 6;
export function createGame(cv, hooks) {
  const ctx = cv.getContext('2d'); const dpr = Math.min(devicePixelRatio || 1, 2);
  cv.width = W * dpr; cv.height = H * dpr; ctx.scale(dpr, dpr);
  let s, raf, tx = W / 2, running = false;
  const cols = ['#fcd757', '#f3f2e1', '#2f7a46'];
  const init = (set = 1, score = 0) => { s = { set, score, lives: 3, px: W / 2, served: false, speed: 5 + set * .6, ball: { x: W / 2, y: H - 46, vx: 0, vy: 0 }, tiles: [], parts: [] };
    const tw = (W - PAD * 2) / COLS;
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) s.tiles.push({ x: PAD + c * tw + 2, y: 60 + r * 24, w: tw - 4, h: 18, col: cols[(r + c) % 3], alive: true });
    hooks.hud(s); };
  const serve = () => { if (s.served) return; s.served = true; const a = -Math.PI / 2 + (Math.random() - .5) * .8; s.ball.vx = Math.cos(a) * s.speed; s.ball.vy = Math.sin(a) * s.speed; };
  const move = (e) => { const r = cv.getBoundingClientRect(); tx = ((e.clientX - r.left) / r.width) * W; };
  const pw = () => W * .22;
  function step() {
    s.px += (tx - s.px) * .35; s.px = Math.max(pw() / 2, Math.min(W - pw() / 2, s.px));
    const b = s.ball;
    if (!s.served) { b.x = s.px; b.y = H - 46; } else {
      b.x += b.vx; b.y += b.vy;
      if (b.x < 8 || b.x > W - 8) { b.vx *= -1; b.x = Math.max(8, Math.min(W - 8, b.x)); }
      if (b.y < 8) { b.vy = Math.abs(b.vy); }
      if (b.vy > 0 && b.y > H - 44 && b.y < H - 30 && Math.abs(b.x - s.px) < pw() / 2 + 6) {
        const a = ((b.x - s.px) / (pw() / 2)) * (Math.PI / 3); const sp = Math.hypot(b.vx, b.vy);
        b.vx = Math.sin(a) * sp; b.vy = -Math.cos(a) * sp; hooks.blip(520);
      }
      for (const t of s.tiles) if (t.alive && b.x + 7 > t.x && b.x - 7 < t.x + t.w && b.y + 7 > t.y && b.y - 7 < t.y + t.h) {
        t.alive = false; b.vy *= -1; s.score += 10; hooks.blip(300 + Math.random() * 200);
        for (let i = 0; i < 6; i++) s.parts.push({ x: t.x + t.w / 2, y: t.y + t.h / 2, vx: (Math.random() - .5) * 4, vy: (Math.random() - .5) * 4, l: 1, c: t.col });
        const k = 1.01; b.vx *= k; b.vy *= k; hooks.hud(s); break; }
      if (b.y > H) { s.lives--; s.served = false; hooks.hud(s); if (s.lives <= 0) return end(false); }
      if (!s.tiles.some((t) => t.alive)) { if (s.set >= 3) return end(true); const n = s.set + 1, sc = s.score; init(n, sc); }
    }
    s.parts.forEach((p) => { p.x += p.vx; p.y += p.vy; p.l -= .04; }); s.parts = s.parts.filter((p) => p.l > 0);
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (const t of s.tiles) if (t.alive) { ctx.fillStyle = t.col; ctx.beginPath(); ctx.roundRect(t.x, t.y, t.w, t.h, 5); ctx.fill(); }
    for (const p of s.parts) { ctx.globalAlpha = p.l; ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, 4, 4); } ctx.globalAlpha = 1;
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(s.px - pw() / 2, H - 34, pw(), 12, 6); ctx.fill();
    ctx.fillStyle = '#fcd757'; ctx.beginPath(); ctx.arc(s.ball.x, s.ball.y, 7, 0, 7); ctx.fill();
  }
  const loop = () => { if (!running) return; step(); if (running) draw(); raf = requestAnimationFrame(loop); };
  function end(win) { running = false; cancelAnimationFrame(raf); hooks.end(win, s.score); }
  cv.addEventListener('pointermove', move); cv.addEventListener('pointerdown', (e) => { move(e); serve(); });
  addEventListener('keydown', (e) => { if (!running) return; if (e.code === 'Space') { e.preventDefault(); serve(); }
    if (e.code === 'ArrowLeft') tx -= 40; if (e.code === 'ArrowRight') tx += 40; });
  return { start() { init(); running = true; gsap.fromTo(cv, { scale: .94, opacity: 0 }, { scale: 1, opacity: 1, duration: .8, ease: 'power3.out' }); loop(); },
    stop() { running = false; cancelAnimationFrame(raf); } };
}
