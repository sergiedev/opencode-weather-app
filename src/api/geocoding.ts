import type { City } from "../types/City.ts";
import { GEOCODING_ENDPOINT, GEOCODING_RESULT_LIMIT } from "../utils/constants.ts";
import { parseCity } from "../utils/parseCity.ts";
import { requestJson, type Fetcher } from "./client.ts";

interface GeocodingPayload {
  results?: unknown[];
}

export async function searchCities(name: string, fetcher: Fetcher = fetch): Promise<City[]> {
  const url = new URL(GEOCODING_ENDPOINT);
  url.searchParams.set("name", name);
  url.searchParams.set("count", GEOCODING_RESULT_LIMIT);
  url.searchParams.set("language", "es");
  url.searchParams.set("format", "json");

  const payload = (await requestJson(url, fetcher)) as GeocodingPayload;
  return (payload.results ?? []).flatMap((result) => {
    const city = parseCity(result);
    return city ? [city] : [];
  });
}
