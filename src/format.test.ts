import { describe, expect, test } from "bun:test";
import { cityLabel, unitSymbol } from "./format.ts";
import type { City } from "./types.ts";

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
