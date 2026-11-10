import type { DailyForecast } from "../types/Weather.ts";
import type { Theme } from "../utils/colors.ts";
import { formatShortDate } from "../utils/format.ts";
import { messages } from "./messages.ts";

const DATE_WIDTH = 12;

export function renderForecast(label: string, forecast: DailyForecast, theme: Theme): string {
  const lines = [theme.title(messages.forecast.header(label))];

  for (const day of forecast.days) {
    const maximum = theme.temperature(`${day.maximum} ${forecast.unit}`);
    const minimum = theme.temperature(`${day.minimum} ${forecast.unit}`);
    lines.push(messages.forecast.row(formatDate(day.date), maximum, minimum));
  }

  return lines.join("\n");
}

function formatDate(date: string): string {
  return formatShortDate(date).padEnd(DATE_WIDTH);
}
