import { fetchDailyForecast } from "../api/weather.ts";
import { renderForecast } from "../presentation/forecast.ts";
import { selectCity } from "../presentation/input.ts";
import { messages } from "../presentation/messages.ts";
import type { AppContext } from "../types/AppContext.ts";
import { cityLabel } from "../utils/format.ts";

export async function getForecast(context: AppContext): Promise<void> {
  const { cities } = context.store;
  if (cities.length === 0) {
    context.print(context.theme.muted(messages.noCities));
    return;
  }

  const city = await selectCity(context, cities, messages.chooseCity);
  if (!city) return;

  context.print(context.theme.muted(messages.loading.forecast));
  const forecast = await fetchDailyForecast(city, context.store.unit, context.fetchImpl);
  context.print(renderForecast(cityLabel(city), forecast, context.theme));
}
