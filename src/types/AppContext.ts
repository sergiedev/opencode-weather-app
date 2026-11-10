import type { Fetcher } from "../api/client.ts";
import type { Theme } from "../utils/colors.ts";
import type { Store } from "./Store.ts";

export interface AppContext {
  store: Store;
  fetchImpl: Fetcher;
  theme: Theme;
  print(text: string): void;
  ask(question: string): Promise<string>;
  save(): Promise<void>;
}

export type Action = (context: AppContext) => Promise<void>;
