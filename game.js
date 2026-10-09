// ============================================================
// Day 14 (featured) · Flappy Bird Clone
// A complete canvas game: gravity physics, pipes, scoring,
// persistent best score, particles, and WebAudio sound effects.
// ============================================================

// --- Setup ---------------------------------------------------
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const W = canvas.width;          // 420
const H = canvas.height;         // 560
const GROUND_H = 70;             // ground strip height at the bottom

// --- Game states: "ready" → "playing" → "over" ---------------
let state = "ready";
let score = 0;
let best = Number(localStorage.getItem("flappy-best") || 0);
let frame = 0;                   // global tick counter (drives difficulty + animations)

const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const overlay = document.getElementById("overlay");
const startScreen = document.getElementById("start-screen");
const overScreen = document.getElementById("over-screen");
const finalScoreEl = document.getElementById("final-score");
const newBestEl = document.getElementById("new-best");
bestEl.textContent = best;

// --- The bird ------------------------------------------------
const bird = {
  x: W * 0.32,
  y: H * 0.45,
  r: 14,              // radius
  vy: 0,              // vertical velocity
  gravity: 0.42,
  flapPower: -7.6,    // negative = upward
  rot: 0,             // tilt angle (follows velocity for juice)

  flap() {
    this.vy = this.flapPower;
    sfx.flap();
    // little burst of feathers on every flap
    for (let i = 0; i < 6; i++) spawnParticle(this.x, this.y, "#ffd76a");
  },

  update() {
    this.vy += this.gravity;
    this.vy = Math.min(this.vy, 12);   // terminal velocity
    this.y += this.vy;
    // tilt nose down when falling, up when flapping
    this.rot = Math.max(-0.45, Math.min(1.2, this.vy * 0.09));
  },

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);

    // body
    ctx.fillStyle = "#ffcf3f";
    ctx.beginPath();
    ctx.arc(0, 0, this.r, 0, Math.PI * 2);
    ctx.fill();

    // wing (flaps with a sine wave)
    const wingY = Math.sin(frame * 0.5) * 4;
    ctx.fillStyle = "#f0a500";
    ctx.beginPath();
    ctx.ellipse(-4, 4 + wingY, 8, 5, -0.4, 0, Math.PI * 2);
    ctx.fill();

    // eye
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(5, -5, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(6.5, -5, 2.4, 0, Math.PI * 2);
    ctx.fill();

    // beak
    ctx.fillStyle = "#ff7b2e";
    ctx.beginPath();
    ctx.moveTo(12, -1);
    ctx.lineTo(20, 2);
    ctx.lineTo(12, 5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  },
};

// --- Pipes ---------------------------------------------------
const pipes = [];                  // each pipe: { x, gapY, gapH, scored }
const PIPE_W = 64;
const PIPE_SPACING = 150;          // horizontal distance between pipes
let pipeSpeed = 2.2;

function spawnPipe() {
  // gap shrinks slightly as the game goes on (difficulty ramp)
  const gapH = Math.max(118, 168 - score * 3);
  const margin = 70;               // keep the gap away from ceiling/ground
  const gapY = margin + Math.random() * (H - GROUND_H - margin * 2 - gapH) + gapH / 2;
  pipes.push({ x: W + 20, gapY, gapH, scored: false });
}

function updatePipes() {
  pipeSpeed = 2.2 + Math.min(1.8, score * 0.12);  // gets faster as you score
  for (const p of pipes) p.x -= pipeSpeed;

  if (pipes.length === 0 || pipes[pipes.length - 1].x < W - PIPE_SPACING) {
    spawnPipe();
  }
  if (pipes[0].x + PIPE_W < 0) pipes.shift();  // drop off-screen pipes

  for (const p of pipes) {
    // score once the bird fully passes the pipe
    if (!p.scored && p.x + PIPE_W < bird.x - bird.r) {
      p.scored = true;
      score++;
      scoreEl.textContent = score;
      sfx.point();
    }
  }
}

function drawPipes() {
  for (const p of pipes) {
    const topH = p.gapY - p.gapH / 2;
    const botY = p.gapY + p.gapH / 2;
    drawPipeSegment(p.x, 0, PIPE_W, topH, true);
    drawPipeSegment(p.x, botY, PIPE_W, H - GROUND_H - botY, false);
  }
}

function drawPipeSegment(x, y, w, h, isTop) {
  const grad = ctx.createLinearGradient(x, 0, x + w, 0);
  grad.addColorStop(0, "#2e8b3a");
  grad.addColorStop(0.5, "#54d364");
  grad.addColorStop(1, "#1f6b2c");
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);
  // cap lip on the end facing the gap
  ctx.fillStyle = "#1a5c26";
  if (isTop) ctx.fillRect(x - 3, y + h - 14, w + 6, 14);
  else ctx.fillRect(x - 3, y, w + 6, 14);
}

