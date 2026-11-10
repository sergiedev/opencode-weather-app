import type { City } from "../types/City.ts";

export function parseCity(value: unknown): City | null {
  if (typeof value !== "object" || value === null) return null;

  const record = value as Record<string, unknown>;
  const { id, name, latitude, longitude } = record;

  if (
    typeof id !== "number" ||
    typeof name !== "string" ||
    typeof latitude !== "number" ||
    typeof longitude !== "number" ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return null;
  }

  return {
    id,
    name,
    latitude,
    longitude,
    admin1: typeof record.admin1 === "string" ? record.admin1 : undefined,
    country: typeof record.country === "string" ? record.country : undefined,
  };
}
