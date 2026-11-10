import { addCity } from "../actions/addCity.ts";
import { getAllWeather } from "../actions/getAllWeather.ts";
import { getForecast } from "../actions/getForecast.ts";
import { getDefaultWeather } from "../actions/getWeather.ts";
import { removeCity } from "../actions/removeCity.ts";
import { setDefaultCity } from "../actions/setDefaultCity.ts";
import { toggleUnit } from "../actions/toggleUnit.ts";
import type { Action } from "../types/AppContext.ts";
import type { MenuEntry } from "../types/MenuOption.ts";
import type { Store } from "../types/Store.ts";
import type { Theme } from "../utils/colors.ts";
import { unitSymbol } from "../utils/format.ts";
import { messages } from "./messages.ts";

const WIDTH = 40;
const BORDER = "═".repeat(WIDTH);

export const MENU_ENTRIES: readonly MenuEntry[] = [
  { option: 1, label: () => messages.option.defaultWeather, action: getDefaultWeather },
  {
    option: 2,
    label: (store) => messages.option.allWeather(store.cities.length),
    action: getAllWeather,
  },
  { option: 3, label: () => messages.option.searchCity, action: addCity },
  { option: 4, label: () => messages.option.removeCity, action: removeCity },
  { option: 5, label: () => messages.option.setDefaultCity, action: setDefaultCity },
  { option: 6, label: () => messages.option.forecast, action: getForecast },
  {
    option: 8,
    label: (store) => messages.option.settings(unitSymbol(store.unit)),
    action: toggleUnit,
  },
];

export function findAction(option: string): Action | undefined {
  return MENU_ENTRIES.find((entry) => String(entry.option) === option)?.action;
}

export function renderMenu(store: Store, theme: Theme): string {
  return [
    theme.menu(BORDER),
    theme.title(center(messages.title)),
    theme.menu(BORDER),
    ...MENU_ENTRIES.map((entry) => row(entry.option, entry.label(store), theme)),
    theme.menu(BORDER),
  ].join("\n");
}

function center(text: string): string {
  const left = Math.max(0, Math.floor((WIDTH - text.length) / 2));
  return `${" ".repeat(left)}${text}`;
}

function row(option: number, label: string, theme: Theme): string {
  return `  ${theme.menu(`${option}.`)} ${label}`;
}
