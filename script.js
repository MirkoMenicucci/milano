// Hero title: handwritten letters appear one by one (after the envelope opens)
const title = document.querySelector('[data-split]');
title.innerHTML = [...title.textContent]
  .map((c, i) => `<span class="ch" style="animation-delay:${300 + i * 110}ms">${c}</span>`)
  .join('');

// Intro: open envelope on tap, then reveal the sheet
const intro = document.getElementById('intro');
const reveal = () => {
  intro.remove();
  document.documentElement.classList.remove('locked');
  document.body.classList.add('opened');
};
if (matchMedia('(prefers-reduced-motion: reduce)').matches) reveal();
else {
  document.getElementById('open').addEventListener('click', () => {
    intro.classList.add('open');
    intro.addEventListener('animationend', e => e.target === intro && reveal());
  }, { once: true });
}

// Letter: words get "inked" as they cross the middle of the screen
const letter = document.querySelector('[data-words]');
letter.innerHTML = letter.textContent.split(' ').map(w => `<span class="w">${w}</span>`).join(' ');
const wordIO = new IntersectionObserver(entries => entries.forEach(e => e.target.classList.toggle('on', e.isIntersecting || e.boundingClientRect.top < 0)),
  { rootMargin: '0px 0px -40% 0px' });
letter.querySelectorAll('.w').forEach(w => wordIO.observe(w));

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
