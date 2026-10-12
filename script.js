// Intro: a folded copy of the real letter slides out of the envelope and unfolds onto the page
const intro = document.getElementById('intro');
const envelope = document.getElementById('open');
const sheet = document.querySelector('.sheet');
const reveal = () => {
  intro.remove();
  document.documentElement.classList.remove('locked');
  document.body.classList.add('opened');
};

// n panels of W x H (sheet px), each a window on the next slice of the sheet.
// Appended in reverse so panel 0 paints on top: the others start folded behind it.
const fold = (W, H, n) => {
  const copy = sheet.cloneNode(true);
  copy.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
  copy.querySelectorAll('img').forEach(img => img.loading = 'eager');
  copy.classList.add('fold-copy');
  copy.style.width = `${W}px`;
  return Array.from({ length: n }, (_, i) => {
    const p = document.createElement('div'), slice = i ? copy.cloneNode(true) : copy;
    p.className = 'panel';
    p.style.cssText = `top:${i * H}px;width:${W}px;height:${H}px`;
    slice.style.top = `${-i * H}px`;
    p.append(slice);
    return p;
  });
};

if (matchMedia('(prefers-reduced-motion: reduce)').matches) reveal();
else envelope.addEventListener('click', () => {
  const E = envelope.getBoundingClientRect(), S = sheet.getBoundingClientRect();
  const W = S.width, full = innerHeight - S.top;           // the copy covers the sheet down to the screen bottom
  const k = E.width * .88 / W;                              // scale that fits it in the envelope
  const n = Math.max(1, Math.ceil(full * k / (E.height * .82)));
  const H = full / n;
  const left = E.width * .06, top = E.height * .94 - H * k;
  const panels = fold(W, H, n);
  const card = document.createElement('div');
  card.className = 'fold';
  card.inert = true;
  card.style.cssText = `left:${left}px;top:${top}px;width:${W}px;height:${H}px`;
  card.append(...[...panels].reverse());
  const folded = 'perspective(2500px) rotateX(-180deg)';
  panels.slice(1).forEach(p => p.style.transform = folded);
  envelope.append(card);
  intro.classList.add('open');

  const ease = 'cubic-bezier(.65, 0, .35, 1)';
  const at = (x, y, s) => `translate(${x}px, ${y}px) scale(${s})`;
  const lift = -(top + H * k) - E.height * .05;             // until the card fully clears the pocket
  card.animate([{ transform: at(0, 0, k) }, { transform: at(0, lift, k) }],
    { duration: 800, delay: 650, easing: ease, fill: 'both' })
    .finished.then(() => {
      card.style.zIndex = 6;
      intro.classList.add('zoom');
      const opts = { duration: 1200, easing: ease, fill: 'forwards' };
      // panels swing down one after another, overlapping a little so it reads as one motion
      const step = opts.duration / ((n - 2) * .8 + 1.4);     // last panel lands with the card
      panels.slice(1).forEach((p, i) => p.animate({ transform: [folded, 'perspective(2500px) rotateX(0deg)'] },
        { duration: step * 1.4, delay: i * step * .8, easing: 'cubic-bezier(.4, 0, .2, 1)', fill: 'forwards' }));
      return card.animate([{ transform: at(0, lift, k) }, { transform: at(S.left - E.left - left, S.top - E.top - top, 1) }], opts).finished;
    })
    .then(reveal);
}, { once: true });

// Photos and notes: reveal once
const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: .25 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Hug button: a few DOM hearts with CSS animation
document.getElementById('love').addEventListener('click', e => {
  for (let i = 0; i < 14; i++) {
    const h = document.createElement('span');
    const a = Math.random() * Math.PI * 2, d = 80 + Math.random() * 120;
    h.className = 'heart';
    h.textContent = '♥';
    h.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;font-size:${12 + Math.random() * 18}px;--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d - 60}px`;
    setTimeout(() => h.remove(), 1500);
    document.body.append(h);
  }
});
