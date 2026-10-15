/* Fictional content. Every name, brand and sentence here is invented; tone and length
   mirror an agency portfolio (short luxury-flavoured statements). */

export const studio = {
  name: 'Lumen Orchard',
  baseline: 'Innovative digital experiences studio',
  email: 'inquiries@lumen-orchard.example',
  address: ['Lumen Orchard', '9 rue des Tilleuls', 'Lyon 69002'],
  hero: 'Reach past anything seen or felt before by building singular experiences for brave, ambitious houses.',
  approach: 'An independent studio shaping digital worlds with craft and restraint, so ambitious brands can move people rather than pages.',
  mission: 'To build places on the internet that feel discovered rather than designed, and stay with people long after the tab is closed.',
};

/* Layout templates for the home "project blocks".
   [kind, colStart, colSpan, gridRow, marginTop(vw), aspect]  (12-column grid).
   Media items consume the project's images in order; "t" is the serif legend. */
export const templates = {
  A: [['m', 2, 6, 1, 0, '16/9'], ['t', 9, 3, 1, 4, 0], ['m', 8, 4, 2, 0, '1/1']],
  B: [['m', 6, 6, 1, 0, '16/9'], ['t', 8, 3, 2, 0, 0], ['m', 2, 3, 2, 6, '3/4']],
  C: [['t', 2, 3, 1, 9, 0], ['m', 5, 7, 1, 0, '16/9'], ['m', 2, 4, 2, 2, '3/4']],
  D: [['m', 3, 8, 1, 0, '16/9'], ['t', 5, 4, 2, 0, 0], ['m', 9, 3, 3, -2, '1/1']],
};

