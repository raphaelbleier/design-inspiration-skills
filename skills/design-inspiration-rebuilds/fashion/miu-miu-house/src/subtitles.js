// Subtitle line: letters typed in by opacity (stagger .018 per char), held 3.2s, faded .5s.
import gsap from 'gsap';

const el = () => document.getElementById('subs');
let tl;
export function say(text) {
  const e = el(); tl?.kill(); e.innerHTML = '';
  [...text].forEach((c) => { const s = document.createElement('span'); s.textContent = c; s.style.opacity = 0; e.append(s); });
  tl = gsap.timeline()
    .to(e.children, { opacity: 1, duration: .01, stagger: .018 })
    .to(e, { opacity: 0, duration: .5, delay: 3.2 })
    .set(e, { opacity: 1 });
  tl.add(() => { e.innerHTML = ''; });
}
