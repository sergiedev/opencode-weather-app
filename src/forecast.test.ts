import { describe, expect, test } from "bun:test";
import { createTheme } from "./colors.ts";
import { renderForecast } from "./forecast.ts";
import type { DailyForecast } from "./weather.ts";

const forecast: DailyForecast = {
  unit: "°C",
  days: [
    { date: "2026-11-09", maximum: 6.2, minimum: 1.4 },
    { date: "2026-11-10", maximum: 7.5, minimum: 2.1 },
    { date: "2026-11-11", maximum: 8.4, minimum: 3.0 },
    { date: "2026-11-12", maximum: 9.1, minimum: 3.8 },
    { date: "2026-11-13", maximum: 5.6, minimum: 0.9 },
    { date: "2026-11-14", maximum: 4.2, minimum: -0.6 },
    { date: "2026-11-15", maximum: 3.8, minimum: -1.2 },
  ],
};

const theme = createTheme(false);

describe("renderForecast", () => {
  test("prints a header followed by one line per day", () => {
    const lines = renderForecast("Ottawa, Ontario, Canadá", forecast, theme).split("\n");

    expect(lines[0]).toBe("Ottawa, Ontario, Canadá — próximos 7 días");
    expect(lines).toHaveLength(8);
    expect(lines[1]).toContain("máx 6.2 °C");
    expect(lines[1]).toContain("mín 1.4 °C");
    expect(lines[7]).toContain("mín -1.2 °C");
  });

  test("never shifts dates because of the timezone", () => {
    const line = renderForecast("Ottawa", forecast, theme).split("\n")[1];

    expect(line).toContain("09");
    expect(line).toContain("nov");
  });

  test("colors temperatures when the theme is enabled", () => {
    const colored = renderForecast("Ottawa", forecast, createTheme(true));

    expect(colored).toContain("\u001b[33m6.2 °C\u001b[0m");
  });
});
