# PR title

Add monster merging, ten evolution levels, scoring and chain reactions

## Description

Matching monsters now merge into the next evolution level at their midpoint. The hatchery has ten original procedurally generated pixel creatures with distinct silhouettes, colors, names, and increasing sizes. Drops use the first three levels; the tenth is terminal.

A pure merge queue reserves both collision bodies before processing. The scene removes bodies and creates evolved monsters after Matter finishes its physics update, rejecting duplicate, reversed, stale, and shared-body pairs. Newborn monsters can merge on subsequent physics steps for chain reactions. Each pair awards 10 × 2^sourceLevel points.

React displays current and best scores. Best scores persist in LocalStorage, with guarded reads/writes for malformed data or blocked storage. Reset clears the current session while retaining the best score. Lightweight pixel bursts and floating point labels accompany merges, with at most six simultaneous effects.

The existing responsive design, React/TypeScript/Phaser/Matter stack, and mouse/touch controls are preserved. Game-over detection remains deferred to Milestone 3. No external art assets, copyrighted characters, monetization, advertising, or secrets were added.

## Validation

- `npm run typecheck` — passed.
- `npm run lint` — passed.
- `npm test` — 23 tests passed across four files.
- `npm run build` — passed; existing Phaser engine chunk-size warning remains.
- Unit coverage: evolution catalogue and generated art, containment at all ten sizes, eligibility and scoring, repeated/reversed/shared/stale collisions, chains, and best-score persistence/failure recovery.
- Browser smoke check: rendering, aim/drop, collision evolution with a 40-point award, reset to zero, and best-score persistence after reload passed.
- Matter integration: actual scene merging with Phaser's bundled engine; verifies body removal, midpoint spawning and radii, rapid collision waves, chains including sleeping bodies, exact score totals, and terminal-level behavior.

## Known limits

Game-over detection is intentionally absent. The development cap remains 100 live monsters; merging frees capacity. Phaser's engine chunk exceeds the default 500 kB advisory threshold. Physical mobile-device testing remains pending.

## Branches

Base: `main`

Head: `codex/monster-merging-evolution`
