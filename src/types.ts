export type Unit = "celsius" | "fahrenheit";

export interface City {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  admin1?: string;
  country?: string;
}

export interface Store {
  defaultCityId: number | null;
  unit: Unit;
  cities: City[];
}
