import type { Theme } from "./colors.ts";
import type { Store } from "./types.ts";
import type { Fetcher } from "./weather.ts";

export interface AppContext {
  store: Store;
  fetchImpl: Fetcher;
  theme: Theme;
  print(text: string): void;
  ask(question: string): Promise<string>;
  save(): Promise<void>;
}

export type Action = (context: AppContext) => Promise<void>;
