import {
  deleteCity,
  searchAndAddCity,
  setDefaultCity,
  showAllWeather,
  showDefaultWeather,
  showSevenDayForecast,
  toggleUnit,
} from "./actions.ts";
import type { Action } from "./context.ts";
import { unitSymbol } from "./format.ts";
import { messages } from "./messages.ts";
import type { Store } from "./types.ts";

export interface MenuEntry {
  option: number;
  label(store: Store): string;
  action: Action;
}

export const MENU_ENTRIES: readonly MenuEntry[] = [
  { option: 1, label: () => messages.option.defaultWeather, action: showDefaultWeather },
  {
    option: 2,
    label: (store) => messages.option.allWeather(store.cities.length),
    action: showAllWeather,
  },
  { option: 3, label: () => messages.option.searchCity, action: searchAndAddCity },
  { option: 4, label: () => messages.option.removeCity, action: deleteCity },
  { option: 5, label: () => messages.option.setDefaultCity, action: setDefaultCity },
  { option: 6, label: () => messages.option.forecast, action: showSevenDayForecast },
  {
    option: 8,
    label: (store) => messages.option.settings(unitSymbol(store.unit)),
    action: toggleUnit,
  },
];

export function findAction(option: string): Action | undefined {
  return MENU_ENTRIES.find((entry) => String(entry.option) === option)?.action;
}
