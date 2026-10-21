# Monster Merge Evolution

An original pixel-art monster merging puzzle game for HTML5 platforms. **Milestone 4** adds a persistent monster encyclopedia, first-appearance discoveries, original creature lore and elemental identities, discovery sparkles, and three collection achievements. All ten evolution levels keep their existing order, art, sizes, and gameplay balance.

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
| 1 | Spriggle | Leaf green | 19 | 10 |
| 2 | Cindlet | Peach orange | 23 | 20 |
| 3 | Dewble | Sky blue | 27 | 40 |
| 4 | Pebblit | Sandstone | 31 | 80 |
| 5 | Mothbud | Orchid | 35 | 160 |
| 6 | Voltusk | Golden yellow | 39 | 320 |
| 7 | Coralune | Rose pink | 43 | 640 |
| 8 | Glacifin | Turquoise | 47 | 1,280 |
| 9 | Nocthorn | Violet | 51 | 2,560 |
| 10 | Solossus | Warm amber | 56 | Terminal level |

The game uses zero-based levels internally; points are `10 × 2^sourceLevel`. Original symmetric 24 × 24 pixel designs are generated from geometric silhouettes, appendages, highlights, and markings: shoots, ears, a water crest, crags, wings, zigzag horns, coral branches, fins, sweeping horns, and a crown with armor. Higher levels grow in size. No image downloads or external fonts are used.

## Monster collection and evolution discovery

Open **Encyclopedia** from the game toolbar to browse all ten levels. Discovered creatures show their original pixel sprites; unknown creatures show anonymous locked silhouettes. Select a discovered creature to read its name, level, element, visual traits, and short original lore. The progress meter shows your collection out of ten. Close the journal with **Close** or Escape. The modal keeps keyboard focus inside it and blocks background input. Opening fixes the background page in place; closing restores its styles and scroll position. The journal scrolls independently, accounts for viewport safe areas, and keeps its Close button visible.

A creature unlocks only when its physics body actually spawns from a drop or merge. Generating textures and showing aiming/upcoming previews never unlock creatures. First appearances enqueue a five-second **New Monster Discovered!** notice with the sprite, name, and subtle CSS pixel sparkles. Notices occupy a reserved space above the playfield, wrapping within narrow screens without covering controls or moving the canvas when a discovery arrives. Dismiss with the close button. Notices wait while the journal is open, do not steal focus, and never add physics bodies or collision handlers. Reduced-motion preferences disable the sparkle animation.

Achievements are **First Evolution** (an actual successful merge, including one into an already known creature), **Discover 5 Monsters**, and **Complete the Encyclopedia**. Each unlocks once and appears in the journal. Collection and achievement state survive game over, Play Again, Reset hatchery, and refresh. Scores and current physics bodies remain session-specific.

Collection saves use LocalStorage key `monster-merge-evolution.collection` with `{ version: 1, discovered: string[], achievements: string[] }`. Stable creature keys preserve discoveries independently of display names. Loading validates the version and arrays, removes duplicate/unknown IDs, and derives collection achievements from valid discoveries. Malformed or unsupported saves fall back to an empty collection; the next actual discovery writes a fresh valid save. Failed reads/writes never interrupt gameplay; discoveries remain in memory when storage is unavailable. Saves are browser/origin-local, with no account or cloud sync. Previous milestones did not store discovery history, so existing players begin collecting with their next real appearance.

The typed `GameBridge` carries appearance events from Phaser to React and journal-open commands back to the scene. Subscriptions clean up on shutdown/unmount; duplicate discoveries retain object identity to avoid save writes, notifications, or React updates. The bridge remembers journal state if opened before Phaser finishes loading. An independent journal pause lock freezes Matter, tweens, cooldown, and overflow timing. Closing restores the prior playing/paused/game-over state; losing browser focus during the journal keeps the game paused until explicitly resumed.

