import { createInterface } from "node:readline/promises";
import type { AppContext } from "../types/AppContext.ts";
import type { City } from "../types/City.ts";
import { cityLabel } from "../utils/format.ts";
import { messages } from "./messages.ts";

export class InputClosedError extends Error {}

export interface Prompter {
  ask(question: string): Promise<string>;
  close(): void;
}

export function createPrompter(
  input: NodeJS.ReadableStream,
  output: NodeJS.WritableStream,
): Prompter {
  const terminal = createInterface({ input, output });
  const lines = terminal[Symbol.asyncIterator]();

  return {
    ask: async (question) => {
      output.write(question);
      const next = await lines.next();
      if (next.done) throw new InputClosedError();
      return next.value;
    },
    close: () => terminal.close(),
  };
}

export async function selectCity(
  context: AppContext,
  cities: City[],
  question: string,
): Promise<City | null> {
  cities.forEach((city, index) => context.print(`  ${index + 1}. ${cityLabel(city)}`));

  const answer = (await context.ask(question)).trim();
  if (!answer) return null;

  const index = Number(answer);
  if (!Number.isInteger(index) || index < 1 || index > cities.length) {
    context.print(context.theme.error(messages.invalidSelection));
    return null;
  }

  return cities[index - 1] ?? null;
}
