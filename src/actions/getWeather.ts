import { fetchWeather } from "../api/weather.ts";
import { messages } from "../presentation/messages.ts";
import { renderWeather } from "../presentation/output.ts";
import { findDefaultCity } from "../storage/citiesStorage.ts";
import type { AppContext } from "../types/AppContext.ts";
import type { City } from "../types/City.ts";
import { cityLabel } from "../utils/format.ts";

export async function getDefaultWeather(context: AppContext): Promise<void> {
  const city = findDefaultCity(context.store);
  if (!city) {
    context.print(context.theme.muted(messages.noDefaultCity));
    return;
  }

  context.print(await getCityWeather(context, city));
}

export async function getCityWeather(context: AppContext, city: City): Promise<string> {
  context.print(context.theme.muted(messages.loading.weather));
  const reading = await fetchWeather(city, context.store.unit, context.fetchImpl);
  return renderWeather(cityLabel(city), reading, context.theme);
}
