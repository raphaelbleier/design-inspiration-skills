/* Chat widget: bubble nudge bottom-right, panel opens from the framed button, canned keyword replies. */
const replies = [
  [/hour|open|close/i, 'We are open Monday to Friday, 8 to 17, and Saturday mornings.'],
  [/price|cost|plan/i, 'Plans start at $49 a month. Scroll to Plans for the full list.'],
  [/book|appoint|visit/i, 'I can book you in. Which day suits you best?'],
];
export function initChat() {
  const $ = (id) => document.getElementById(id);
  const win = $('win'), log = $('log'), bubble = $('bubble');
  const add = (cls, t) => { const p = document.createElement('p'); p.className = cls; p.textContent = t; log.append(p); log.scrollTop = 1e5; };
  $('fab').onclick = () => { win.hidden = !win.hidden; bubble.classList.add('gone'); if (!win.hidden) $('msg').focus(); };
  $('x').onclick = () => { win.hidden = true; };
  $('form').onsubmit = (e) => {
    e.preventDefault();
    const v = $('msg').value.trim(); if (!v) return;
    $('msg').value = ''; add('me', v);
    const hit = replies.find(([re]) => re.test(v));
    setTimeout(() => add('bot', hit ? hit[1] : 'Good question. I will pass it to the team and they will reply today.'), 600);
  };
}
