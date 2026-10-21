# Monster Merge Evolution

An original pixel-art monster merging puzzle game for HTML5 platforms. **Milestone 2** adds ten evolution levels, collision-driven merging, chain reactions, score effects, and a React score display with a saved personal best. Game-over detection is reserved for Milestone 3; the danger line remains a visual guide.

## Run locally

Use **Node.js 24 LTS** (see `.nvmrc`) and npm.

```sh
npm ci
npm run dev
```

Move the mouse to aim and click inside the hatchery to drop. On touch screens, tap the desired horizontal position. Drops have a 450 ms cooldown and randomly select one of the first three levels. Two matching monsters merge at their midpoint into the next level. Newly evolved monsters can immediately join later collision steps for chain reactions. The final level stays in the hatchery without merging further.

**Reset hatchery** starts a fresh session and clears the current score while keeping the best score. The best score is stored under `monster-merge-evolution.best-score` in LocalStorage. If storage is blocked or full, gameplay continues and the best score remains available for the current page session.

```sh
npm run typecheck   # Strict TypeScript checks
npm run lint        # Oxlint, React hooks and explicit-any rules
npm test            # Vitest (single run)
npm run test:watch  # Vitest (watch mode)
npm run build       # Type checking and production bundle in dist/
npm run preview     # Serve the production bundle locally
npm run check       # All milestone checks
```

## Evolution and points

| Level | Creature | Color | Radius | Points for merging a pair |
| --- | --- | --- | --- | --- |
| 1 | Sprout | Leaf green | 19 | 10 |
| 2 | Ember | Peach orange | 23 | 20 |
| 3 | Dew | Sky blue | 27 | 40 |
| 4 | Pebblit | Sandstone | 31 | 80 |
| 5 | Mothbud | Orchid | 35 | 160 |
| 6 | Voltusk | Golden yellow | 39 | 320 |
| 7 | Coralune | Rose pink | 43 | 640 |
| 8 | Glacifin | Turquoise | 47 | 1,280 |
| 9 | Nocthorn | Violet | 51 | 2,560 |
| 10 | Solossus | Warm amber | 56 | Terminal level |

The game uses zero-based levels internally; points are `10 × 2^sourceLevel`. Original symmetric 24 × 24 pixel designs are generated from geometric silhouettes, appendages, highlights, and markings: shoots, ears, a water crest, crags, wings, zigzag horns, coral branches, fins, sweeping horns, and a crown with armor. Higher levels grow in size. No image downloads or external fonts are used.

## Architecture

React 19 owns page UI, scores, reset, and mounting. Phaser 3 owns gameplay and its bundled Matter.js engine. The responsive hatchery keeps its **360 × 640** logical dimensions, `FIT` scaling, mouse/touch input, circular bodies, sleeping, walls, and floor.

- `src/game/monsters.ts`: creature definitions and initial drop pool.
- `src/game/merging.ts`: pure merge eligibility, score calculation, and collision reservation queue.
- `src/game/scenes/GameScene.ts`: collision subscriptions, spawning, body lifecycle, and gameplay score callbacks.
- `src/game/art/monsterPixels.ts` and `createMonsterTextures.ts`: deterministic original art and Phaser texture generation.
- `src/game/art/evolutionEffect.ts`: eight pixel particles and floating points per merge; at most six simultaneous effects.
- `src/game/scoring.ts`: guarded best-score persistence and malformed-value recovery.
- `src/components/ScoreBoard.tsx` and `GameCanvas.tsx`: React score display, storage, and Phaser lifecycle.

Both `collisionstart` and `collisionactive` feed the same queue. A valid pair reserves both body IDs immediately, so reversed pairs and collisions that share a body cannot merge it twice. Matter bodies are removed and newborns added in `afterupdate`, after collision iteration and resolution. Consumed IDs are forgotten before newborns register, preventing stale contacts from awarding extra points. New bodies participate in following physics steps, including contacts with resting creatures.

`GameCanvas` lazily imports Phaser and cancels pending initialization on unmount. Cleanup detaches the canvas and destroys Phaser, including during StrictMode and resets. Shutdown removes input and physics listeners and clears scene-owned registries. Effects are short-lived scene objects and tweens, without extra timers or animation loops.

## Validation and limits

The 23 tests cover wall containment at every level, distinct deterministic sprites and catalogue entries, merge eligibility, all point values, duplicate/reversed/shared/stale pairs, rapid collisions, chains, and storage recovery. Integration tests run the actual scene merging methods against Phaser's bundled Matter engine, replacing only the image rendering facade and visual effects. They verify removal, midpoint spawning, physical radii, chained collisions, score totals, and final-level behavior.

- The hatchery pauses drops at 100 live bodies to bound physics work. Merging reduces that count and frees capacity. This is a development cap, not a loss condition. Piles can overlap the drop area until Milestone 3 adds game-over detection.
- Phaser is lazy-loaded separately from React, but its engine chunk exceeds Vite's 500 kB warning threshold. The production build succeeds.
- Physical mobile-device testing, keyboard gameplay, sound, localization, and platform packaging remain pending. Mouse/touch pointer input and the existing responsive CSS are preserved.

## Public repository scope and workflow

This repository contains game source, configuration, documentation, and the npm lockfile. It includes no proprietary artwork, copyrighted character designs, advertising SDKs, monetization integrations, credentials, or secrets. Dependencies retain their respective licenses; no project license has been selected yet.

Implementation branch: `codex/monster-merging-evolution`. Target branch: `main`. See `docs/pull-request.md` for the milestone PR description. Do not merge directly into the default branch.
