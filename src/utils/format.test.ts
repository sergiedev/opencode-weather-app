import { describe, expect, test } from "bun:test";
import type { City } from "../types/City.ts";
import { cityLabel, formatShortDate, unitSymbol } from "./format.ts";

const city: City = { id: 1, name: "Ottawa", latitude: 45.4, longitude: -75.7 };

describe("cityLabel", () => {
  test("joins name, region and country without duplicates", () => {
    expect(cityLabel({ ...city, admin1: "Ontario", country: "Canadá" })).toBe("Ottawa, Ontario, Canadá");
    expect(cityLabel({ ...city, admin1: "Ottawa", country: "Canadá" })).toBe("Ottawa, Canadá");
  });

  test("falls back to the name only", () => {
    expect(cityLabel(city)).toBe("Ottawa");
  });
});

describe("unitSymbol", () => {
  test("maps units to symbols", () => {
    expect(unitSymbol("celsius")).toBe("°C");
    expect(unitSymbol("fahrenheit")).toBe("°F");
  });
});

describe("formatShortDate", () => {
  test("formats ISO dates in Spanish without shifting the day", () => {
    const formatted = formatShortDate("2026-11-09");

    expect(formatted).toContain("09");
    expect(formatted).toContain("nov");
  });

  test("keeps unparseable values untouched", () => {
    expect(formatShortDate("not-a-date")).toBe("not-a-date");
  });
});
