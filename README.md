# Monster Merge Evolution

An original pixel-art monster merging puzzle game built with React, TypeScript, Phaser 3, its bundled Matter.js engine, and Vite. **Milestone 5** adds rare color variants, separate collection progress, richer procedural creature art, and first-time rare discovery notifications.

## Run locally

Use Node.js 24 LTS (see `.nvmrc`) and npm.

```sh
npm ci
npm run dev
```

Move to aim and click inside the hatchery to drop. On touch screens, tap the desired horizontal position. Drops have a 300 ms cooldown and randomly select one of the first three levels. Matching monsters merge into the next level, including normal/rare pairs. Newborns can join chain reactions on later physics steps. The final level does not merge further.

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run preview
npm run check  # All four milestone checks
```

## Rare variants

Every accepted player drop independently has a **2%** chance of being rare. Change `RARE_DROP_CHANCE` in `src/game/variants.ts` for future balancing; `rollRare` also accepts a probability and random source for deterministic tests. Probabilities must be finite values between 0 and 1. Previews do not roll or unlock discoveries. Rarity is decided when a drop is accepted, so previews show the base palette.

All ten creatures have original alternate body, shadow, and highlight palettes. Rare bodies have small gold cross sparkles that follow their positions. A single bounded graphics layer draws these without adding physics bodies, timers, or collision handlers. Sparkles freeze while paused; reduced-motion preferences at scene creation use stationary marks. Encyclopedia sprites have a subtle glow, a text badge, and a star indicator.

**Inheritance: a merged creature is rare if either parent is rare.** Merges never reroll rarity. Both variants share their level, pixel geometry, collision radius, mass, friction, restitution, and points. Rarity remains separate from merge eligibility. There is no rare score multiplier.

## Evolution and points

| Level | Creature | Element | Radius | Pair merge points |
| --- | --- | --- | --- | --- |
| 1 | Spriggle | Grove | 19 | 10 |
| 2 | Cindlet | Ember | 23 | 20 |
| 3 | Dewble | Water | 27 | 40 |
| 4 | Pebblit | Stone | 31 | 80 |
| 5 | Mothbud | Bloom | 35 | 160 |
| 6 | Voltusk | Storm | 39 | 320 |
| 7 | Coralune | Tide | 43 | 640 |
| 8 | Glacifin | Frost | 47 | 1,280 |
| 9 | Nocthorn | Dusk | 51 | 2,560 |
| 10 | Solossus | Solar | 56 | Terminal |

Internal levels are zero-based; points remain `10 × 2^sourceLevel`. The original 24 × 24 procedural art now gives higher levels split petal wings, forked lightning horns, branching coral antlers, crystal fins and a tail, sweeping dusk horns and wings, and a three-point armored crown. Silhouettes remain readable at small sizes. Names, elements, lore, ordering, and collision sizes are preserved. React and Phaser render the same pixel matrix and palette. No image downloads or external fonts are used.

## Encyclopedia and discoveries

Open **Encyclopedia** to see **Normal x/10** and **Rare x/10**. Use the variant toggle to browse each collection independently. Undiscovered variants have locked silhouettes; discovered rare entries show **✦ RARE DISCOVERED**. Selecting an unlocked entry shows its original name, level, element, traits, and lore. Finding a rare does not automatically unlock the normal palette.

Achievements remain **First Evolution**, **Discover 5 Monsters**, and **Complete the Encyclopedia**. Species discovered in either palette count toward the existing thresholds; discovering both palettes never counts a species twice. Previously earned achievements are preserved.

Only actual physics spawns unlock entries. Each first appearance queues one five-second notice per species and palette; rare discoveries say **✦ Rare Monster Discovered!**. Collection state advances synchronously before React renders, preventing duplicate notices during rapid collision waves. Notices appear in a reserved space above the playfield, never covering pause, sound, journal, reset, or aiming controls. Each queued notice has its own identity and timer; opening the journal defers notices. Dismissal does not move focus into gameplay.

The journal is a native modal with Close and Escape support, independent scrolling, safe-area-aware height, and background scroll restoration. It freezes Matter, effects, cooldown, and overflow timing. Closing restores the previous pause/game-over state; browser focus loss keeps the game paused until explicitly resumed.

## Save compatibility

Collection LocalStorage key: `monster-merge-evolution.collection`.

```ts
{
  version: 2,
  discovered: string[],      // Normal stable creature keys
  rareDiscovered: string[],  // Rare stable creature keys
  achievements: string[]
}
```

Version 1 saves migrate to version 2 by keeping normal discoveries and all recognized earned achievements and adding an empty rare collection. The migrated state is persisted when the app mounts. Loading removes duplicate and unknown IDs and derives missing threshold achievements from unique species. Missing, malformed, or partly invalid rare data is repaired independently, preserving valid normal data and achievements. Damaged achievement data does not erase discoveries. Completely unparseable or unsupported-version saves cannot be recovered and load an empty in-memory collection.

Best scores retain their separate `monster-merge-evolution.best-score` key and are untouched by collection migration. Game over, Play Again, Reset hatchery, and refresh preserve both collections, achievements, and the best score. Current bodies, score, and pending notices are session-specific. Failed storage operations leave gameplay and in-memory progress working. Saves are browser/origin-local with no account or cloud sync.

## Architecture

- `src/game/variants.ts`: configurable rare roll, ten original palettes, shared texture/palette selection.
- `src/game/merging.ts`: level eligibility, unchanged points, collision reservations, OR inheritance.
- `src/game/collection.ts`: immutable discoveries, achievements, version validation and migration.
- `src/game/events.ts`: typed React/Phaser appearance and journal bridge.
- `src/game/scenes/GameScene.ts`: spawning, Matter lifecycle, inheritance, body-following sparkles.
- `src/game/art/`: deterministic pixel art, normal/rare textures, bounded evolution effects.
- `src/components/`: responsive journal, shared sprites, queued notices, score and session controls.

React owns page UI and persistence; Phaser owns the 360 × 640 logical playfield and bundled Matter engine. Both collision-start and collision-active events reserve body pairs immediately. Merges remove consumed bodies and spawn newborns after physics updates, rejecting stale/shared contacts and duplicate scoring. Lazy loading, shutdown cleanup, and StrictMode-safe mounting prevent duplicate canvases or subscriptions. Physics work is bounded by a 100-body cap.

## Validation and limitations

`npm run check` passes TypeScript, Oxlint, **85 Vitest tests**, and the production build. Coverage includes configurable probability boundaries, all four inheritance combinations at every eligible level, mixed-palette real Matter collisions and identical physical properties, chain inheritance, separate discoveries, duplicate notification eligibility during 2,000 bridge events, v1 migration, damaged rare fields, achievements, best-score isolation, restart/refresh persistence, and existing overflow, scoring, session and lifecycle behavior. A real Matter stress test merges 64 bodies through six generations and checks prolonged settling.

Browser smoke tests use an isolated test origin and deterministic rare spawns to check migrated normal progress, preserved achievements/best score, rare first-discovery notices, variant tabs, locked silhouettes, and reset/refresh behavior. Test fixtures are removed before commit. Physical mobile-device and audible speaker checks remain pending. Vite still reports the existing advisory for the lazy-loaded Phaser engine chunk exceeding 500 kB; production builds succeed. No active run or pending notification queue is restored after refresh.

## Public repository scope

All creature designs and palettes are original procedural artwork. No proprietary artwork, copyrighted characters, advertising SDKs, credentials, or commercial monetization code are included. Dependencies retain their respective licenses; no project license has been selected yet.

Implementation branch: `codex/rare-monster-variants`. Draft pull request target: `main`. See `docs/pull-request.md` for the milestone description.
