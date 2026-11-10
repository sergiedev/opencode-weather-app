import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { messages } from "../presentation/messages.ts";
import type { Store, Unit } from "../types/Store.ts";
import { CONFIG_DIRECTORY, CONFIG_FILENAME } from "../utils/constants.ts";
import { parseCity } from "../utils/parseCity.ts";

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
