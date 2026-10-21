# Milestone 3: Game Over, Restart and Gameplay Polish

The hatchery now ends a round after monsters remain above the danger line for three continuous seconds. A visible countdown warns the player, clearing the line resets it, and falling player drops receive temporary immunity until they pass the line or settle. Game over freezes physics and blocks new drops; the overlay shows final/best scores and Play Again starts a fresh round without a page refresh.

Adds an upcoming-monster preview, immediate touch positioning with a 300 ms cooldown, bounded spawning for drops and evolved bodies, pause/resume with automatic pause on focus loss, and optional original synthesized tones. The retro design stays responsive, with large touch controls. Restart retains the best score and sound preference while cleaning up the old canvas, input/physics/command listeners, and audio resources.

Validation: TypeScript, Oxlint, 37 Vitest tests, and the production build pass. Tests include countdown/reset, falling immunity, pause timing, rapid taps, input blocking, repeated scene cleanup/restart, and a 64-body chain through six generations plus 600 settling steps. Browser smoke checks cover rendered controls, pause/resume, reset, sound preference and single-canvas mounting. Physical mobile and audible speaker checks remain pending. Vite reports the existing advisory for the large Phaser engine chunk.

No advertising SDKs, monetization code, proprietary artwork, credentials or commercial secrets are introduced.
