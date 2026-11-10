import type { City } from "../types/City.ts";
import type { Store } from "../types/Store.ts";

export function findDefaultCity(store: Store): City | null {
  return store.cities.find((city) => city.id === store.defaultCityId) ?? null;
}

export function withCityAdded(store: Store, city: City): Store {
  if (store.cities.some(({ id }) => id === city.id)) return store;
  return { ...store, cities: [...store.cities, city] };
}

export function withCityRemoved(store: Store, cityId: number): Store {
  const cities = store.cities.filter(({ id }) => id !== cityId);
  const defaultCityId = store.defaultCityId === cityId ? null : store.defaultCityId;
  return { ...store, cities, defaultCityId };
}

export function withDefaultCity(store: Store, cityId: number): Store {
  const exists = store.cities.some(({ id }) => id === cityId);
  return exists ? { ...store, defaultCityId: cityId } : store;
}
