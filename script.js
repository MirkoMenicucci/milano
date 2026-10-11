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
// Locked until Sunday 18 Oct 2026, 00:00 local time. Add ?dev=1 to the URL to bypass.
// ponytail: client-side lock only, the letter is in the page source anyway.
const OPEN_AT = new Date(2026, 9, 18, 0, 0);
const isOpen = () => new URLSearchParams(location.search).get('dev') === '1' || Date.now() >= OPEN_AT;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const env = document.getElementById('open');
const tick = () => {
  if (isOpen()) {
    clearInterval(timer);
    intro.classList.remove('wait-mode');
    document.getElementById('wait').hidden = true;
    document.getElementById('hint').hidden = false;
    if (reduced) reveal();
    return;
  }
  const s = Math.floor((OPEN_AT - Date.now()) / 1000), p = n => String(n).padStart(2, '0');
  document.getElementById('countdown').textContent =
    `${Math.floor(s / 86400)}g ${p(Math.floor(s / 3600) % 24)}h ${p(Math.floor(s / 60) % 60)}m ${p(s % 60)}s`;
};
intro.classList.add('wait-mode');
document.getElementById('wait').hidden = false;
const timer = setInterval(tick, 1000);
tick();
env.addEventListener('click', () => {
  if (!isOpen()) {
    env.classList.remove('nope'); void env.offsetWidth; env.classList.add('nope');
    return;
  }
  if (intro.classList.contains('open')) return;
  intro.classList.add('open');
  intro.addEventListener('animationend', e => e.target === intro && reveal());
});

// Games to play while waiting
const dlg = document.getElementById('game'), board = document.getElementById('board');
const status = document.getElementById('game-status');
const say = t => status.textContent = t;
const games = {
  memory() {
    const pics = ['img/logo.png', 'img/lucas-francesca.jpg', 'img/denise.jpg', 'img/mirko-nicole.jpg'];
    const deck = [...pics, ...pics];
    for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; }
    let open = [], moves = 0, found = 0;
    say('Trova tutte le coppie!');
    deck.forEach(src => {
      const c = document.createElement('button');
      c.className = 'card';
      c.setAttribute('aria-label', 'Carta coperta');
      c.innerHTML = `<img src="${src}" alt="">`;
      c.onclick = () => {
        if (open.length === 2 || c.classList.contains('up')) return;
        c.classList.add('up');
        if (open.push(c) < 2) return;
        const [a, b] = open;
        moves++;
        if (a.innerHTML === b.innerHTML) {
          open = [];
          say(++found === pics.length ? `Bravi! Tutte le coppie in ${moves} mosse ♥` : `Mosse: ${moves}`);
        } else {
          say(`Mosse: ${moves}`);
          setTimeout(() => { a.classList.remove('up'); b.classList.remove('up'); open = []; }, 800);
        }
      };
      board.append(c);
    });
  },
  hearts() {
    let score = 0, left = 20;
    const show = () => say(`⏱ ${left}s · ♥ ${score}`);
    show();
    const spawn = setInterval(() => {
      const h = document.createElement('button');
      h.className = 'target';
      h.textContent = '♥';
      h.setAttribute('aria-label', 'Cuore');
      h.style.cssText = `left:${Math.random() * 85}%;top:${Math.random() * 82}%`;
      h.onpointerdown = () => { score++; show(); h.remove(); };
      board.append(h);
      setTimeout(() => h.remove(), 1100);
    }, 550);
    const clock = setInterval(() => {
      if (--left > 0) return show();
      end();
      say(`Tempo scaduto! Hai preso ${score} cuori ♥`);
    }, 1000);
    const end = () => { clearInterval(spawn); clearInterval(clock); board.replaceChildren(); };
    return end;
  },
};
const titles = { memory: 'Memory', hearts: 'Acchiappa i cuori' };
let current, stop = () => {};
const start = name => {
  stop();
  current = name;
  board.replaceChildren();
  board.className = `board ${name}`;
  document.getElementById('game-title').textContent = titles[name];
  stop = games[name]() || (() => {});
};
document.querySelectorAll('[data-game]').forEach(b => b.addEventListener('click', () => { start(b.dataset.game); dlg.showModal(); }));
document.getElementById('game-again').addEventListener('click', () => start(current));
document.getElementById('game-close').addEventListener('click', () => dlg.close());
dlg.addEventListener('close', () => stop());

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
