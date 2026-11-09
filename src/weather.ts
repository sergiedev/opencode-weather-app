import { parseCity } from "./city.ts";
import { messages } from "./messages.ts";
import type { City, Unit } from "./types.ts";

const GEOCODING_ENDPOINT = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_ENDPOINT = "https://api.open-meteo.com/v1/forecast";
const REQUEST_TIMEOUT_MS = 10_000;

export type Fetcher = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

interface GeocodingPayload {
  results?: unknown[];
}

interface ForecastPayload {
  current?: { temperature_2m?: unknown };
  current_units?: { temperature_2m?: unknown };
}

export interface WeatherReading {
  temperature: number;
  unit: string;
}

export async function searchCities(name: string, fetcher: Fetcher = fetch): Promise<City[]> {
  const url = new URL(GEOCODING_ENDPOINT);
  url.searchParams.set("name", name);
  url.searchParams.set("count", "5");
  url.searchParams.set("language", "es");
  url.searchParams.set("format", "json");

  const payload = (await requestJson(url, fetcher)) as GeocodingPayload;
  return (payload.results ?? []).flatMap((result) => {
    const city = parseCity(result);
    return city ? [city] : [];
  });
}

export async function fetchWeather(
  city: City,
  unit: Unit,
  fetcher: Fetcher = fetch,
): Promise<WeatherReading> {
  const url = new URL(FORECAST_ENDPOINT);
  url.searchParams.set("latitude", String(city.latitude));
  url.searchParams.set("longitude", String(city.longitude));
  url.searchParams.set("current", "temperature_2m");
  url.searchParams.set("temperature_unit", unit);

  const payload = (await requestJson(url, fetcher)) as ForecastPayload;
  const temperature = payload.current?.temperature_2m;
  const unitLabel = payload.current_units?.temperature_2m;

  if (typeof temperature !== "number" || !Number.isFinite(temperature) || typeof unitLabel !== "string") {
    throw new Error(messages.errors.response);
  }

  return { temperature, unit: unitLabel };
}

async function requestJson(url: URL, fetcher: Fetcher): Promise<unknown> {
  let response: Response;
  try {
    response = await fetcher(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  } catch {
    throw new Error(messages.errors.network);
  }

  if (!response.ok) {
    throw new Error(messages.errors.http(response.status));
  }

  try {
    return await response.json();
  } catch {
    throw new Error(messages.errors.response);
  }
}
