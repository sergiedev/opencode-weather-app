import type { Theme } from "./colors.ts";
import { MENU_ENTRIES } from "./commands.ts";
import { messages } from "./messages.ts";
import type { Store } from "./types.ts";

const WIDTH = 40;
const BORDER = "═".repeat(WIDTH);

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
