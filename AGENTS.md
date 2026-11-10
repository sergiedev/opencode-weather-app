# AGENTS.md

## What this repo is

Bun + TypeScript weather CLI with a Spanish UI and English code. The README is the spec (menu layout and the two-step OpenMeteo flow).

- `src/index.ts` — entry point; runs the app and sets the exit code
- `src/presentation/app.ts` — readline loop, menu dispatch, exit on `9`
- `src/presentation/menu.ts` — single menu registry (number, label, action) and menu rendering
- `src/presentation/input.ts` — prompter built on the readline async iterator and city selection
- `src/presentation/output.ts` — printer and weather line rendering
- `src/presentation/forecast.ts` — renders the Spanish 7-day table
- `src/presentation/messages.ts` — all user-facing Spanish copy
- `src/actions/` — one file per menu action (`getWeather`, `getAllWeather`, `addCity`, `removeCity`, `setDefaultCity`, `getForecast`, `toggleUnit`)
- `src/storage/settingsStorage.ts` — config path resolution, load/save and the unit setting
- `src/storage/citiesStorage.ts` — immutable city/default-city helpers
- `src/api/client.ts` — injected `Fetcher` and the shared JSON request helper
- `src/api/geocoding.ts` — city search against OpenMeteo geocoding
- `src/api/weather.ts` — current weather and 7-day forecast
- `src/types/` — global TypeScript contracts (`City`, `Store`, `Weather`, `MenuOption`, `AppContext`)
- `src/utils/` — `format`, `constants`, `colors`, `parseCity`, `errors`

State lives in `~/.config/weather-cli/config.json`; set `WEATHER_CONFIG` to point elsewhere (tests do this).

## Commands

- `bun install`
- `bun run start` (same as `bun run src/index.ts`)
- `bun run typecheck` — Bun's built-in `bun check`, not `tsc --noEmit`
- `bun test` — all tests; `bun test src/storage/settingsStorage.test.ts` for one file
- `bun run build` — compiles a standalone `weather.exe` (gitignored)

## Gotchas

- Menu numbering is fixed by the README: `1–6`, `8` settings, `9` exit. Option `7` intentionally does not exist. Add new options to `MENU_ENTRIES` in `src/presentation/menu.ts` only.
- The unit setting is sent as `temperature_unit` to OpenMeteo; display the unit label from `current_units`/`daily_units`, never hardcode `°C`.
- The 7-day forecast uses `daily=temperature_2m_max,temperature_2m_min` with `forecast_days=7` and `timezone=auto`; dates are formatted in UTC to avoid off-by-one shifts.
- Store helpers (`withCityAdded`, `withCityRemoved`, `withDefaultCity` in `citiesStorage`; `withUnit` in `settingsStorage`) return new stores; assign back to `context.store` and then `await context.save()`.
- `loadStore` normalizes config: invalid cities are dropped and a dangling `defaultCityId` becomes `null`.
- Prompts use the readline async iterator, not `rl.question`; the latter drops lines when input is piped (`... | weather`).
- Colors come from `context.theme`; they are disabled for non-TTY streams or when `NO_COLOR` is set, and forced with `FORCE_COLOR`. Tests get plain text by default.
- Async actions print a `messages.loading.*` line before awaiting the API so the user sees progress.
- Keep the build self-contained: no repo-relative runtime paths, no `require`.
- Tests inject fetchers/streams and temp config dirs; never call the live OpenMeteo API from tests.
