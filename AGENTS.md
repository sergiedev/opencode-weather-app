# AGENTS.md

## What this repo is

Bun + TypeScript weather CLI with a Spanish UI and English code. The README is the spec (menu layout and the two-step OpenMeteo flow).

- `src/app.ts` — readline loop, menu dispatch, exit on `9`
- `src/actions.ts` — menu handlers
- `src/commands.ts` — single menu registry (number, label, action) used by the menu and the dispatcher
- `src/store.ts` — config load/save and immutable city/unit helpers
- `src/weather.ts` — geocoding, current weather and 7-day forecast (accepts an injected `Fetcher`)
- `src/forecast.ts` — renders the Spanish 7-day table
- `src/menu.ts` — renders the menu from the command registry
- `src/colors.ts` — ANSI theme and TTY detection
- `src/messages.ts` — all user-facing Spanish copy

State lives in `~/.config/weather-cli/config.json`; set `WEATHER_CONFIG` to point elsewhere (tests do this).

## Commands

- `bun install`
- `bun run start` (same as `bun run index.ts`)
- `bun run typecheck` — Bun's built-in `bun check`, not `tsc --noEmit`
- `bun test` — all tests; `bun test src/store.test.ts` for one file
- `bun run build` — compiles a standalone `weather.exe` (gitignored)

## Gotchas

- Menu numbering is fixed by the README: `1–6`, `8` settings, `9` exit. Option `7` intentionally does not exist. Add new options to `MENU_ENTRIES` in `src/commands.ts` only.
- The unit setting is sent as `temperature_unit` to OpenMeteo; display the unit label from `current_units`/`daily_units`, never hardcode `°C`.
- The 7-day forecast uses `daily=temperature_2m_max,temperature_2m_min` with `forecast_days=7` and `timezone=auto`; dates are formatted in UTC to avoid off-by-one shifts.
- Store helpers (`withCityAdded`, `withCityRemoved`, `withDefaultCity`, `withUnit`) return new stores; assign back to `context.store` and then `await context.save()`.
- `loadStore` normalizes config: invalid cities are dropped and a dangling `defaultCityId` becomes `null`.
- Prompts use the readline async iterator, not `rl.question`; the latter drops lines when input is piped (`... | weather`).
- Colors come from `context.theme`; they are disabled for non-TTY streams or when `NO_COLOR` is set, and forced with `FORCE_COLOR`. Tests get plain text by default.
- Async actions print a `messages.loading.*` line before awaiting the API so the user sees progress.
- Keep the build self-contained: no repo-relative runtime paths, no `require`.
- Tests inject fetchers/streams and temp config dirs; never call the live OpenMeteo API from tests.
