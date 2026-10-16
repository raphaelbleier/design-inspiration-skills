<p align="center">
  <a href="https://raphaelbleier.github.io/design-inspiration-skills/"><img src="docs/banner.webp" alt="design-inspiration: how award-winning sites are actually built" width="100%"></a>
</p>

<h1 align="center">design-inspiration-skills</h1>

<p align="center">
  <b>53 award-winning websites, taken apart and rebuilt clean-room, so your coding agent stops shipping templates.</b>
</p>

<p align="center">
  <a href="https://raphaelbleier.github.io/design-inspiration-skills/">Gallery</a> ·
  <a href="#install">Install</a> ·
  <a href="skills/design-inspiration/INDEX.md">Study index</a> ·
  <a href="#clean-room-policy">Clean-room policy</a>
</p>

<p align="center">
  <img alt="Studies" src="https://img.shields.io/badge/studies-53-111?style=flat-square">
  <img alt="Categories" src="https://img.shields.io/badge/categories-14-111?style=flat-square">
  <img alt="Agent Skills" src="https://img.shields.io/badge/Agent_Skills-compatible-b83208?style=flat-square">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-111?style=flat-square">
</p>

---

Ask a coding agent for an "award-winning" site and you get a hero, three cards and a gradient.
The agent has never seen *why* a Site of the Year works: the type contrast, the one easing curve
used everywhere, the single WebGL idea that carries the whole identity.

This repo gives it that knowledge. Each study measures one Awwwards winner (Site of the Year,
Site of the Month, Developer Award, Site of the Day, 2023 to 2026) and writes it down in a form
an agent can reuse:

| | |
|---|---|
| **Design tokens** | Palette with roles, type scale, fluid root logic, spacing, radii, as CSS variables |
| **Motion spec** | Every animation with trigger, duration, easing curve and stagger, plus the code that drives it |
| **Why it works** | The 3 to 5 decisions that make it award-level, and the anti-patterns it avoids |
| **Rebuild** | A runnable Vite project, written from scratch with fictional content and generated images |

## The studies

