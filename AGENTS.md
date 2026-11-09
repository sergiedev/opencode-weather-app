# AGENTS.md

## What this repo is

Bun + TypeScript weather CLI with a Spanish UI and English code. The README is the spec (menu layout and the two-step OpenMeteo flow).

- `src/app.ts` — readline loop, menu dispatch, exit on `9`
- `src/actions.ts` — menu handlers
- `src/store.ts` — config load/save and immutable city/unit helpers
- `src/weather.ts` — geocoding + forecast (accepts an injected `Fetcher`)
- `src/messages.ts` — all user-facing Spanish copy

State lives in `~/.weather-cli/config.json`; set `WEATHER_CONFIG` to point elsewhere (tests do this).

## Commands

- `bun install`
- `bun run start` (same as `bun run index.ts`)
- `bun run typecheck` — Bun's built-in `bun check`, not `tsc --noEmit`
- `bun test` — all tests; `bun test src/store.test.ts` for one file
- `bun run build` — compiles a standalone `weather.exe` (gitignored)

## Gotchas

- Menu numbering is fixed by the README: `1–5`, `8` settings, `9` exit. Options `6`/`7` intentionally do not exist.
- The unit setting is sent as `temperature_unit` to OpenMeteo; display the unit label from `current_units`, never hardcode `°C`.
- Store helpers (`withCityAdded`, `withCityRemoved`, `withDefaultCity`, `withUnit`) return new stores; assign back to `context.store` and then `await context.save()`.
- `loadStore` normalizes config: invalid cities are dropped and a dangling `defaultCityId` becomes `null`.
- Prompts use the readline async iterator, not `rl.question`; the latter drops lines when input is piped (`... | weather`).
- Keep the build self-contained: no repo-relative runtime paths, no `require`.
- Tests inject fetchers/streams and temp config dirs; never call the live OpenMeteo API from tests.
