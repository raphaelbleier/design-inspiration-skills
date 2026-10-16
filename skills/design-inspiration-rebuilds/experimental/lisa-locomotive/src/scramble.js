/* Decode-type effect. Characters resolve left to right; a 6-char window of random glyphs
   trails the cursor. Duration = 0.022s per char (min .6s, max 2.4s), ease none (linear).
   `html` may contain <br> and <em>; scrambling runs on the plain text, markup is restored at the end. */
import gsap from 'gsap';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#%&?{}[]<>=+/\\$@';
const WINDOW = 6;
const rnd = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];

export function scrambleIn(el, html, { reduced = false, onTick, onDone } = {}) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html.replace(/<br>/g, '\n');
  const text = tmp.textContent;
  const cursor = document.createElement('span');
  cursor.className = 'cursor';
  if (reduced) { el.innerHTML = html; el.append(cursor); onDone?.(); return { kill() {} }; }

  const state = { n: 0 };
  const dur = Math.min(2.4, Math.max(0.6, text.length * 0.022));
  const tween = gsap.to(state, {
    n: text.length, duration: dur, ease: 'none',
    onUpdate() {
      const done = Math.floor(state.n);
      let out = text.slice(0, done);
      for (let i = done; i < Math.min(text.length, done + WINDOW); i++) out += text[i] === ' ' || text[i] === '\n' ? text[i] : rnd();
      el.textContent = out;
      el.append(cursor);
      onTick?.(done);
    },
    onComplete() { el.innerHTML = html; el.append(cursor); onDone?.(); },
  });
  return { kill() { tween.kill(); el.innerHTML = html; el.append(cursor); } };
}