<!-- studies:start -->
<table>
<tr><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/architecture/fluid-glass/"><img src="site/public/thumbs/fluid-glass.webp" alt="Fluid Glass rebuild"></a><br><b>Fluid Glass</b><br><sub>SOTD</sub></td><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/architecture/shed/"><img src="site/public/thumbs/shed.webp" alt="Shed rebuild"></a><br><b>Shed</b><br><sub>SOTD</sub></td><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/architecture/springs/"><img src="site/public/thumbs/springs.webp" alt="Springs rebuild"></a><br><b>Springs</b><br><sub>SOTD</sub></td><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/architecture/telha-clarke/"><img src="site/public/thumbs/telha-clarke.webp" alt="Telha Clarke rebuild"></a><br><b>Telha Clarke</b><br><sub>SOTD</sub></td></tr>
<tr><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/art-illustration/mindmarket/"><img src="site/public/thumbs/mindmarket.webp" alt="MindMarket rebuild"></a><br><b>MindMarket</b><br><sub>SOTM Dec 2025</sub></td><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/art-illustration/oryzo-ai/"><img src="site/public/thumbs/oryzo-ai.webp" alt="Oryzo AI rebuild"></a><br><b>Oryzo AI</b><br><sub>SOTM Apr 2026</sub></td><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/art-illustration/pasticcino-world-tour/"><img src="site/public/thumbs/pasticcino-world-tour.webp" alt="Pasticcino Bag World Tour 2026 rebuild"></a><br><b>Pasticcino Bag World Tour 2026</b><br><sub>SOTD</sub></td><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/art-illustration/watson/"><img src="site/public/thumbs/watson.webp" alt="Watson rebuild"></a><br><b>Watson</b><br><sub>SOTM Sep 2024</sub></td></tr>
<tr><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/business-corporate/cominvi/"><img src="site/public/thumbs/cominvi.webp" alt="Cominvi rebuild"></a><br><b>Cominvi</b><br><sub>SOTD</sub></td><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/business-corporate/floema/"><img src="site/public/thumbs/floema.webp" alt="Floema rebuild"></a><br><b>Floema</b><br><sub>SOTM May 2026</sub></td><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/business-corporate/kriss-ai/"><img src="site/public/thumbs/kriss-ai.webp" alt="Kriss.ai rebuild"></a><br><b>Kriss.ai</b><br><sub>SOTM Oct 2024</sub></td><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/business-corporate/terminal-industries/"><img src="site/public/thumbs/terminal-industries.webp" alt="Terminal Industries rebuild"></a><br><b>Terminal Industries</b><br><sub>SOTM Sep 2025</sub></td></tr>
<tr><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/culture-education/capitolium/"><img src="site/public/thumbs/capitolium.webp" alt="Capitolium rebuild"></a><br><b>Capitolium</b><br><sub>SOTD</sub></td><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/culture-education/david-whyte-experience/"><img src="site/public/thumbs/david-whyte-experience.webp" alt="David Whyte Experience rebuild"></a><br><b>David Whyte Experience</b><br><sub>SOTM Dec 2024</sub></td><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/culture-education/tracing-art/"><img src="site/public/thumbs/tracing-art.webp" alt="Tracing Art rebuild"></a><br><b>Tracing Art</b><br><sub>SOTM Jul 2025</sub></td><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/culture-education/why-zero/"><img src="site/public/thumbs/why-zero.webp" alt="Why Zero rebuild"></a><br><b>Why Zero</b><br><sub>SOTM Sep 2026</sub></td></tr>
<tr><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/design-agencies/dropbox-brand/"><img src="site/public/thumbs/dropbox-brand.webp" alt="Dropbox Brand rebuild"></a><br><b>Dropbox Brand</b><br><sub>SOTM Feb 2025</sub></td><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/design-agencies/igloo-inc/"><img src="site/public/thumbs/igloo-inc.webp" alt="Igloo Inc rebuild"></a><br><b>Igloo Inc</b><br><sub>SOTY 2024</sub></td><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/design-agencies/immersive-garden/"><img src="site/public/thumbs/immersive-garden.webp" alt="Immersive Garden rebuild"></a><br><b>Immersive Garden</b><br><sub>SOTM Jan 2025</sub></td><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/design-agencies/lando-norris/"><img src="site/public/thumbs/lando-norris.webp" alt="Lando Norris rebuild"></a><br><b>Lando Norris</b><br><sub>SOTY 2025</sub></td></tr>
<tr><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/e-commerce/akaru/"><img src="site/public/thumbs/akaru.webp" alt="Akaru rebuild"></a><br><b>Akaru</b><br><sub>SOTM Apr 2024</sub></td><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/e-commerce/becane-paris/"><img src="site/public/thumbs/becane-paris.webp" alt="Becane Paris rebuild"></a><br><b>Becane Paris</b><br><sub>SOTD</sub></td><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/e-commerce/odd-ritual/"><img src="site/public/thumbs/odd-ritual.webp" alt="Odd Ritual rebuild"></a><br><b>Odd Ritual</b><br><sub>SOTD</sub></td><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/e-commerce/renaissance-edition/"><img src="site/public/thumbs/renaissance-edition.webp" alt="The Renaissance Edition rebuild"></a><br><b>The Renaissance Edition</b><br><sub>SOTM Feb 2026</sub></td></tr>
<tr><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/events/flowfest/"><img src="site/public/thumbs/flowfest.webp" alt="Flowfest 2025 rebuild"></a><br><b>Flowfest 2025</b><br><sub>SOTD</sub></td><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/events/truck-n-roll/"><img src="site/public/thumbs/truck-n-roll.webp" alt="Truck n Roll rebuild"></a><br><b>Truck n Roll</b><br><sub>SOTD</sub></td><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/events/vibrant-wellness/"><img src="site/public/thumbs/vibrant-wellness.webp" alt="Vibrant Wellness rebuild"></a><br><b>Vibrant Wellness</b><br><sub>SOTD</sub></td><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/experimental/ciao-energy/"><img src="site/public/thumbs/ciao-energy.webp" alt="Ciao Energy rebuild"></a><br><b>Ciao Energy</b><br><sub>SOTD</sub></td></tr>
<tr><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/experimental/lisa-locomotive/"><img src="site/public/thumbs/lisa-locomotive.webp" alt="L.I.S.A rebuild"></a><br><b>L.I.S.A</b><br><sub>SOTD</sub></td><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/experimental/leo-parpeix/"><img src="site/public/thumbs/leo-parpeix.webp" alt="Léo Parpeix Portfolio 2026 rebuild"></a><br><b>Léo Parpeix Portfolio 2026</b><br><sub>SOTD</sub></td><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/experimental/pp-neue-montreal/"><img src="site/public/thumbs/pp-neue-montreal.webp" alt="PP Neue Montreal rebuild"></a><br><b>PP Neue Montreal</b><br><sub>SOTD</sub></td><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/fashion/bennett-clive/"><img src="site/public/thumbs/bennett-clive.webp" alt="Bennett & Clive rebuild"></a><br><b>Bennett & Clive</b><br><sub>SOTM Mar 2024</sub></td></tr>
<tr><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/fashion/extraordinary-lab/"><img src="site/public/thumbs/extraordinary-lab.webp" alt="GQ & AP The Extraordinary Lab rebuild"></a><br><b>GQ & AP The Extraordinary Lab</b><br><sub>SOTM Mar 2026</sub></td><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/fashion/lacoste-ace-breaker/"><img src="site/public/thumbs/lacoste-ace-breaker.webp" alt="Lacoste Ace Breaker rebuild"></a><br><b>Lacoste Ace Breaker</b><br><sub>SOTD</sub></td><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/fashion/miu-miu-house/"><img src="site/public/thumbs/miu-miu-house.webp" alt="Miu Miu A House That We Shaped rebuild"></a><br><b>Miu Miu A House That We Shaped</b><br><sub>SOTD</sub></td><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/film-tv/lxl-creative/"><img src="site/public/thumbs/lxl-creative.webp" alt="LxL Creative rebuild"></a><br><b>LxL Creative</b><br><sub>SOTD</sub></td></tr>
<tr><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/film-tv/milledollars/"><img src="site/public/thumbs/milledollars.webp" alt="MilleDollars rebuild"></a><br><b>MilleDollars</b><br><sub>SOTD</sub></td><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/film-tv/siena-film-foundation/"><img src="site/public/thumbs/siena-film-foundation.webp" alt="Siena Film Foundation rebuild"></a><br><b>Siena Film Foundation</b><br><sub>SOTM Mar 2025</sub></td><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/film-tv/studio-alphonse/"><img src="site/public/thumbs/studio-alphonse.webp" alt="Studio Alphonse rebuild"></a><br><b>Studio Alphonse</b><br><sub>SOTD</sub></td><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/food-drink/zeroz-otsuka/"><img src="site/public/thumbs/zeroz-otsuka.webp" alt="/zeroz Brand Site rebuild"></a><br><b>/zeroz Brand Site</b><br><sub>SOTD</sub></td></tr>
<tr><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/food-drink/mana-yerba-mate/"><img src="site/public/thumbs/mana-yerba-mate.webp" alt="Mana Yerba Mate rebuild"></a><br><b>Mana Yerba Mate</b><br><sub>SOTY 2023</sub></td><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/food-drink/santioni-spirits/"><img src="site/public/thumbs/santioni-spirits.webp" alt="Santioni Spirits rebuild"></a><br><b>Santioni Spirits</b><br><sub>SOTD</sub></td><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/food-drink/slosh-seltzer/"><img src="site/public/thumbs/slosh-seltzer.webp" alt="Slosh Seltzer rebuild"></a><br><b>Slosh Seltzer</b><br><sub>SOTM Jun 2024</sub></td><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/games-entertainment/messenger-abeto/"><img src="site/public/thumbs/messenger-abeto.webp" alt="Messenger rebuild"></a><br><b>Messenger</b><br><sub>SOTY 2025</sub></td></tr>
<tr><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/games-entertainment/ponpon-mania/"><img src="site/public/thumbs/ponpon-mania.webp" alt="Ponpon Mania rebuild"></a><br><b>Ponpon Mania</b><br><sub>SOTM Oct 2025</sub></td><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/games-entertainment/the-tie-break/"><img src="site/public/thumbs/the-tie-break.webp" alt="The Tie-break! rebuild"></a><br><b>The Tie-break!</b><br><sub>SOTD</sub></td><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/hotel-restaurant/son-daven/"><img src="site/public/thumbs/son-daven.webp" alt="Son Daven rebuild"></a><br><b>Son Daven</b><br><sub>SOTM Jun 2026</sub></td><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/hotel-restaurant/tengile-malamala/"><img src="site/public/thumbs/tengile-malamala.webp" alt="Tengile Malamala Collection rebuild"></a><br><b>Tengile Malamala Collection</b><br><sub>SOTD</sub></td></tr>
<tr><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/hotel-restaurant/units-gr/"><img src="site/public/thumbs/units-gr.webp" alt="Units rebuild"></a><br><b>Units</b><br><sub>SOTD</sub></td><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/hotel-restaurant/white-desert/"><img src="site/public/thumbs/white-desert.webp" alt="White Desert rebuild"></a><br><b>White Desert</b><br><sub>SOTD</sub></td><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/institutions/lifeworld/"><img src="site/public/thumbs/lifeworld.webp" alt="Lifeworld rebuild"></a><br><b>Lifeworld</b><br><sub>SOTD</sub></td><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/institutions/seasats/"><img src="site/public/thumbs/seasats.webp" alt="Seasats rebuild"></a><br><b>Seasats</b><br><sub>SOTD</sub></td></tr>
<tr><td width="25%" valign="top"><a href="https://raphaelbleier.github.io/design-inspiration-skills/studies/institutions/sharplink/"><img src="site/public/thumbs/sharplink.webp" alt="Sharplink rebuild"></a><br><b>Sharplink</b><br><sub>SOTD</sub></td></tr>
</table>
<!-- studies:end -->

