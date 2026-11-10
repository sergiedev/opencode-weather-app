import { messages } from "../presentation/messages.ts";
import type { Unit } from "../types/Store.ts";
import type { City } from "../types/City.ts";
import type { DailyForecast, WeatherReading } from "../types/Weather.ts";
import { FORECAST_DAYS, FORECAST_ENDPOINT } from "../utils/constants.ts";
import { requestJson, type Fetcher } from "./client.ts";

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
  url.searchParams.set("forecast_days", FORECAST_DAYS);
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
