# Flappy Rio

> **Live:** [flappy.cyrino.dev](https://flappy.cyrino.dev)

A Rio-themed browser game inspired by Flappy Bird. You guide a blue macaw through moving pipe gaps over a hand-drawn Rio scene with mountains, ocean, palm trees, and a cable car. Built with TypeScript + HTML5 Canvas + Vite, packaged as a PWA, and deployed as a tiny nginx Docker container.

## Features

- **One-button gameplay.** Press Space / Enter / click on desktop, or tap on touch devices.
- **Rio visual theme.** Custom canvas drawings for the blue macaw, mountains, ocean, palm trees, ground, clouds, and bondinho.
- **Responsive canvas.** The game fills the viewport and scales cleanly with device pixel ratio.
- **Mobile-aware controls.** Touch devices get tap-focused start and flap instructions.
- **Pause support.** Press `P` or `Esc` on desktop to pause/resume.
- **High score persistence.** Best score is stored locally in `localStorage`.
- **PWA build.** Static production build served through nginx with PWA-aware cache headers.
- **Docker deployment.** Multi-stage Docker image: `node:20-alpine` builder into `nginx:alpine` runtime.

## Controls

| Action | Desktop | Touch |
|---|---|---|
| Start / Flap / Restart | Space / Enter / Click | Tap |
| Pause / Resume | P or Esc | N/A |

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Language | TypeScript | safer game-state and canvas code |
| Build | Vite | fast local dev and small static output |
| Rendering | Canvas 2D | perfect fit for a simple arcade loop |
| Framework | none | the game loop owns rendering and timing directly |
| PWA | vite-plugin-pwa | service worker and installable app support |
| Production server | nginx:alpine | small static-file runtime |
| Reverse proxy / TLS | caddy-docker-proxy | label-driven routing and automatic HTTPS |

No backend. Gameplay and high scores run entirely in the browser.

## Project structure

```text
.
├── src/
│   ├── main.ts             game loop, input, physics, collision, scoring, draw orchestration
│   ├── types.ts            shared State, Pipe, and BondinhoLine types
│   └── portinari.ts        canvas drawing functions for the Rio-themed visuals
├── public/
│   └── favicon.svg
├── index.html              app shell with the game canvas
├── nginx.conf              static/PWA cache headers for production
├── Dockerfile              multi-stage Node build into nginx runtime
├── docker-compose.yml      production compose file for the droplet
├── vite.config.ts          Vite + PWA configuration
└── .github/workflows/production.yml
```

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy

Production deploy is automated from GitHub Actions on pushes to `main`:

1. Build the Docker image.
2. Push it to GitHub Container Registry.
3. Ensure `/opt/flappy` exists on the droplet.
4. Copy `docker-compose.yml` to the droplet.
5. Write `/opt/flappy/.env` with the new image tag.
6. Pull and restart the `flappy` service.
7. Health-check through Caddy using `Host: flappy.cyrino.dev`.
8. Roll back to the previous image if the health check fails.

The container joins the shared `proxy` Docker network. Caddy reads the compose labels and routes `flappy.cyrino.dev` to the nginx container with automatic HTTPS.

## License

MIT — fork it, mod it, ship it.
