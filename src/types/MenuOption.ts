import type { Action } from "./AppContext.ts";
import type { Store } from "./Store.ts";

export interface MenuEntry {
  option: number;
  label(store: Store): string;
  action: Action;
}
