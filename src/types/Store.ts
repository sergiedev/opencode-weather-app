import type { City } from "./City.ts";

export type Unit = "celsius" | "fahrenheit";

export interface Store {
  defaultCityId: number | null;
  unit: Unit;
  cities: City[];
}
