import { messages } from "../presentation/messages.ts";
import type { AppContext } from "../types/AppContext.ts";
import { errorMessage } from "../utils/errors.ts";
import { cityLabel } from "../utils/format.ts";
import { getCityWeather } from "./getWeather.ts";

export async function getAllWeather(context: AppContext): Promise<void> {
  const { cities } = context.store;
  if (cities.length === 0) {
    context.print(context.theme.muted(messages.noCities));
    return;
  }

  for (const city of cities) {
    try {
      context.print(await getCityWeather(context, city));
    } catch (error) {
      context.print(context.theme.error(`${cityLabel(city)}: ${errorMessage(error)}`));
    }
  }
}
