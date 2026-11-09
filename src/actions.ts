import type { AppContext } from "./context.ts";
import { errorMessage } from "./errors.ts";
import { renderForecast } from "./forecast.ts";
import { cityLabel, unitSymbol } from "./format.ts";
import { messages } from "./messages.ts";
import {
  findDefaultCity,
  withCityAdded,
  withCityRemoved,
  withDefaultCity,
  withUnit,
} from "./store.ts";
import type { City } from "./types.ts";
import { fetchDailyForecast, fetchWeather, searchCities } from "./weather.ts";

export async function showDefaultWeather(context: AppContext): Promise<void> {
  const city = findDefaultCity(context.store);
  if (!city) {
    context.print(context.theme.muted(messages.noDefaultCity));
    return;
  }

  context.print(await describeWeather(context, city));
}

export async function showAllWeather(context: AppContext): Promise<void> {
  const { cities } = context.store;
  if (cities.length === 0) {
    context.print(context.theme.muted(messages.noCities));
    return;
  }

  for (const city of cities) {
    try {
      context.print(await describeWeather(context, city));
    } catch (error) {
      context.print(context.theme.error(`${cityLabel(city)}: ${errorMessage(error)}`));
    }
  }
}

export async function searchAndAddCity(context: AppContext): Promise<void> {
  const name = (await context.ask(messages.cityName)).trim();
  if (!name) return;

  context.print(context.theme.muted(messages.loading.search));
  const results = await searchCities(name, context.fetchImpl);
  const [onlyResult] = results;
  if (!onlyResult) {
    context.print(context.theme.muted(messages.noResults(name)));
    return;
  }

  const city = results.length === 1 ? onlyResult : await chooseCity(context, results, messages.chooseCity);
  if (!city) return;

  if (context.store.cities.some(({ id }) => id === city.id)) {
    context.print(context.theme.muted(messages.cityExists(cityLabel(city))));
    return;
  }

  const isFirstCity = context.store.cities.length === 0;
  let nextStore = withCityAdded(context.store, city);
  if (isFirstCity) nextStore = withDefaultCity(nextStore, city.id);

  context.store = nextStore;
  await context.save();
  context.print(context.theme.success(messages.cityAdded(cityLabel(city))));
}

export async function deleteCity(context: AppContext): Promise<void> {
  const { cities } = context.store;
  if (cities.length === 0) {
    context.print(context.theme.muted(messages.noCities));
    return;
  }

  const city = await chooseCity(context, cities, messages.chooseCity);
  if (!city) return;

  context.store = withCityRemoved(context.store, city.id);
  await context.save();
  context.print(context.theme.success(messages.cityRemoved(cityLabel(city))));
}

export async function setDefaultCity(context: AppContext): Promise<void> {
  const { cities } = context.store;
  if (cities.length === 0) {
    context.print(context.theme.muted(messages.noCities));
    return;
  }

  const city = await chooseCity(context, cities, messages.chooseCity);
  if (!city) return;

  context.store = withDefaultCity(context.store, city.id);
  await context.save();
  context.print(context.theme.success(messages.defaultCitySet(cityLabel(city))));
}

export async function toggleUnit(context: AppContext): Promise<void> {
  const unit = context.store.unit === "celsius" ? "fahrenheit" : "celsius";
  context.store = withUnit(context.store, unit);
  await context.save();
  context.print(context.theme.success(messages.unitChanged(unitSymbol(unit))));
}

export async function showSevenDayForecast(context: AppContext): Promise<void> {
  const { cities } = context.store;
  if (cities.length === 0) {
    context.print(context.theme.muted(messages.noCities));
    return;
  }

  const city = await chooseCity(context, cities, messages.chooseCity);
  if (!city) return;

  context.print(context.theme.muted(messages.loading.forecast));
  const forecast = await fetchDailyForecast(city, context.store.unit, context.fetchImpl);
  context.print(renderForecast(cityLabel(city), forecast, context.theme));
}

async function describeWeather(context: AppContext, city: City): Promise<string> {
  context.print(context.theme.muted(messages.loading.weather));
  const reading = await fetchWeather(city, context.store.unit, context.fetchImpl);
  const temperature = context.theme.temperature(`${reading.temperature} ${reading.unit}`);
  return messages.weather(cityLabel(city), temperature);
}

async function chooseCity(
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
