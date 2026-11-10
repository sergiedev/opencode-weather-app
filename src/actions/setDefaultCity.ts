import { selectCity } from "../presentation/input.ts";
import { messages } from "../presentation/messages.ts";
import { withDefaultCity } from "../storage/citiesStorage.ts";
import type { AppContext } from "../types/AppContext.ts";
import { cityLabel } from "../utils/format.ts";

export async function setDefaultCity(context: AppContext): Promise<void> {
  const { cities } = context.store;
  if (cities.length === 0) {
    context.print(context.theme.muted(messages.noCities));
    return;
  }

  const city = await selectCity(context, cities, messages.chooseCity);
  if (!city) return;

  context.store = withDefaultCity(context.store, city.id);
  await context.save();
  context.print(context.theme.success(messages.defaultCitySet(cityLabel(city))));
}
