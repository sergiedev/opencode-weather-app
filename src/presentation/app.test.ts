import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Readable, Writable } from "node:stream";
import type { Fetcher } from "../api/client.ts";
import { loadStore } from "../storage/settingsStorage.ts";
import { runApp } from "./app.ts";

const directories: string[] = [];

async function tempConfigPath(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), "weather-cli-app-"));
  directories.push(directory);
  return join(directory, "config.json");
}

function createOutput(): { stream: Writable; text: () => string } {
  const chunks: string[] = [];
  const stream = new Writable({
    write(chunk, _encoding, callback) {
      chunks.push(String(chunk));
      callback();
    },
  });
  return { stream, text: () => chunks.join("") };
}

function createInput(lines: string[]): Readable {
  return Readable.from(lines.map((line) => `${line}\n`));
}

const fetcher: Fetcher = async (input) => {
  const url = new URL(String(input));

  if (url.hostname === "geocoding-api.open-meteo.com") {
    return new Response(
      JSON.stringify({
        results: [
          {
            id: 6094817,
            name: "Ottawa",
            latitude: 45.41117,
            longitude: -75.69812,
            admin1: "Ontario",
            country: "Canadá",
          },
        ],
      }),
    );
  }

  const fahrenheit = url.searchParams.get("temperature_unit") === "fahrenheit";

  if (url.searchParams.get("daily")) {
    return new Response(
      JSON.stringify({
        daily: {
          time: [
            "2026-11-09",
            "2026-11-10",
            "2026-11-11",
            "2026-11-12",
            "2026-11-13",
            "2026-11-14",
            "2026-11-15",
          ],
          temperature_2m_max: [6.2, 7.5, 8.4, 9.1, 5.6, 4.2, 3.8],
          temperature_2m_min: [1.4, 2.1, 3.0, 3.8, 0.9, -0.6, -1.2],
        },
        daily_units: { temperature_2m_max: fahrenheit ? "°F" : "°C" },
      }),
    );
  }

  return new Response(
    JSON.stringify({
      current: { temperature_2m: fahrenheit ? 43.2 : 6.2 },
      current_units: { temperature_2m: fahrenheit ? "°F" : "°C" },
    }),
  );
};

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe("runApp", () => {
  test("renders the menu and exits on option 9", async () => {
    const output = createOutput();

    await runApp({ configPath: await tempConfigPath(), input: createInput(["9"]), output: output.stream });

    expect(output.text()).toContain("WEATHER CLI");
    expect(output.text()).toContain("Clima de todas las ciudades (0)");
    expect(output.text()).toContain("Hasta luego.");
  });

  test("rejects unknown options and keeps running", async () => {
    const output = createOutput();

    await runApp({ configPath: await tempConfigPath(), input: createInput(["7", "9"]), output: output.stream });

    expect(output.text()).toContain("Opción inválida.");
    expect(output.text()).toContain("Hasta luego.");
  });

  test("guides the user when no default city is configured", async () => {
    const output = createOutput();

    await runApp({ configPath: await tempConfigPath(), input: createInput(["1", "9"]), output: output.stream });

    expect(output.text()).toContain("No hay ciudad default.");
  });

  test("adds a city, persists it as default and toggles units", async () => {
    const configPath = await tempConfigPath();
    const output = createOutput();
    const input = createInput(["3", "Ottawa", "8", "1", "9"]);

    await runApp({ configPath, input, output: output.stream, fetcher });

    const store = await loadStore(configPath);

    expect(output.text()).toContain("Buscando ciudades…");
    expect(output.text()).toContain("Ciudad agregada: Ottawa, Ontario, Canadá");
    expect(output.text()).toContain("Unidad actualizada: °F");
    expect(output.text()).toContain("Consultando clima…");
    expect(output.text()).toContain("Ottawa, Ontario, Canadá: 43.2 °F");
    expect(store.unit).toBe("fahrenheit");
    expect(store.defaultCityId).toBe(6094817);
    expect(store.cities).toHaveLength(1);
  });

  test("shows a seven day forecast for the chosen city", async () => {
    const output = createOutput();
    const input = createInput(["3", "Ottawa", "6", "1", "9"]);

    await runApp({ configPath: await tempConfigPath(), input, output: output.stream, fetcher });

    expect(output.text()).toContain("Consultando pronóstico…");
    expect(output.text()).toContain("Ottawa, Ontario, Canadá — próximos 7 días");
    expect(output.text()).toContain("máx 6.2 °C");
    expect(output.text()).toContain("mín -1.2 °C");
  });

  test("paints the output when colors are enabled", async () => {
    const output = createOutput();

    await runApp({
      configPath: await tempConfigPath(),
      input: createInput(["9"]),
      output: output.stream,
      color: true,
    });

    expect(output.text()).toContain("\u001b[36m");
    expect(output.text()).toContain("WEATHER CLI\u001b[0m");
    expect(output.text()).toContain("Hasta luego.\u001b[0m");
  });

  test("finishes cleanly when the input closes", async () => {
    const output = createOutput();

    await runApp({ configPath: await tempConfigPath(), input: createInput([]), output: output.stream });

    expect(output.text()).toContain("WEATHER CLI");
  });
});
