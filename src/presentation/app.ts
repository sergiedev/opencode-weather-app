import type { Fetcher } from "../api/client.ts";
import { loadStore, resolveConfigPath, saveStore } from "../storage/settingsStorage.ts";
import type { AppContext } from "../types/AppContext.ts";
import { createTheme, shouldUseColor } from "../utils/colors.ts";
import { EXIT_OPTION } from "../utils/constants.ts";
import { errorMessage } from "../utils/errors.ts";
import { createPrompter, InputClosedError } from "./input.ts";
import { findAction, renderMenu } from "./menu.ts";
import { messages } from "./messages.ts";
import { createPrinter } from "./output.ts";

export interface RunOptions {
  configPath?: string;
  fetcher?: Fetcher;
  input?: NodeJS.ReadableStream;
  output?: NodeJS.WritableStream;
  color?: boolean;
}

export async function runApp(options: RunOptions = {}): Promise<void> {
  const configPath = options.configPath ?? resolveConfigPath();
  const fetcher = options.fetcher ?? fetch;
  const input = options.input ?? process.stdin;
  const output = options.output ?? process.stdout;
  const theme = createTheme(options.color ?? shouldUseColor(output));
  const prompter = createPrompter(input, output);

  const context: AppContext = {
    store: await loadStore(configPath),
    fetchImpl: fetcher,
    theme,
    print: createPrinter(output),
    ask: (question) => prompter.ask(question),
    save: () => saveStore(configPath, context.store),
  };

  try {
    await runLoop(context);
  } catch (error) {
    if (!(error instanceof InputClosedError)) throw error;
  } finally {
    prompter.close();
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
