import { describe, expect, test } from "bun:test";
import { messages } from "../presentation/messages.ts";
import type { City } from "../types/City.ts";
import type { Fetcher } from "./client.ts";
import { searchCities } from "./geocoding.ts";

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
