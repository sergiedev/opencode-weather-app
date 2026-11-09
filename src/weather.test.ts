import { describe, expect, test } from "bun:test";
import { messages } from "./messages.ts";
import type { City } from "./types.ts";
import { fetchDailyForecast, fetchWeather, searchCities, type Fetcher } from "./weather.ts";

const city: City = {
  id: 6094817,
  name: "Ottawa",
  latitude: 45.41117,
  longitude: -75.69812,
  admin1: "Ontario",
  country: "Canadá",
};

function stubFetcher(payload: unknown, status = 200): Fetcher {
  return async () => new Response(JSON.stringify(payload), { status });
}

describe("searchCities", () => {
  test("maps geocoding results to cities", async () => {
    const fetcher = stubFetcher({
      results: [
        { id: 6094817, name: "Ottawa", latitude: 45.41117, longitude: -75.69812, admin1: "Ontario", country: "Canadá" },
        { id: "invalid" },
      ],
    });

    const cities = await searchCities("Ottawa", fetcher);

    expect(cities).toEqual([city]);
  });

  test("sends the search parameters required by the API", async () => {
    let requested: string | URL | Request | undefined;
    const fetcher: Fetcher = async (input) => {
      requested = input;
      return new Response(JSON.stringify({ results: [] }));
    };

    await searchCities("São Paulo", fetcher);

    const url = new URL(String(requested));
    expect(url.searchParams.get("name")).toBe("São Paulo");
    expect(url.searchParams.get("count")).toBe("5");
    expect(url.searchParams.get("language")).toBe("es");
    expect(url.searchParams.get("format")).toBe("json");
  });

  test("returns an empty list when there are no matches", async () => {
    expect(await searchCities("Atlantis", stubFetcher({}))).toEqual([]);
  });

  test("reports HTTP failures", async () => {
    expect(searchCities("Ottawa", stubFetcher({}, 503))).rejects.toThrow(messages.errors.http(503));
  });

  test("reports network failures", async () => {
    const fetcher: Fetcher = async () => {
      throw new TypeError("fetch failed");
    };

    expect(searchCities("Ottawa", fetcher)).rejects.toThrow(messages.errors.network);
  });
});

describe("fetchWeather", () => {
  test("returns the temperature with the API unit label", async () => {
    const fetcher = stubFetcher({
      current: { temperature_2m: 6.2 },
      current_units: { temperature_2m: "°C" },
    });

    expect(await fetchWeather(city, "celsius", fetcher)).toEqual({ temperature: 6.2, unit: "°C" });
  });

  test("requests fahrenheit when configured", async () => {
    let requested: string | URL | Request | undefined;
    const fetcher: Fetcher = async (input) => {
      requested = input;
      return new Response(
        JSON.stringify({ current: { temperature_2m: 43.2 }, current_units: { temperature_2m: "°F" } }),
      );
    };

    const reading = await fetchWeather(city, "fahrenheit", fetcher);

    const url = new URL(String(requested));
    expect(url.searchParams.get("temperature_unit")).toBe("fahrenheit");
    expect(reading.unit).toBe("°F");
  });

  test("rejects malformed responses", async () => {
    expect(fetchWeather(city, "celsius", stubFetcher({ current: {} }))).rejects.toThrow(
      messages.errors.response,
    );
  });
});

describe("fetchDailyForecast", () => {
  const payload = {
    daily: {
      time: ["2026-11-09", "2026-11-10"],
      temperature_2m_max: [6.2, 7.5],
      temperature_2m_min: [1.4, 2.1],
    },
    daily_units: { temperature_2m_max: "°C", temperature_2m_min: "°C" },
  };

  test("maps the daily arrays to forecast days", async () => {
    expect(await fetchDailyForecast(city, "celsius", stubFetcher(payload))).toEqual({
      unit: "°C",
      days: [
        { date: "2026-11-09", maximum: 6.2, minimum: 1.4 },
        { date: "2026-11-10", maximum: 7.5, minimum: 2.1 },
      ],
    });
  });

  test("requests seven days in the configured unit", async () => {
    let requested: string | URL | Request | undefined;
    const fetcher: Fetcher = async (input) => {
      requested = input;
      return new Response(JSON.stringify({ ...payload, daily_units: { temperature_2m_max: "°F" } }));
    };

    const forecast = await fetchDailyForecast(city, "fahrenheit", fetcher);

    const url = new URL(String(requested));
    expect(url.searchParams.get("daily")).toBe("temperature_2m_max,temperature_2m_min");
    expect(url.searchParams.get("forecast_days")).toBe("7");
    expect(url.searchParams.get("timezone")).toBe("auto");
    expect(url.searchParams.get("temperature_unit")).toBe("fahrenheit");
    expect(forecast.unit).toBe("°F");
  });

  test("rejects incomplete daily responses", async () => {
    const missingUnit = stubFetcher({ daily: payload.daily });
    const mismatched = stubFetcher({
      daily: { ...payload.daily, temperature_2m_min: [1.4] },
      daily_units: payload.daily_units,
    });

    expect(fetchDailyForecast(city, "celsius", missingUnit)).rejects.toThrow(messages.errors.response);
    expect(fetchDailyForecast(city, "celsius", mismatched)).rejects.toThrow(messages.errors.response);
    expect(fetchDailyForecast(city, "celsius", stubFetcher({ daily: {} }))).rejects.toThrow(
      messages.errors.response,
    );
  });
});
