import { messages } from "./messages.ts";
import { unitSymbol } from "./format.ts";
import type { Store } from "./types.ts";

const WIDTH = 40;
const BORDER = "═".repeat(WIDTH);

export function renderMenu(store: Store): string {
  return [
    BORDER,
    center(messages.title),
    BORDER,
    row(1, messages.option.defaultWeather),
    row(2, messages.option.allWeather(store.cities.length)),
    row(3, messages.option.searchCity),
    row(4, messages.option.removeCity),
    row(5, messages.option.setDefaultCity),
    row(8, messages.option.settings(unitSymbol(store.unit))),
    row(9, messages.option.exit),
    BORDER,
  ].join("\n");
}

function center(text: string): string {
  const left = Math.max(0, Math.floor((WIDTH - text.length) / 2));
  return `${" ".repeat(left)}${text}`;
}

function row(option: number, label: string): string {
  return `  ${option}. ${label}`;
}
