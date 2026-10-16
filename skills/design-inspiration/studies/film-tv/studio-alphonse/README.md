---
title: Studio Alphonse
url: https://www.studioalphonse.com
studio: Michael Bernard
awards: [SOTD, Developer Award]
year: 2025
category: film-tv
techniques: [loader, sticker-loader, scroll-pinning, sticky-stacking, marquee, outline-text, image-trail, fixed-footer-reveal, custom-cursor, page-transitions, smooth-scroll, film-grain]
stack: [gsap, scrolltrigger, lenis, webflow]
---

# Studio Alphonse — clean-room study

A production and post-production studio on a small island, dressed as **a shelf of VHS tapes**.
Nothing here is WebGL: the identity comes from retro video objects (a cassette-shaped loader, tape
labels as service cards, spines as a project timeline) in a warm cream, charcoal and three accent
stripes (red, amber, indigo) that recur as logo, menu and footer. Type is one very wide
extra-bold grotesk against a narrow technical body face, with a paper-grain overlay over everything.

Rebuild: [`design-inspiration-rebuilds/film-tv/studio-alphonse`](https://github.com/raphaelbleier/design-inspiration-skills/tree/main/skills/design-inspiration-rebuilds/film-tv/studio-alphonse) (fictional studio "Studio Marguerite", image slots listed in `images.json`, open-source fonts; installed with the optional `design-inspiration-rebuilds` skill). Run it with `npm install && npm run dev`.

## Design Tokens

| Role | Value |
|---|---|
| Warm cream (page, tickets) | `#e5e2d6` |
| Charcoal (ink, dark sections, cassette body) | `#292f33` |
| Indigo (headlines, counter, menu panel) | `#4f52be` |
| Amber (stripe, stickers, alt ticket title) | `#ddab45` / `#c29230` |
| Rose red (stripe) | `#ba4f5e` |

```css
:root {
  --white-smoke: #e5e2d6; --black: #292f33; --purple: #4f52be; --yellow: #ddab45; --red: #ba4f5e;
  --size-font-hero: 3.5vw; --border-2: 2px; --radius: 6px;
  --espacement-section: 12vh; --gap-etiquette: 2vw; --padding-nav: 5vh;
}
```

- **Type:** a wide variable grotesk (original: a licensed variable face with a `wdth` axis up to 200;
  substitute: Anybody at `font-stretch: 150%`, weight 800-900, always uppercase). Body and labels use a
  narrow technical sans (substitute: Saira) at weight 300-400 and `font-stretch` 70-80%.
- **Impact type:** hero `3.5vw`, citation `8vw` italic, footer wordmark ~`11.6vw`. Everything is sized in
  `vw`/`vh`, so the whole composition scales as one object between breakpoints.
- **Shape:** 6px radius, 2px borders, no shadows. Depth comes from stacking, rotation (-3deg to 2deg)
  and the grain overlay, never from elevation.
- **Grain:** a fixed full-screen noise layer over the page at about 35% opacity (SVG `feTurbulence`
  in the rebuild; a tiled texture in the original).

## Motion Spec

| What | Trigger | Animation | Duration / easing | Rebuild file |
|---|---|---|---|---|
| Smooth scroll | after loader, desktop only | Lenis `{ lerp: .07, wheelMultiplier: .7 }`, driven by `gsap.ticker`; scroll locked until the loader ends | — | `src/scroll.js` |
| Cassette loader | page load | counter 0 → 100 inside a tape label, 12 die-cut stickers pop in at staggered times, the screen lifts away | 3s `power2.inOut`; stickers `back.out(2)` | `src/loader.js` |
| Hero slit | scroll 0 → 130% (pinned) | headline split around a thin slit; the slit grows to 50vh and pushes the lines apart, the still scales 1.35 → 1 | scrub 1 | `src/hero.js` |
| Cassette stack | scroll | sticky tape cards stack at `top: 12vh`; the covered one scales to .94 and dims; reels rotate 360deg | scrubbed | `src/expertises.js` |
| Spine strip | always | VHS spines (year, wordmark, vertical title) as an infinite row | 40s linear | `src/spines.js` |
| Citation | scroll through section | same line twice, filled and outlined, moving in opposite directions | scrub 1 | `src/citation.js` |
| Client bands | always | two tilted bands (2deg, -3deg), logo cells as opposite marquees | 40s / 32s linear | `src/clients.js` |
| Follow card | pointer in clients | card follows the cursor, tilts by horizontal speed, resets after 66ms stillness | `quickTo` 1s `power4` | `src/clients.js` |
| Cursor label | hover on `[data-cursor]` | small label trails the pointer, flips left in the right 10% | `quickTo` `power3` | `src/cursor.js` |
| Menu | click | full-screen panel wipes down, three stripes grow, sticker pops, items rise from a mask | .8s `power3.inOut` | `src/menu.js` |
| Fixed footer | scroll to end | footer is `position: fixed` behind the page; the page lifts to uncover it | none (CSS) | `src/style.css` |
| Image trail | pointer in footer | every few px the next image appears at the cursor and fades after a pause | .4s `power3.out` in | `src/footer.js` |
| Page transition | link click | VHS wipe covers the screen, navigation fires after ~1.5s (original: Webflow interaction; rebuild: menu panel only) | 1.5s exit | `src/menu.js` |
| Hover states | hover | menu item shifts weight and width (`wght 700 → 100`), burger padding collapses | .3s `cubic-bezier(.645,.045,.355,1)` | `src/style.css` |

### Key excerpts

**Smooth scroll on the GSAP ticker**: `src/scroll.js`
```js
lenis = new Lenis({ lerp: 0.07, wheelMultiplier: 0.7, autoRaf: false });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
```
Lenis only starts once the loader has finished, and only above 991px; touch devices keep native scroll.

**Loader counter and stickers**: `src/loader.js`
```js
tl.to(num, { v: 100, duration: dur, ease: 'power2.inOut', onUpdate: () => (count.textContent = Math.round(num.v)) }, 0);
gsap.utils.toArray('.st').forEach((el, i) => {
  tl.fromTo(el, { scale: 0.4, opacity: 0, rotate: gsap.utils.random(-25, 25) },
    { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)' }, 0.25 + i * (dur / 6));
});
tl.to(loader, { yPercent: -100, duration: 0.9, ease: 'power3.inOut' }, dur + 0.2);
```
Stickers are timed against the counter so the loader reads as one gesture.

**Hero slit that pushes the headline apart**: `src/hero.js`
```js
const tl = gsap.timeline({
  scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=130%', pin: '.hero-inner', scrub: 1 },
});
tl.fromTo(frame, { height: () => innerWidth * 0.006 }, { height: () => innerHeight * 0.5, ease: 'none' }, 0)
  .fromTo(img, { scale: 1.35 }, { scale: 1, ease: 'none' }, 0);
```
The text lines sit in a flex column around the frame, so growing one height moves both halves with no extra tweens.

**Sticky cassette stacking**: `src/expertises.js`
```js
const next = cards[i + 1];
gsap.to(card, { scale: 0.94, filter: 'brightness(.7)', ease: 'none',
  scrollTrigger: { trigger: next, start: 'top 80%', end: 'top 20%', scrub: true } });
```
`position: sticky; top: 12vh` does the pinning; GSAP only handles the dimming of the covered card.

**Filled and outlined citation lines**: `src/citation.js`
```js
const st = { trigger: '.citation', start: 'top bottom', end: 'bottom top', scrub: 1 };
gsap.fromTo('.cit-fill', { xPercent: 0 }, { xPercent: -35, ease: 'none', scrollTrigger: st });
gsap.fromTo('.cit-stroke', { xPercent: -35 }, { xPercent: 0, ease: 'none', scrollTrigger: st });
```
```css
.cit-stroke { color: transparent; -webkit-text-stroke: 2px var(--purple); }
```

**Fixed footer uncovered by the page**: `src/style.css`
```css
.page { position: relative; z-index: 2; background: var(--smoke); margin-bottom: 100svh; }
.contact { position: fixed; inset: auto 0 0 0; height: 100svh; z-index: 1; }
```

## Why Award-Worthy

1. **One object world.** Cassette loader, tape-label service cards, spine timeline and the stripe
   motif all come from the same VHS shelf. Every section reuses the metaphor, so the page feels
   authored rather than assembled from templates.
2. **Personality in the loader.** Twelve die-cut mascot stickers pop around a progress label. It
   sets the tone (playful, craft-first) before any content, for a studio that makes serious cinema.
3. **Restrained palette, loud type.** Cream and charcoal carry the page; three stripe colours show up
   only in logo, menu and footer. The very wide grotesk does the shouting.
4. **Mostly CSS, little JS.** Sticky stacking, the fixed-footer reveal and the tilted bands are CSS
   layout; GSAP is used for the loader, scrubs and marquees. The page stays light with no WebGL.
5. **Scale by viewport units.** Sizes in `vw`/`vh` keep tight lockups intact across desktop widths.

**Anti-patterns it avoids:** no drop shadows or gradients; no generic fade-up on scroll; no stock
icons (mascots and stripes are the system); no WebGL just for show; smooth scroll is off on touch.

## Credits

- Original: [studioalphonse.com](https://www.studioalphonse.com) by **Michael Bernard**. Design and
  content are the intellectual property of their creators.
- Recognition: Awwwards Site of the Day, Developer Award.
- This study is an independent clean-room analysis. The rebuild uses a fictional studio, image slots to
  be filled with generated images and open-source fonts; it contains no original code, assets or copy.
