# PR title

Build the first playable Monster Merge Evolution milestone

## Description

Create an original monster drop sandbox using React 19, strict TypeScript, Vite, and Phaser 3 with its bundled Matter.js engine. Players aim and drop three programmatically generated pixel creatures into a responsive 360 × 640 hatchery with walls, a floor, a visual danger line, and physical bounce/collision behavior.

React owns the surrounding UI and reset flow. The GameCanvas component cancels pending initialization and destroys Phaser on cleanup, including under StrictMode. Gameplay stays in GameScene; creature definitions, pixel textures, configuration, and drop rules are separate modules.

Includes a lockfile, Node version guidance, development scripts, Vitest containment tests, lint configuration, and documentation. No proprietary assets, secrets, advertising, or monetization code are included.

## Validation

- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`
- Browser smoke check: render, drop, collision/floor settling, reset

The production build warns about the size of Phaser's engine chunk. Real touch-device testing is still pending. Merging, scoring, and game-over detection are outside this milestone.

## Branches

Base: `main`

Head: `codex/first-playable-milestone`
