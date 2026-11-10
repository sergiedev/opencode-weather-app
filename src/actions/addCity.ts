import { searchCities } from "../api/geocoding.ts";
import { selectCity } from "../presentation/input.ts";
import { messages } from "../presentation/messages.ts";
import { withCityAdded, withDefaultCity } from "../storage/citiesStorage.ts";
import type { AppContext } from "../types/AppContext.ts";
import { cityLabel } from "../utils/format.ts";

export async function addCity(context: AppContext): Promise<void> {
  const name = (await context.ask(messages.cityName)).trim();
  if (!name) return;

  context.print(context.theme.muted(messages.loading.search));
  const results = await searchCities(name, context.fetchImpl);
  const [onlyResult] = results;
  if (!onlyResult) {
    context.print(context.theme.muted(messages.noResults(name)));
    return;
  }

  const city = results.length === 1 ? onlyResult : await selectCity(context, results, messages.chooseCity);
  if (!city) return;

  if (context.store.cities.some(({ id }) => id === city.id)) {
    context.print(context.theme.muted(messages.cityExists(cityLabel(city))));
    return;
  }

  let nextStore = withCityAdded(context.store, city);
  if (context.store.cities.length === 0) nextStore = withDefaultCity(nextStore, city.id);

  context.store = nextStore;
  await context.save();
  context.print(context.theme.success(messages.cityAdded(cityLabel(city))));
}