/* img: file stems in public/img. type: list-page label. tags: list-page preview caption. */
export const projects = [
  { slug: 'valcourt-odyssey', title: 'Valcourt Odyssey', type: 'Web Experience', tags: 'Design, Experience', tpl: 'A', img: ['pa', 'pl', 'pc'],
    legend: 'Explore our collaboration with Maison Valcourt on Odyssey, a first digital travelling case for the house’s adventurous spirit.',
    headline: 'Opening Maison Valcourt’s Next Territory with an Immersive Travelling Case', body: 'A browsable valley, a silver case and a cursor that behaves like weather. Odyssey introduced the house to a new audience without a single product grid.' },
  { slug: 'marlowe-fields', title: 'Marlowe Fields', type: 'Web Experience', tags: 'Design, Development', tpl: 'B', img: ['pd', 'pe', 'pk'],
    legend: 'Step into a slow, spoken portfolio for the poet Marlowe Fields, where every line unfolds like a walk through open country.',
    headline: 'A Quiet Landscape Built Around One Voice', body: 'Typography, field recordings and long scroll distances turn a body of work into a place you wander through.' },
  { slug: 'auren-winter-gala', title: 'Auren Winter Gala', type: 'E-Shop', tags: 'Design, E-Commerce', tpl: 'C', img: ['pf', 'pb', 'pc'],
    legend: 'A festive shop for Auren’s winter gala, where limited pieces float through a glass-lit hall before they are chosen.',
    headline: 'Turning a Seasonal Release into a Glass-Lit Hall of Gifts', body: 'Every product is a rotating object in a shared room. Checkout stayed ordinary on purpose, so the wonder never slowed a purchase.' },
  { slug: 'domaine-brisselin', title: 'Domaine Brisselin', type: 'Web Experience', tags: 'Design, Experience', tpl: 'D', img: ['pd', 'pg', 'pj'],
    legend: 'Follow Domaine Brisselin from first light on the slopes to the last pour, in a film you steer with your hand.',
    headline: 'A Winegrower’s Day, Told from Dawn to Dusk', body: 'Hillside footage, tactile sound and a timeline that follows the sun give a small domaine the presence of a great house.' },
  { slug: 'auren-in-motion', title: 'Auren in Motion', type: 'Web Experience', tags: 'Design, Experience', tpl: 'A', img: ['pb', 'pl', 'pk'],
    legend: 'Discover how Auren’s watchmakers shape time, in a journey that moves through gears, light and pure metal.',
    headline: 'Entering the Workshop Where Time Is Made', body: 'Macro scenes, patient pacing and real machined detail replace the usual spec sheet.' },
  { slug: 'nordkap-seven', title: 'Nordkap7', type: 'Web Experience', tags: 'Design, Development', tpl: 'B', img: ['pi', 'pe', 'pj'],
    legend: 'A calm control room for Nordkap7, translating a dense software platform into one legible, glowing surface.',
    headline: 'Making a Complex Platform Feel Calm', body: 'One surface, three levels of depth. The interface reveals only what the visitor asks for.' },
  { slug: 'glyphe', title: 'Glyphe', type: 'Corporate', tags: 'Design, Branding', tpl: 'C', img: ['pf', 'pi', 'pa'],
    legend: 'A confident corporate site for Glyphe, a type foundry that wanted to feel more like a gallery than a catalogue.',
    headline: 'A Foundry Presented Like a Gallery', body: 'Large specimens, generous silence and one hairline rule define the system.' },
  { slug: 'lumiviera', title: 'Lumiviera', type: 'Web Experience', tags: 'Design, Experience', tpl: 'D', img: ['pg', 'pk', 'pe'],
    legend: 'Step into an exquisite 3D journey through Lumiviera, where a coastal collection comes to life in breathtaking detail.',
    headline: 'A Seaside Collection You Can Walk Through', body: 'Terraces, parasols and a turquoise horizon, all lit by one sun that follows your cursor.' },
  { slug: 'marell-tidewatch', title: 'Marell Tidewatch', type: 'Web Experience', tags: 'Design, Experience', tpl: 'A', img: ['pl', 'pb', 'pc'],
    legend: 'Marell’s dive watch meets the open ocean in a story told through depth, pressure and a very patient needle.',
    headline: 'Descending with the Dive Watch', body: 'Scroll equals depth. The page darkens, slows and quiets as you go down.' },
  { slug: 'sahra-destination', title: 'Sahra Destination', type: 'Web Experience', tags: 'Design, Experience', tpl: 'B', img: ['ph', 'pj', 'pe'],
    legend: 'A cultural destination reimagined as a desert you cross at your own pace, one monument at a time.',
    headline: 'Crossing the Desert, One Monument at a Time', body: 'Long shadows, real distance and a map that only appears when you stop moving.' },
  { slug: 'meridian-wave', title: 'Meridian Wave', type: 'Corporate', tags: 'Design, Strategy', img: ['pi', 'pj'], tpl: 'A',
    legend: 'A corporate platform for Meridian Wave that finally explains tidal energy without a single stock photo.', headline: 'Explaining Tidal Energy Without Clichés', body: 'Simple animation, honest numbers and a restrained palette.' },
  { slug: 'orbis-clearspace', title: 'Orbis Clearspace', type: 'Corporate', tags: 'Design, Branding', img: ['pe', 'pf'], tpl: 'B',
    legend: 'A transparent, airy identity for Orbis, a maker of clear architectural glass.', headline: 'An Identity as Clear as the Product', body: 'Light, reflection and almost no colour.' },
  { slug: 'oranel', title: 'Oranel', type: 'Corporate', tags: 'Design, Development', img: ['pj', 'pi'], tpl: 'C',
    legend: 'Oranel’s warm, underground story of energy, told with real caverns and a steady hand.', headline: 'Telling an Energy Story from Underground', body: 'Real locations, slow reveals and a very quiet score.' },
  { slug: 'prisma-lab', title: 'Prisma Lab', type: 'Corporate', tags: 'Design, Development', img: ['pf', 'pa'], tpl: 'D',
    legend: 'A research lab explains its work through light, refraction and one patient demo.', headline: 'A Research Lab Explained Through Light', body: 'Each study is a lens. Visitors choose how closely to look.' },
  { slug: 'atelier-des-songes', title: 'Atelier des Songes', type: 'Web Experience', tags: 'Design, Experience', img: ['pk', 'pg'], tpl: 'A',
    legend: 'A dreamlike perfumery site where each fragrance becomes a room with its own weather.', headline: 'Rooms of Scent with Their Own Weather', body: 'Violet liquids, soft sound and slow transitions.' },
  { slug: 'auren-timepieces-24', title: 'Auren Timepieces 24', type: 'Web Experience', tags: 'Design, Experience', img: ['pb', 'pl'], tpl: 'B',
    legend: 'A showcase of Auren’s new timepieces, built around glass, metal and a single shared light.', headline: 'Presenting the New Timepieces in One Light', body: 'Every watch is lit by the same lamp so the pieces can be compared honestly.' },
  { slug: 'vauclair-reliquary', title: 'Vauclair Reliquary', type: 'Web Experience', tags: 'Design, Experience', img: ['pl', 'pk'], tpl: 'C',
    legend: 'An interactive reliquary for Vauclair, opening one hidden compartment at a time.', headline: 'A Reliquary That Opens One Secret at a Time', body: 'Drawers, hinges and a patient cursor.' },
  { slug: 'halden', title: 'Halden', type: 'Web Experience', tags: 'Design, Experience', img: ['pf', 'pj'], tpl: 'D',
    legend: 'Halden’s brand world, a luminous bloom that opens as you scroll toward it.', headline: 'A Luminous Bloom Opening as You Scroll', body: 'One object, one light, one idea.' },
  { slug: 'noctua', title: 'Noctua', type: 'Web Experience', tags: 'Design, Experience', img: ['pi', 'pf'], tpl: 'A', legend: 'A night-time companion app presented as a quiet, glowing room.', headline: 'A Quiet Room That Glows After Dark', body: 'Low light, soft type, slow motion.' },
  { slug: 'solenne-parfums', title: 'Solenne Parfums', type: 'E-Shop', tags: 'Design, E-Commerce', img: ['pk', 'pd'], tpl: 'B', legend: 'A perfume shop that treats every bottle as a small sculpture.', headline: 'Bottles Treated as Sculpture', body: 'Caustic light, calm checkout.' },
];

export const homeProjects = projects.slice(0, 10);
export const bySlug = (s) => projects.find((p) => p.slug === s);
