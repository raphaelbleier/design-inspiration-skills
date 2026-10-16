// Fictional catalogue. Every project has one cover image: public/img/p-<slug>.webp (see images.json).
export const projects = [
  ['Salt Cathedral', 'Maison Aurelle', 2026, 'Concept, Direction, Editing'],
  ['Glass Hour', 'Verre Noir Watches', 2026, 'Concept, Storyboarding, Direction, Production'],
  ['Second Skin', 'Solenne Skincare', 2026, 'Direction, Production, Colour'],
  ['Paper Tigers', 'Verre Noir x Lio Marchetti', 2026, 'Concept, Direction, Sound Design'],
  ['Night Tide', 'Verre Noir Watches', 2025, 'Storyboarding, Production, Editing'],
  ['The Long Pour', 'Brasserie Haut-Pont', 2025, 'Concept, Direction, Production'],
  ['Copper Season', 'Parfums Vellane', 2025, 'Direction, Production'],
  ['Open Throttle', 'Verre Noir x Orbis Motors', 2025, 'Direction, Sound Design, Editing'],
  ['Quiet Machines', 'Verre Noir Watches', 2024, 'Concept, Direction, Production'],
  ['Meridian', 'Orbis Motors', 2024, 'Direction, Production, Colour'],
  ['Small Fires', 'Maison Aurelle', 2023, 'Concept, Direction, Editing'],
  ['Spinning Coins', 'Henri Valcourt', 2020, 'Direction, Editing'],
].map(([title, client, year, role], i) => ({
  i, title, client, year, role, slug: title.toLowerCase().replace(/[^a-z]+/g, '-'),
  img: `./img/p-${title.toLowerCase().replace(/[^a-z]+/g, '-')}.webp`,
  n: String(i + 1).padStart(2, '0'),
}));
// The hero slider shows the first 7 projects.
export const slides = projects.slice(0, 7);
