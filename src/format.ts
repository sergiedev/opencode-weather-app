import type { City, Unit } from "./types.ts";

export function cityLabel(city: City): string {
  const parts = [city.name, city.admin1, city.country].filter(
    (part): part is string => Boolean(part),
  );
  return Array.from(new Set(parts)).join(", ");
}

export function unitSymbol(unit: Unit): string {
  return unit === "celsius" ? "°C" : "°F";
}
