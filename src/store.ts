import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { parseCity } from "./city.ts";
import { messages } from "./messages.ts";
import type { City, Store, Unit } from "./types.ts";

const CONFIG_DIRECTORY = ".weather-cli";
const CONFIG_FILENAME = "config.json";
const TEMP_SUFFIX = ".tmp";

export function resolveConfigPath(env: Record<string, string | undefined> = process.env): string {
  const override = env.WEATHER_CONFIG?.trim();
  return override ? override : join(homedir(), CONFIG_DIRECTORY, CONFIG_FILENAME);
}

export function createStore(): Store {
  return { defaultCityId: null, unit: "celsius", cities: [] };
}

export async function loadStore(path: string): Promise<Store> {
  let raw: string;
  try {
    raw = await readFile(path, "utf8");
  } catch (error) {
    if (errorCode(error) === "ENOENT") return createStore();
    throw new Error(messages.invalidConfig(path));
  }

  try {
    return normalizeStore(JSON.parse(raw));
  } catch {
    throw new Error(messages.invalidConfig(path));
  }
}

export async function saveStore(path: string, store: Store): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const tempPath = `${path}${TEMP_SUFFIX}`;
  await writeFile(tempPath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
  await rename(tempPath, path);
}

export function findDefaultCity(store: Store): City | null {
  return store.cities.find((city) => city.id === store.defaultCityId) ?? null;
}

export function withCityAdded(store: Store, city: City): Store {
  if (store.cities.some(({ id }) => id === city.id)) return store;
  return { ...store, cities: [...store.cities, city] };
}

export function withCityRemoved(store: Store, cityId: number): Store {
  const cities = store.cities.filter(({ id }) => id !== cityId);
  const defaultCityId = store.defaultCityId === cityId ? null : store.defaultCityId;
  return { ...store, cities, defaultCityId };
}

export function withDefaultCity(store: Store, cityId: number): Store {
  const exists = store.cities.some(({ id }) => id === cityId);
  return exists ? { ...store, defaultCityId: cityId } : store;
}

export function withUnit(store: Store, unit: Unit): Store {
  return { ...store, unit };
}

function normalizeStore(value: unknown): Store {
  if (typeof value !== "object" || value === null) return createStore();

  const record = value as Record<string, unknown>;
  const cities = Array.isArray(record.cities)
    ? record.cities.flatMap((item) => {
        const city = parseCity(item);
        return city ? [city] : [];
      })
    : [];
  const unit: Unit = record.unit === "fahrenheit" ? "fahrenheit" : "celsius";
  const requestedDefault = typeof record.defaultCityId === "number" ? record.defaultCityId : null;
  const defaultCityId = cities.some(({ id }) => id === requestedDefault) ? requestedDefault : null;

  return { defaultCityId, unit, cities };
}

function errorCode(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null || !("code" in error)) return undefined;
  return String((error as { code: unknown }).code);
}