- `src/game/collection.ts`: immutable discovery transitions, achievements, validated versioned persistence.
- `src/game/events.ts`: typed React/Phaser bridge and subscription cleanup.
- `src/components/Encyclopedia.tsx`: responsive journal, progress, details, and achievements.
- `src/components/MonsterSprite.tsx`: cached sprites and silhouettes from the same procedural pixel matrix/palette as Phaser.
- `src/components/DiscoveryNotice.tsx`: dismissible queued notice with cleaned-up timer.

New automated coverage includes first-time/duplicate discoveries, collection counts, all achievement thresholds, merge-versus-drop semantics, versioned round trips, malformed/unsupported saves, unknown/duplicate IDs, denied/quota-exhausted storage, game-over/restart persistence, real scene appearance events, texture/preview exclusion, journal pause ownership, input/clock blocking, focus-loss behavior, pre-initialization journal state, and subscription cleanup. Browser smoke checks cover initial locks, real drop/merge discovery, details selection, achievement display, journal close/Escape, manual pause preservation, reset, and refresh persistence. Responsive browser checks include 320 × 568 portrait and 568 × 320 landscape, independent journal scrolling, background scroll locking, exact scroll restoration, and notification bounds without playfield overlap. Physical mobile-device checks remain pending.

## Architecture

React 19 owns page UI, scores, warnings, pause/game-over overlays, restart, encyclopedia, discovery notifications, achievements, and mounting. Phaser 3 owns gameplay and its bundled Matter.js engine. The responsive hatchery keeps its **360 × 640** logical dimensions, `FIT` scaling, mouse/touch input, circular bodies, sleeping, walls, and floor.

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

The 61 tests cover rules, artwork, scoring/storage recovery, merge reservations, and integration with Phaser's bundled Matter engine. New tests exercise three-second overflow detection, countdown clearing, falling-drop immunity, pause/resume timing, rapid taps, immediate tap positioning, bounded spawning, queue advancement, game-over input blocking, repeated scene shutdown/recreation, listener cleanup, and sound preference retention. A 64-body chain runs through six generations and 600 extra physics steps, checking finite positions and duplicate-free scoring/removal.

- Overflow uses the top of each body's circle. Player drops are ignored until they pass fully below the danger line or rest on a high pile (at least 350 ms old and 250 ms continuously moving slower than 1 Matter speed unit). Once eligible, bouncing cannot renew immunity. Evolved bodies are eligible immediately. The pile must stay above the line for three continuous seconds; clearing the line resets the timer.
- Pause freezes physics, effects, drop cooldown and countdown. Losing browser focus also pauses; players explicitly resume. Game over freezes the simulation and rejects drops.
- The upcoming creature appears beside the aiming preview and in the status text. Touch drops use pointer-down coordinates immediately, with a 300 ms cooldown and radius-aware containment, including larger evolved bodies near walls or the floor.
- Sound uses short original square-wave tones. The sound setting survives restarts for the current page session. Restart destroys the old Phaser instance, detaches its canvas, and preserves the saved best score.
- The 100-body cap bounds physics work; it blocks drops until a merge frees capacity. Overflow remains the loss condition.
- Browser smoke checks verify rendered controls, pause/resume, reset and a single canvas after reset. Physical mobile-device and audible speaker testing remain pending; responsive CSS, touch scrolling prevention on the canvas, and 44 px control targets are included.
- Phaser's separate lazy-loaded engine chunk exceeds Vite's 500 kB advisory threshold; the production build succeeds.

## Public repository scope and workflow

This repository contains game source, configuration, documentation, and the npm lockfile. It includes no proprietary artwork, copyrighted character designs, advertising SDKs, monetization integrations, credentials, or secrets. Dependencies retain their respective licenses; no project license has been selected yet.

Implementation branch: `codex/monster-encyclopedia`. Target branch: `main`. See `docs/pull-request.md` for the milestone PR description. Do not merge directly into the default branch.

## Future creature art direction

A future art pass should give higher evolutions more distinctive body proportions and stronger silhouettes, including larger asymmetric appendages, horns, wings, and tails. Check designs at 24 × 24 pixels and as locked silhouettes; retain entirely original identities and review physics fit separately before changing collision sizes. Milestone 4 preserves the existing sprites and balance.
