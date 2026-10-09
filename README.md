# 🐤 Flappy Bird Clone

> The classic one-tap arcade game — rebuilt from scratch in vanilla JavaScript. How many pipes can YOU clear?

A complete, playable Flappy Bird clone with buttery physics, escalating difficulty, a persistent best score, particle effects, and retro beep-boop sound effects generated live in code. Zero dependencies, zero assets — everything is drawn on an HTML5 canvas.

## ✨ Features

- **Real game physics** — gravity, flap impulse, terminal velocity, and velocity-based bird tilt
- **Escalating difficulty** — pipes speed up and gaps shrink as your score climbs
- **Persistent best score** — saved in `localStorage`, survives reloads
- **Day-to-dusk sky** — the sky subtly shifts color as you rack up points
- **Juice everywhere** — flap feather particles, crash puffs, score sparkles, drifting clouds, parallax ground stripes
- **WebAudio sound effects** — flap, point, and crash sounds synthesized in code (no audio files)
- **Three game states** — animated start screen, live gameplay, game-over card with "New best!" callout
- **Mobile-ready** — tap controls, responsive layout, no zoom jank

## 🎮 Demo

Open `index.html` and you'll see the bird hovering under a "Get ready!" card:

- **Flap:** press `Space`, click, or tap the screen
- **Goal:** thread the bird through as many pipe gaps as you can
- **Game over:** hit a pipe, the ceiling, or the ground — then mash "Play again"
- **Beat your best:** your top score is saved in the browser and shown in the HUD

## 🚀 Run it in 30 seconds

1. Download or clone this repo
2. Open `index.html` in any modern browser
3. Press `Space` and start flapping

No server, no build tools, no npm. Just open and play.

## 🧠 What was practiced

- The `requestAnimationFrame` game loop and frame-based timing
- Canvas 2D drawing: gradients, ellipses, rotation, transparency
- Simple physics: velocity, gravity, and collision (circle-vs-rectangle)
- Game state machines (`ready` → `playing` → `over`)
- `localStorage` for persistence
- The Web Audio API for procedural sound effects
- Particle systems and parallax backgrounds

## 📁 Files

| File | What it does |
|------|--------------|
| `index.html` | Page structure, canvas, HUD, overlay screens |
| `style.css` | Layout, canvas styling, overlay cards |
| `game.js` | The entire game: physics, pipes, particles, audio, input |
| `README.md` | You are here 👋 |

---

*Day 14 (featured build) of my daily coding journey — one project a day, every day.* 🚀