// --- Particles (flap feathers, score sparkles, crash puffs) --
const particles = [];
function spawnParticle(x, y, color) {
  particles.push({
    x, y,
    vx: (Math.random() - 0.5) * 3,
    vy: (Math.random() - 0.5) * 3 - 1,
    life: 26 + Math.random() * 14,
    color,
  });
}
function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.life--;
    if (p.life <= 0) particles.splice(i, 1);
  }
}
function drawParticles() {
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, p.life / 40);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
  }
  ctx.globalAlpha = 1;
}

// --- Sound effects via WebAudio (no audio files needed) ------
const sfx = {
  ctx: null,
  ensure() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state === "suspended") this.ctx.resume();
  },
  beep(freq, dur, type = "sine", vol = 0.15) {
    this.ensure();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + dur);
  },
  flap()  { this.beep(520, 0.09, "square", 0.06); },
  point() { this.beep(880, 0.12, "sine", 0.12); setTimeout(() => this.beep(1320, 0.14, "sine", 0.12), 70); },
  hit()   { this.beep(160, 0.3, "sawtooth", 0.14); },
};

// --- Collision ------------------------------------------------
function hitSomething() {
  // ceiling / ground
  if (bird.y - bird.r < 0 || bird.y + bird.r > H - GROUND_H) return true;
  // pipes: circle-vs-rectangle on each pipe segment
  for (const p of pipes) {
    const inX = bird.x + bird.r > p.x && bird.x - bird.r < p.x + PIPE_W;
    if (!inX) continue;
    const topH = p.gapY - p.gapH / 2;
    const botY = p.gapY + p.gapH / 2;
    if (bird.y - bird.r < topH || bird.y + bird.r > botY) return true;
  }
  return false;
}

// --- Background (parallax sky, clouds, ground, day cycle) ----
function drawBackground() {
  // the sky subtly shifts color with the score (day → dusk)
  const t = Math.min(1, score / 25);
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, `rgb(${112 - t * 40}, ${197 - t * 90}, ${240 - t * 120})`);
  sky.addColorStop(1, `rgb(${200 - t * 60}, ${235 - t * 60}, ${250 - t * 80})`);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // drifting clouds (positions loop with the frame counter)
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  for (let i = 0; i < 4; i++) {
    const cx = ((i * 170 - frame * 0.4) % (W + 160) + W + 160) % (W + 160) - 80;
    const cy = 70 + i * 55;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 34, 16, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 22, cy + 4, 24, 12, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // ground strip with moving stripes
  ctx.fillStyle = "#d9a05b";
  ctx.fillRect(0, H - GROUND_H, W, GROUND_H);
  ctx.fillStyle = "#b97f3e";
  const off = (frame * pipeSpeed) % 36;
  for (let x = -off; x < W; x += 36) ctx.fillRect(x, H - GROUND_H, 18, GROUND_H);
  ctx.fillStyle = "#7ec850";
  ctx.fillRect(0, H - GROUND_H, W, 12);
}

// --- Scoreboard drawn on the canvas ---------------------------
function drawScore() {
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "rgba(0,0,0,0.5)";
  ctx.lineWidth = 5;
  ctx.font = "bold 46px 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.strokeText(score, W / 2, 78);
  ctx.fillText(score, W / 2, 78);
}

// --- Main loop ------------------------------------------------
function loop() {
  frame++;
  drawBackground();

  if (state === "ready") {
    bird.y = H * 0.45 + Math.sin(frame * 0.08) * 8;  // gentle hover
    bird.rot = 0;
    bird.draw();
  } else if (state === "playing") {
    bird.update();
    updatePipes();
    drawPipes();
    bird.draw();
    updateParticles();
    drawParticles();
    drawScore();
    if (hitSomething()) gameOver();
  } else { // "over": frozen scene behind the overlay
    drawPipes();
    bird.draw();
    drawScore();
  }

  requestAnimationFrame(loop);
}

// --- Game flow ------------------------------------------------
function startGame() {
  sfx.ensure();                      // unlock audio on a user gesture
  state = "playing";
  score = 0;
  scoreEl.textContent = 0;
  pipes.length = 0;
  particles.length = 0;
  bird.y = H * 0.45;
  bird.vy = 0;
  overlay.style.display = "none";
}

function gameOver() {
  state = "over";
  sfx.hit();
  for (let i = 0; i < 22; i++) spawnParticle(bird.x, bird.y, "#ffffff");
  const isBest = score > best;
  if (isBest) {
    best = score;
    localStorage.setItem("flappy-best", best);
    bestEl.textContent = best;
  }
  finalScoreEl.textContent = score;
  newBestEl.classList.toggle("hidden", !isBest);
  startScreen.classList.add("hidden");
  overScreen.classList.remove("hidden");
  overlay.style.display = "flex";
}

// --- Input: Space / click / tap --------------------------------
function press() {
  if (state === "ready") startGame();
  else if (state === "playing") bird.flap();
  // in "over" state, only the Play-again button restarts
}
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.code === "ArrowUp") {
    e.preventDefault();
    press();
  }
});
canvas.addEventListener("pointerdown", press);
document.getElementById("start-btn").addEventListener("click", startGame);
document.getElementById("restart-btn").addEventListener("click", startGame);

overlay.style.display = "flex";  // show the start screen on load
loop();
