import { createInterface } from "node:readline/promises";
import { deleteCity, searchAndAddCity, setDefaultCity, showAllWeather, showDefaultWeather, toggleUnit } from "./actions.ts";
import type { Action, AppContext } from "./context.ts";
import { errorMessage } from "./errors.ts";
import { renderMenu } from "./menu.ts";
import { messages } from "./messages.ts";
import { loadStore, resolveConfigPath, saveStore } from "./store.ts";
import type { Fetcher } from "./weather.ts";

const EXIT_OPTION = "9";

const ACTIONS: Record<string, Action> = {
  "1": showDefaultWeather,
  "2": showAllWeather,
  "3": searchAndAddCity,
  "4": deleteCity,
  "5": setDefaultCity,
  "8": toggleUnit,
};

export interface RunOptions {
  configPath?: string;
  fetcher?: Fetcher;
  input?: NodeJS.ReadableStream;
  output?: NodeJS.WritableStream;
}

class InputClosedError extends Error {}

export async function runApp(options: RunOptions = {}): Promise<void> {
  const configPath = options.configPath ?? resolveConfigPath();
  const fetcher = options.fetcher ?? fetch;
  const input = options.input ?? process.stdin;
  const output = options.output ?? process.stdout;
  const terminal = createInterface({ input, output });
  const lines = terminal[Symbol.asyncIterator]();

  const context: AppContext = {
    store: await loadStore(configPath),
    fetchImpl: fetcher,
    print: (text) => output.write(`${text}\n`),
    ask: async (question) => {
      output.write(question);
      const next = await lines.next();
      if (next.done) throw new InputClosedError();
      return next.value;
    },
    save: () => saveStore(configPath, context.store),
  };

  try {
    await runLoop(context);
  } catch (error) {
    if (!(error instanceof InputClosedError)) throw error;
  } finally {
    terminal.close();
  }
}

async function runLoop(context: AppContext): Promise<void> {
  while (true) {
    context.print(renderMenu(context.store));

    const input = (await context.ask(messages.selectOption)).trim();
    if (input === EXIT_OPTION) {
      context.print(messages.bye);
      return;
    }

    const action = ACTIONS[input];
    if (!action) {
      context.print(messages.invalidOption);
      continue;
    }

    try {
      await action(context);
    } catch (error) {
      context.print(errorMessage(error));
    }
  }
}