Browse them with filters by category and technique in the
**[gallery](https://raphaelbleier.github.io/design-inspiration-skills/)**, where every rebuild runs live.

## Install

Two skills, so you choose how much lands in your project:

| Skill | Contains | Size |
|---|---|---|
| `design-inspiration` | Index plus every study: tokens, motion spec with code excerpts, why it works | under 1 MB |
| `design-inspiration-rebuilds` | The runnable Vite rebuild with images for every study | about 64 MB |

**Any agent** ([Agent Skills](https://agentskills.io) CLI), pick one or both when prompted:

```bash
npx skills add raphaelbleier/design-inspiration-skills
# non-interactive
npx skills add raphaelbleier/design-inspiration-skills --skill design-inspiration
```

**Claude Code plugin:** add the marketplace once, then install one or both plugins:

```
/plugin marketplace add raphaelbleier/design-inspiration-skills
/plugin install design-inspiration@design-inspiration-skills
/plugin install design-inspiration-rebuilds@design-inspiration-skills
```

The same from a terminal: `claude plugin marketplace add raphaelbleier/design-inspiration-skills`,
then `claude plugin install design-inspiration@design-inspiration-skills`.

## How an agent uses it

1. The skill triggers when you ask for a site that should feel premium, award-level or less generic.
2. The agent opens [`INDEX.md`](skills/design-inspiration/INDEX.md) and picks 1 to 3 studies by
   industry or by the technique it needs (`webgl`, `page-transitions`, `text-reveal`, ...).
3. It reads the tokens, the motion spec and the reasoning, then applies the *principles* to your
   brand: one signature effect, a restrained supporting system, the study's easing as a starting value.
4. When it needs a complete implementation, it opens the rebuild file the motion spec names.

## Clean-room policy

- Not affiliated with Awwwards or with any studio whose work is studied here.
- No original code, images, fonts or copy are included. Every rebuild is written from scratch,
  uses fictional names and copy, AI-generated images and open-source font substitutes.
- Every study credits and links the original site and its creators.
- Are you the creator of a studied site and want it removed? Open an
  [opt-out request](../../issues/new?template=opt-out.yml) and it will be removed.

## Contributing

Each study lives in two places: the breakdown in `skills/design-inspiration/studies/<category>/<slug>/`
and the rebuild in `skills/design-inspiration-rebuilds/<category>/<slug>/`. `node scripts/studies.mjs`
validates every study (required sections, code excerpts, no reference to the original domain, no
file copied from a capture of the original) and regenerates the index and the table above.

## License

Code: [MIT](LICENSE). Original designs remain the intellectual property of their creators.
