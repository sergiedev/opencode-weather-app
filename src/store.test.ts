import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import {
  createStore,
  findDefaultCity,
  loadStore,
  resolveConfigPath,
  saveStore,
  withCityAdded,
  withCityRemoved,
  withDefaultCity,
  withUnit,
} from "./store.ts";
import type { City } from "./types.ts";

const city: City = {
  id: 6094817,
  name: "Ottawa",
  latitude: 45.41117,
  longitude: -75.69812,
  admin1: "Ontario",
  country: "Canadá",
};

const directories: string[] = [];

async function tempConfigPath(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), "weather-cli-"));
  directories.push(directory);
  return join(directory, "nested", "config.json");
}

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe("resolveConfigPath", () => {
  test("prefers WEATHER_CONFIG over the default location", () => {
    expect(resolveConfigPath({ WEATHER_CONFIG: " C:\\tmp\\config.json " })).toBe("C:\\tmp\\config.json");
  });

  test("defaults to ~/.config/weather-cli/config.json", () => {
    expect(resolveConfigPath({})).toBe(join(homedir(), ".config", "weather-cli", "config.json"));
  });
});

describe("loadStore", () => {
  test("returns defaults when the file does not exist", async () => {
    expect(await loadStore(await tempConfigPath())).toEqual(createStore());
  });

  test("round-trips a saved store", async () => {
    const path = await tempConfigPath();
    const store = withDefaultCity(
      withUnit(withCityAdded(createStore(), city), "fahrenheit"),
      city.id,
    );

    await saveStore(path, store);

    expect(await loadStore(path)).toEqual(store);
    expect(JSON.parse(await readFile(path, "utf8"))).toEqual(store);
  });

  test("drops invalid data and dangling default ids", async () => {
    const path = await tempConfigPath();
    await saveStore(path, createStore());
    const { writeFile } = await import("node:fs/promises");
    await writeFile(
      path,
      JSON.stringify({ defaultCityId: 99, unit: "kelvin", cities: [city, { id: "bad" }] }),
    );

    const store = await loadStore(path);

    expect(store.defaultCityId).toBeNull();
    expect(store.unit).toBe("celsius");
    expect(store.cities).toEqual([city]);
  });

  test("fails with a clear message when the JSON is corrupt", async () => {
    const path = await tempConfigPath();
    await saveStore(path, createStore());
    const { writeFile } = await import("node:fs/promises");
    await writeFile(path, "{not json");

    expect(loadStore(path)).rejects.toThrow("config.json");
  });
});

describe("store helpers", () => {
  test("does not duplicate cities with the same id", () => {
    const store = withCityAdded(withCityAdded(createStore(), city), city);
    expect(store.cities).toHaveLength(1);
  });

  test("clears the default when its city is removed", () => {
    const store = withDefaultCity(withCityAdded(createStore(), city), city.id);
    const next = withCityRemoved(store, city.id);

    expect(next.cities).toEqual([]);
    expect(next.defaultCityId).toBeNull();
    expect(findDefaultCity(next)).toBeNull();
  });

  test("ignores unknown default ids", () => {
    expect(withDefaultCity(createStore(), 42)).toEqual(createStore());
  });
});
