import { join } from "node:path";

export const EXIT_OPTION = "9";

export const GEOCODING_ENDPOINT = "https://geocoding-api.open-meteo.com/v1/search";
export const FORECAST_ENDPOINT = "https://api.open-meteo.com/v1/forecast";
export const REQUEST_TIMEOUT_MS = 10_000;
export const GEOCODING_RESULT_LIMIT = "5";
export const FORECAST_DAYS = "7";

export const CONFIG_DIRECTORY = join(".config", "weather-cli");
export const CONFIG_FILENAME = "config.json";
