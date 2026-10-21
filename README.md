# Monster Merge Evolution

An original pixel-art-style monster merging puzzle game for HTML5 platforms. **Milestone 1** is a physics sandbox: drop Sprout, Ember, and Dew into a portrait hatchery and watch them fall, bounce, and collide. Merging, scoring, and game-over rules are intentionally deferred.

## Run locally

Use **Node.js 24 LTS** (see `.nvmrc`) and npm. This milestone was verified with Node.js 26.10.0 and npm 11.19.1.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Move the mouse to aim; click inside the hatchery to drop. On a touch screen, tap the desired horizontal position. Drops have a 450 ms cooldown. **Reset hatchery** destroys the current Phaser instance and starts a fresh session.

```sh
npm run typecheck   # Strict TypeScript checks
npm run lint        # Oxlint, including React hooks and explicit-any rules
npm test            # Vitest (single run)
npm run test:watch  # Vitest (watch mode)
npm run build       # Type checking and production bundle in dist/
npm run preview     # Serve the production bundle locally
npm run check       # All milestone checks
```

## Structure

```text
src/
  components/GameCanvas.tsx       React-owned Phaser lifecycle and reset UI
  game/
    createGame.ts                Phaser configuration and Matter.js physics
    rules.ts                     Logical dimensions, bounds, drop limits
    rules.test.ts                Body containment tests for every creature
    monsters.ts                  Typed original creature definitions
    art/createMonsterTextures.ts Programmatically drawn pixel textures
    scenes/GameScene.ts          World, aim preview, input, spawning
  App.tsx                        React page UI
  index.css                      Responsive page and canvas layout
```

React 19 owns page UI, reset, and mounting. Phaser 3 owns gameplay and its bundled Matter.js engine; no separate Matter package is required. Phaser uses a **360 × 640** logical play area with `FIT` scaling, pointer input for mouse/touch, circular physics bodies, sleeping bodies, static walls, and a floor. Textures are original 16 × 16 pixel designs generated in code, with no asset downloads or external fonts.

`GameCanvas` lazily imports Phaser and cancels pending initialization on unmount. Its cleanup detaches the canvas immediately and calls `game.destroy(true)`, including during React StrictMode, reset, and hot reload. Scene shutdown removes input listeners.

## Milestone limits and next steps

- **Merging:** add evolution tiers, collision-pair deduplication, safe body removal, and spawning the evolved creature after a collision.
- **Scoring:** award points for merges and communicate typed gameplay events to a React HUD; add persistence later if wanted.
- **Game over:** track settled bodies above the danger line with a grace period, then disable drops and display a React restart UI. The current line is visual only.
- The sandbox stops at 100 bodies to bound physics work. This is a development cap, not a loss condition. A filled pile can overlap newly spawned bodies until game-over detection exists.
- Keyboard gameplay, sound, localization, platform SDKs, and platform-specific packaging are deferred. Mouse and touch are supported; keyboard can operate the reset button.
- Phaser is loaded separately from the React entry bundle, but its engine chunk exceeds Vite's 500 kB warning threshold. The build succeeds; platform download budgets need review before distribution.

## Public repository scope

This repository contains game source, development configuration, documentation, and the npm lockfile. It includes no proprietary artwork, Pokémon/Digimon characters, advertising SDKs, monetization integrations, credentials, or secrets. `.env` files, dependencies, build output, logs, and local agent state are ignored. Third-party packages retain their respective licenses; no project license has been selected yet.

## Review workflow

Implementation branch: `codex/first-playable-milestone`. Target branch: `main`. See `docs/pull-request.md` for a prepared PR title, description, and validation checklist. Do not merge this milestone directly into the default branch.
