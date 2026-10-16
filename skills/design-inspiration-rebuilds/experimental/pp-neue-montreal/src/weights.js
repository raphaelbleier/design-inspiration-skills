// Technique: variable-font weight specimen. Hovering/clicking a weight name animates font-variation of the sample
// (Inter Tight wght axis 100-900, original used 11 static cuts). Display = tight tracking, Text = looser tracking.
const W = [['Hairline',100],['Extralight',200],['Thin',250],['Light',300],['Book',350],['Regular',400],['Medium',500],['Semibold',600],['Bold',700],['Extrabold',800],['Black',900]];
export function initWeights() {
  const list = document.querySelector('.wlist'), sample = document.getElementById('wsample');
  W.forEach(([n, w], i) => {
    const li = document.createElement('li'); li.textContent = n; li.style.fontWeight = w;
    const set = () => { sample.style.fontWeight = w; list.querySelectorAll('li').forEach((l) => l.classList.toggle('on', l === li)); };
    li.addEventListener('mouseenter', set); li.addEventListener('click', set);
    if (i === W.length - 1) li.classList.add('on');
    list.append(li);
  });
  document.querySelectorAll('.wcut button').forEach((b) => b.addEventListener('click', () => {
    document.querySelectorAll('.wcut button').forEach((x) => x.classList.toggle('on', x === b));
    sample.style.letterSpacing = b.dataset.cut === 'text' ? '-.02em' : '-.035em';
    sample.style.lineHeight = b.dataset.cut === 'text' ? '1.04' : '.96';
  }));
}
