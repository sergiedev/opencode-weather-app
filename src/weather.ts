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
  daily?: {
    time?: unknown;
    temperature_2m_max?: unknown;
    temperature_2m_min?: unknown;
  };
  daily_units?: {
    temperature_2m_max?: unknown;
    temperature_2m_min?: unknown;
  };
}

export interface WeatherReading {
  temperature: number;
  unit: string;
}

export interface ForecastDay {
  date: string;
  maximum: number;
  minimum: number;
}

export interface DailyForecast {
  unit: string;
  days: ForecastDay[];
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

  if (!isFiniteNumber(temperature) || typeof unitLabel !== "string") {
    throw new Error(messages.errors.response);
  }

  return { temperature, unit: unitLabel };
}

export async function fetchDailyForecast(
  city: City,
  unit: Unit,
  fetcher: Fetcher = fetch,
): Promise<DailyForecast> {
  const url = new URL(FORECAST_ENDPOINT);
  url.searchParams.set("latitude", String(city.latitude));
  url.searchParams.set("longitude", String(city.longitude));
  url.searchParams.set("daily", "temperature_2m_max,temperature_2m_min");
  url.searchParams.set("forecast_days", "7");
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("temperature_unit", unit);

  const payload = (await requestJson(url, fetcher)) as ForecastPayload;
  return parseForecast(payload);
}

function parseForecast(payload: ForecastPayload): DailyForecast {
  const dates = payload.daily?.time;
  const maxima = payload.daily?.temperature_2m_max;
  const minima = payload.daily?.temperature_2m_min;
  const unit =
    payload.daily_units?.temperature_2m_max ?? payload.daily_units?.temperature_2m_min;

  if (
    !Array.isArray(dates) ||
    !Array.isArray(maxima) ||
    !Array.isArray(minima) ||
    typeof unit !== "string" ||
    dates.length === 0 ||
    dates.length !== maxima.length ||
    dates.length !== minima.length
  ) {
    throw new Error(messages.errors.response);
  }

  const days = dates.map((date, index) => {
    const maximum = maxima[index];
    const minimum = minima[index];

    if (typeof date !== "string" || !isFiniteNumber(maximum) || !isFiniteNumber(minimum)) {
      throw new Error(messages.errors.response);
    }

    return { date, maximum, minimum };
  });

  return { unit, days };
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
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
