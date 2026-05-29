/* ============ AURORA · Yuvadeep portfolio ============ */

// Year
document.getElementById('yr').textContent = new Date().getFullYear();

// Theme toggle
const themeBtn = document.getElementById('theme-toggle');
const root = document.documentElement;
if (localStorage.getItem('theme') === 'light') root.classList.add('light');
themeBtn.addEventListener('click', () => {
  root.classList.toggle('light');
  localStorage.setItem('theme', root.classList.contains('light') ? 'light' : 'dark');
});

// Custom cursor
const dot = document.querySelector('.cursor-dot');
const ring = document.querySelector('.cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;
window.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  dot.style.left = mx + 'px'; dot.style.top = my + 'px';
});
function followRing() {
  rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
  ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
  requestAnimationFrame(followRing);
}
followRing();
document.querySelectorAll('a,button,.cell,.proj').forEach(el => {
  el.addEventListener('mouseenter', () => ring.classList.add('hover'));
  el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
});

// Project hover gradient
document.querySelectorAll('.proj').forEach(p => {
  p.addEventListener('mousemove', e => {
    const r = p.getBoundingClientRect();
    p.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
    p.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
  });
});

// Reveal on scroll
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
}, { threshold: 0.12 });
document.querySelectorAll('.section, .paper, .proj, .edu-item, .bars li, .meta-strip div').forEach(el => {
  el.classList.add('reveal'); io.observe(el);
});

// Skill bars
document.querySelectorAll('.bars li').forEach(li => {
  li.style.setProperty('--lvl', li.dataset.level + '%');
  const s = li.querySelector('span');
  s.insertAdjacentHTML('beforeend', `<em style="font-style:normal;color:var(--muted)">${li.dataset.level}%</em>`);
});

/* ============ Particle background ============ */
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let w, h, particles;
function resize() {
  w = canvas.width = innerWidth;
  h = canvas.height = innerHeight;
  const count = Math.min(90, Math.floor(w * h / 18000));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * w, y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
    r: Math.random() * 1.6 + 0.4,
  }));
}
resize();
window.addEventListener('resize', resize);
function tick() {
  ctx.clearRect(0, 0, w, h);
  const accent = getComputedStyle(root).getPropertyValue('--accent').trim() || '#a8ff60';
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > w) p.vx *= -1;
    if (p.y < 0 || p.y > h) p.vy *= -1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = accent;
    ctx.globalAlpha = 0.5;
    ctx.fill();
  });
  // connect close
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i], b = particles[j];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < 120) {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = accent;
        ctx.globalAlpha = (1 - d / 120) * 0.15;
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(tick);
}
tick();

/* ============ Tic-Tac-Toe with minimax ============ */
const board = Array(9).fill('');
const cells = document.querySelectorAll('.cell');
const statusEl = document.getElementById('status');
let lock = false;
const scores = { x: 0, o: 0, d: 0 };

const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function winner(b) {
  for (const [a,c,d] of lines) if (b[a] && b[a] === b[c] && b[a] === b[d]) return { p: b[a], line: [a,c,d] };
  if (b.every(v => v)) return { p: 'draw' };
  return null;
}
function minimax(b, player) {
  const w = winner(b);
  if (w) {
    if (w.p === 'O') return { score: 10 };
    if (w.p === 'X') return { score: -10 };
    return { score: 0 };
  }
  const moves = [];
  for (let i = 0; i < 9; i++) {
    if (!b[i]) {
      b[i] = player;
      const result = minimax(b, player === 'O' ? 'X' : 'O');
      moves.push({ i, score: result.score });
      b[i] = '';
    }
  }
  if (player === 'O') return moves.reduce((a,b) => a.score > b.score ? a : b);
  return moves.reduce((a,b) => a.score < b.score ? a : b);
}
function render(winLine = []) {
  cells.forEach((c, i) => {
    c.textContent = board[i];
    c.classList.toggle('x', board[i] === 'X');
    c.classList.toggle('o', board[i] === 'O');
    c.classList.toggle('win', winLine.includes(i));
  });
}
function updateScore() {
  document.getElementById('sx').textContent = scores.x;
  document.getElementById('so').textContent = scores.o;
  document.getElementById('sd').textContent = scores.d;
}
function endCheck() {
  const w = winner(board);
  if (!w) return false;
  lock = true;
  if (w.p === 'X') { statusEl.textContent = 'You win! ✦ (impossible??)'; scores.x++; render(w.line); }
  else if (w.p === 'O') { statusEl.textContent = 'AI wins. Try again.'; scores.o++; render(w.line); }
  else { statusEl.textContent = "Draw — well played."; scores.d++; }
  updateScore();
  return true;
}
cells.forEach(cell => {
  cell.addEventListener('click', () => {
    const i = +cell.dataset.i;
    if (lock || board[i]) return;
    board[i] = 'X'; render();
    if (endCheck()) return;
    statusEl.textContent = 'AI thinking…';
    setTimeout(() => {
      const best = minimax([...board], 'O');
      board[best.i] = 'O'; render();
      if (!endCheck()) statusEl.textContent = 'Your turn (X)';
    }, 280);
  });
});
document.getElementById('reset').addEventListener('click', () => {
  for (let i = 0; i < 9; i++) board[i] = '';
  lock = false;
  render();
  statusEl.textContent = 'Your turn (X)';
});