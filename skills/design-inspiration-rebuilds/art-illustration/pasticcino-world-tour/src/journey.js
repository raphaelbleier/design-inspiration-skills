/* Technique: one pinned stage, 7 painted scenes crossfaded on a scrubbed timeline.
   Pin length 100% viewport per chapter; scrub 1; each incoming scene dollies 1.22 -> 1
   while fading in, the outgoing one is dropped at the end of the step. */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initJourney(onChapter) {
  const stage = document.querySelector('.stage');
  const scenes = [...stage.querySelectorAll('.scene')];
  const fill = stage.querySelector('.rail-fill');
  const join = stage.querySelector('.join');
  const steps = scenes.length - 1;

  const tl = gsap.timeline({ defaults: { ease: 'none' } });
  scenes.forEach((s, i) => {
    if (i === 0) return;
    tl.fromTo(s, { opacity: 0, scale: 1.22 }, { opacity: 1, scale: 1, duration: 1 }, i - 1)
      .set(scenes[i - 1], { opacity: 0 }, i);
  });
  let current = -1;
  ScrollTrigger.create({
    animation: tl, trigger: stage, start: 'top top', end: `+=${steps * 100}%`,
    pin: true, scrub: 1,
    onUpdate: (self) => {
      gsap.set(fill, { scaleX: self.progress });
      const i = Math.round(self.progress * steps);
      if (i !== current) { current = i; onChapter(scenes[i], i); join.hidden = i !== steps; }
    },
  });
  onChapter(scenes[0], 0);
  return scenes;
}
