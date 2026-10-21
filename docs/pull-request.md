# Milestone 5: Rare Monster Variants & Collection Improvements

Player drops now have a configurable 2% chance of an original rare palette. Normal and rare monsters share levels, collision geometry, physical properties, and points. Matching palettes and mixed palettes merge equally; the child is rare if either parent is rare. Merges never reroll rarity. All ten species have alternate palettes and rare bodies receive subtle position-following sparkles with reduced-motion support. Higher evolutions gain stronger original wings, horns, antlers, fins, a tail, and crown/armor while preserving names, elements, and lore.

The encyclopedia tracks normal and rare discoveries independently, each out of ten, with a variant toggle, locked silhouettes, rare badges, and shared details. First-time rare appearances queue special dismissible notices above gameplay. Synchronous discovery updates and variant-specific notice identities prevent duplicates during chain reactions and give every queued notice its full timer. Existing achievements count unique species from either palette without double counting.

Collection saves migrate from version 1 to version 2, retaining normal discoveries and all recognized earned achievements. Rare data is validated independently so missing or damaged rare fields cannot erase normal progress. Best scores retain their existing separate storage key. Both collections survive restart and refresh. README documents balancing, inheritance, migration, architecture, and limitations.

## Validation

- `npm run check`: TypeScript, Oxlint, 85 Vitest tests, and production build pass.
- Tests cover probability configuration and exact boundaries, all parent-variant combinations across eligible levels, OR inheritance through chains, mixed-palette real Matter contacts and unchanged physical properties/points, separate rare persistence, v1 migration, damaged rare data, existing achievements, duplicate discovery eligibility under 2,000 rapid bridge events, best-score isolation, and restart/refresh persistence.
- Browser smoke checks on an isolated origin verify a migrated 10/10 normal collection, preserved achievements and best score, a forced rare drop's actual notification, rare progress/badge/silhouettes, enhanced art, reset, and refresh persistence. Temporary deterministic fixtures are removed before commit.

## Limitations

- Physical mobile-device and audible speaker checks remain pending.
- The existing Vite advisory for the lazy-loaded Phaser engine chunk above 500 kB remains; the production build succeeds.
- Saves remain browser/origin-local; current bodies and pending notices do not survive refresh. Completely unparseable saves cannot be reconstructed.
- No proprietary artwork, copyrighted character designs, credentials, advertising SDKs, or commercial monetization code added.
