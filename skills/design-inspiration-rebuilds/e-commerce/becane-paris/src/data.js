// Fictional product list. Each product has two poses: p01a/p01b ... (see images.json).
export const products = [
  'Ash coat', 'Moss cargo', 'Ember bomber', 'Denim shell', 'Cream knit',
  'Slate hoodie', 'Rain trench', 'Sand utility', 'Night biker', 'Ice denim',
].map((name, i) => ({
  name,
  a: `./img/p${String(i + 1).padStart(2, '0')}a.webp`,
  b: `./img/p${String(i + 1).padStart(2, '0')}b.webp`,
}));
