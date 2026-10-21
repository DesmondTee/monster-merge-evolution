# Monster Merge Evolution

An original pixel-art monster merging puzzle game for HTML5 platforms. **Milestone 3** adds a three-second overflow countdown, game over with final and saved best scores, Play Again without refreshing, a next-monster preview, pause/resume, and optional original synthesized sound. Ten original creatures merge through chain reactions.

## Run locally

Use **Node.js 24 LTS** (see `.nvmrc`) and npm.

```sh
npm ci
npm run dev
```

Move the mouse to aim and click inside the hatchery to drop. On touch screens, tap the desired horizontal position. Drops have a 300 ms cooldown and randomly select one of the first three levels. Two matching monsters merge at their midpoint into the next level. Newly evolved monsters can immediately join later collision steps for chain reactions. The final level stays in the hatchery without merging further.

**Play Again** and **Reset hatchery** start a fresh session and clears the current score while keeping the best score. The best score is stored under `monster-merge-evolution.best-score` in LocalStorage. If storage is blocked or full, gameplay continues and the best score remains available for the current page session.

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

React 19 owns page UI, scores, warnings, pause/game-over overlays, restart, and mounting. Phaser 3 owns gameplay and its bundled Matter.js engine. The responsive hatchery keeps its **360 × 640** logical dimensions, `FIT` scaling, mouse/touch input, circular bodies, sleeping, walls, and floor.

- `src/game/monsters.ts`: creature definitions and initial drop pool.
- `src/game/merging.ts`: pure merge eligibility, score calculation, and collision reservation queue.
- `src/game/scenes/GameScene.ts`: collision subscriptions, spawning, body lifecycle, and gameplay score callbacks.
- `src/game/art/monsterPixels.ts` and `createMonsterTextures.ts`: deterministic original art and Phaser texture generation.
- `src/game/art/evolutionEffect.ts`: eight pixel particles and floating points per merge; at most six simultaneous effects.
- `src/game/session.ts`: overflow countdown, falling-drop eligibility, pause and drop cooldown.
- `src/game/sound.ts`: optional short synthesized tones and audio cleanup.
- `src/game/scoring.ts`: guarded best-score persistence and malformed-value recovery.
- `src/components/ScoreBoard.tsx` and `GameCanvas.tsx`: React score display, storage, and Phaser lifecycle.

Both `collisionstart` and `collisionactive` feed the same queue. A valid pair reserves both body IDs immediately, so reversed pairs and collisions that share a body cannot merge it twice. Matter bodies are removed and newborns added in `afterupdate`, after collision iteration and resolution. Consumed IDs are forgotten before newborns register, preventing stale contacts from awarding extra points. New bodies participate in following physics steps, including contacts with resting creatures.

`GameCanvas` lazily imports Phaser and cancels pending initialization on unmount. Cleanup detaches the canvas and destroys Phaser, including during StrictMode and resets. Shutdown removes input and physics listeners and clears scene-owned registries. Effects are short-lived scene objects and tweens, without extra timers or animation loops.

## Validation and limits

The 37 tests cover rules, artwork, scoring/storage recovery, merge reservations, and integration with Phaser's bundled Matter engine. New tests exercise three-second overflow detection, countdown clearing, falling-drop immunity, pause/resume timing, rapid taps, immediate tap positioning, bounded spawning, queue advancement, game-over input blocking, repeated scene shutdown/recreation, listener cleanup, and sound preference retention. A 64-body chain runs through six generations and 600 extra physics steps, checking finite positions and duplicate-free scoring/removal.

- Overflow uses the top of each body's circle. Player drops are ignored until they pass fully below the danger line or rest on a high pile (at least 350 ms old and 250 ms continuously moving slower than 1 Matter speed unit). Once eligible, bouncing cannot renew immunity. Evolved bodies are eligible immediately. The pile must stay above the line for three continuous seconds; clearing the line resets the timer.
- Pause freezes physics, effects, drop cooldown and countdown. Losing browser focus also pauses; players explicitly resume. Game over freezes the simulation and rejects drops.
- The upcoming creature appears beside the aiming preview and in the status text. Touch drops use pointer-down coordinates immediately, with a 300 ms cooldown and radius-aware containment, including larger evolved bodies near walls or the floor.
- Sound uses short original square-wave tones. The sound setting survives restarts for the current page session. Restart destroys the old Phaser instance, detaches its canvas, and preserves the saved best score.
- The 100-body cap bounds physics work; it blocks drops until a merge frees capacity. Overflow remains the loss condition.
- Browser smoke checks verify rendered controls, pause/resume, reset and a single canvas after reset. Physical mobile-device and audible speaker testing remain pending; responsive CSS, touch scrolling prevention on the canvas, and 44 px control targets are included.
- Phaser's separate lazy-loaded engine chunk exceeds Vite's 500 kB advisory threshold; the production build succeeds.

## Public repository scope and workflow

This repository contains game source, configuration, documentation, and the npm lockfile. It includes no proprietary artwork, copyrighted character designs, advertising SDKs, monetization integrations, credentials, or secrets. Dependencies retain their respective licenses; no project license has been selected yet.

Implementation branch: `codex/game-over-and-polish`. Target branch: `main`. See `docs/pull-request.md` for the milestone PR description. Do not merge directly into the default branch.
