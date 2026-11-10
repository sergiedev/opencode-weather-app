import type { City } from "../types/City.ts";
import type { Unit } from "../types/Store.ts";

const SHORT_DATE_FORMAT = new Intl.DateTimeFormat("es-ES", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  timeZone: "UTC",
});

export function cityLabel(city: City): string {
  const parts = [city.name, city.admin1, city.country].filter(
    (part): part is string => Boolean(part),
  );
  return Array.from(new Set(parts)).join(", ");
}

export function unitSymbol(unit: Unit): string {
  return unit === "celsius" ? "°C" : "°F";
}

export function formatShortDate(date: string): string {
  const parsed = new Date(`${date}T12:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? date : SHORT_DATE_FORMAT.format(parsed);
}
