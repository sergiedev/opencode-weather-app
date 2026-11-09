import { createInterface } from "node:readline/promises";
import { createTheme, shouldUseColor } from "./colors.ts";
import { findAction } from "./commands.ts";
import type { AppContext } from "./context.ts";
import { errorMessage } from "./errors.ts";
import { renderMenu } from "./menu.ts";
import { messages } from "./messages.ts";
import { loadStore, resolveConfigPath, saveStore } from "./store.ts";
import type { Fetcher } from "./weather.ts";

const EXIT_OPTION = "9";

export interface RunOptions {
  configPath?: string;
  fetcher?: Fetcher;
  input?: NodeJS.ReadableStream;
  output?: NodeJS.WritableStream;
  color?: boolean;
}

class InputClosedError extends Error {}

export async function runApp(options: RunOptions = {}): Promise<void> {
  const configPath = options.configPath ?? resolveConfigPath();
  const fetcher = options.fetcher ?? fetch;
  const input = options.input ?? process.stdin;
  const output = options.output ?? process.stdout;
  const theme = createTheme(options.color ?? shouldUseColor(output));
  const terminal = createInterface({ input, output });
  const lines = terminal[Symbol.asyncIterator]();

  const context: AppContext = {
    store: await loadStore(configPath),
    fetchImpl: fetcher,
    theme,
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
    context.print(renderMenu(context.store, context.theme));

    const input = (await context.ask(messages.selectOption)).trim();
    if (input === EXIT_OPTION) {
      context.print(context.theme.muted(messages.bye));
      return;
    }

    const action = findAction(input);
    if (!action) {
      context.print(context.theme.error(messages.invalidOption));
      continue;
    }

    try {
      await action(context);
    } catch (error) {
      context.print(context.theme.error(errorMessage(error)));
    }
  }
}
