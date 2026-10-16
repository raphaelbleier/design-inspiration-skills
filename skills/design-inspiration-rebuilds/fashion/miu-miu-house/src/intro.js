// Intro gate: title words slide up out of their rows (yPercent 110 -> 0, power4.out, .9s, stagger .05),
// "Enter" fades the whole gate with a .9s power2.inOut upward wipe (clip-path inset).
import gsap from 'gsap';

export function playIntro() {
  const w = document.querySelectorAll('.intro .w');
  gsap.set(['.intro__sound', '.intro__sub', '.intro__enter'], { autoAlpha: 0 });
  gsap.set(w, { yPercent: 110 });
  gsap.timeline({ delay: .3 })
    .to(w, { yPercent: 0, duration: .9, ease: 'power4.out', stagger: .05 })
    .to(['.intro__sound', '.intro__sub', '.intro__enter'], { autoAlpha: 1, duration: .8, ease: 'power2.out', stagger: .12 }, '-=.4');
}

export function leaveIntro() {
  const el = document.getElementById('intro');
  return new Promise((res) => gsap.to(el, { clipPath: 'inset(0 0 100% 0)', duration: .9, ease: 'power2.inOut',
    onComplete: () => { el.hidden = true; res(); } }));
}
