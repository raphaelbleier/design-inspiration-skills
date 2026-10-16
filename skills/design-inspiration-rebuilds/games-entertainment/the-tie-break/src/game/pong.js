/*
 * pong.js - the rally. Physics in game space (a along, b across, see layout.js),
 * frame-rate normalised (dt in seconds, capped at 50 ms).
 *  - ball speed is in court-lengths / s: starts .6, +.045 per paddle hit, max 1.3
 *  - exit angle = offset from paddle centre * 1 rad (max ~57deg), side walls mirror it
 *  - opponent bot: aims at the predicted landing point (triangle-wave fold of the
 *    trajectory) + a random error. Difficulty is re-rolled after every point:
 *    error radius .07-.17, max speed .55-.9 widths/s. A hit tolerance of half the
 *    paddle + .02 means the bot misses on larger errors or when the ball outruns it.
 */
import { PADDLE } from './layout.js'

const rnd = (a, b) => a + Math.random() * (b - a)
const fold = (v) => { v = ((v % 2) + 2) % 2; return v > 1 ? 2 - v : v }

export function createPong(hooks) {
  const st = { a: .5, b: .5, dir: 1, ang: 0, speed: .6, you: 0, opp: 0, pYou: .5, pOpp: .5, live: false, serveT: 0 }
  const bot = { maxV: .7, diff: .12, err: 0, tgt: .5, t: 0 }
  const half = PADDLE / 2

  function newPoint() { bot.maxV = rnd(.55, .9); bot.diff = rnd(.07, .17) }
  function serve(dir) {
    Object.assign(st, { a: .5, b: rnd(.35, .65), dir, ang: rnd(-.35, .35), speed: .6, live: false, serveT: .9 })
    bot.err = rnd(-1, 1) * bot.diff
  }
  function reset() { st.you = st.opp = 0; st.pYou = st.pOpp = .5; newPoint(); serve(-1) }

  function step(dt, input, L) {
    dt = Math.min(dt, .05)
    st.pYou = Math.min(1 - half, Math.max(half, st.pYou + input * .95 * dt))
    // bot
    bot.t -= dt
    if (bot.t <= 0) {
      bot.t = .08
      if (st.dir > 0 && st.live) {
        const t = (1 - st.a) / Math.max(.05, st.speed * Math.cos(st.ang))
        bot.tgt = fold(st.b + st.speed * Math.sin(st.ang) * (L.fl / L.fw) * t) + bot.err
      } else bot.tgt = .5
    }
    const dv = Math.max(-bot.maxV * dt, Math.min(bot.maxV * dt, bot.tgt - st.pOpp))
    st.pOpp = Math.min(1 - half, Math.max(half, st.pOpp + dv))
    if (!st.live) { st.serveT -= dt; if (st.serveT <= 0) st.live = true; return }

    st.a += st.dir * st.speed * Math.cos(st.ang) * dt
    st.b += st.speed * Math.sin(st.ang) * (L.fl / L.fw) * dt
    if (st.b < 0) { st.b = -st.b; st.ang = -st.ang }
    if (st.b > 1) { st.b = 2 - st.b; st.ang = -st.ang }

    if (st.dir < 0 && st.a <= 0) {
      if (Math.abs(st.b - st.pYou) <= half + .02) hit(st.pYou, 1)
      else if (st.a < -.05) point('opp')
    } else if (st.dir > 0 && st.a >= 1) {
      if (Math.abs(st.b - st.pOpp) <= half + .02) { hit(st.pOpp, -1); bot.err = rnd(-1, 1) * bot.diff }
      else if (st.a > 1.05) point('you')
    }
  }
  function hit(pc, dir) {
    st.ang = Math.max(-1, Math.min(1, ((st.b - pc) / half) * 1))
    st.dir = dir; st.a = dir > 0 ? 0 : 1
    st.speed = Math.min(1.3, st.speed + .045)
    hooks.hit(dir > 0 ? 'you' : 'opp')
  }
  function point(who) {
    st[who]++; st.live = false; st.serveT = 99
    hooks.point(who)
  }
  return { st, step, serve, reset, newPoint }
}
