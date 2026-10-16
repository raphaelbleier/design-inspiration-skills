// Fictional artworks and owners. Image paths match images.json.
export const works = [
  { img: 'portrait-horse', title: 'The Dappled Mare', by: 'Aurel van Dorne', ar: '4/5' },
  { img: 'codex-figures', title: 'Three Stewards', by: 'Anonymous', ar: '3/4' },
  { img: 'mummy-portrait', title: 'Portrait with Gold Wreath', by: 'Unknown hand', ar: '1/1' },
  { img: 'herbal-folio', title: 'Folio of Herbs', by: 'Workshop of Ilse Brandt', ar: '3/4' },
  { img: 'tiger-snake', title: 'Tiger and Serpent', by: 'Lucien Marchetti', ar: '4/3' },
  { img: 'rococo-idyll', title: 'The Sleeping Nymph', by: 'Camille Fontaine', ar: '3/2' },
  { img: 'olive-grove', title: 'Olive Grove at Noon', by: 'Teodor Valk', ar: '3/4' },
  { img: 'pastoral-cattle', title: 'Cattle Under a High Sky', by: 'Pieter Vandermeer', ar: '3/2' },
  { img: 'still-life', title: 'Silver Ewer and Lemon', by: 'Hendrik Osk', ar: '4/5' },
  { img: 'harbour-dusk', title: 'Harbour at Dusk', by: 'Marta Linde', ar: '16/9' },
  { img: 'lady-blue', title: 'Lady in Blue', by: 'Giles Ashford', ar: '4/5' },
  { img: 'ink-landscape', title: 'Pavilion in Mist', by: 'Sung Reiko', ar: '2/3' },
  { img: 'sculpture-bust', title: 'Bust of a Young Man', by: 'Studio of Corvin', ar: '4/5' },
  { img: 'winter-skaters', title: 'Skaters on the Canal', by: 'Jan Verhoek', ar: '3/2' },
];
export const src = (w) => `./img/${w.img}.webp`;

// Four chapters: the chain of owners of one painting.
export const chapters = [
  { left: 'Baron Hastings', right: 'Charles Sedelmeyer', work: 0, meta: 'Acquired 1801, 3,200 guilders', tint: '#dbe2e9' },
  { left: 'Countess Vidal', right: 'Maison Lerois', work: 8, meta: 'Sold 1864, 11,500 francs', tint: '#e6dfd6' },
  { left: 'Sir Edmund Pryce', right: 'The Aldgate Trust', work: 10, meta: 'Bequeathed 1911', tint: '#d9e3dc' },
  { left: 'Halden Museum', right: 'Open collection', work: 4, meta: 'Accessioned 1976, gift', tint: '#e3dbe4' },
];
