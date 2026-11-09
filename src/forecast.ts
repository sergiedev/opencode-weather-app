import type { Theme } from "./colors.ts";
import { messages } from "./messages.ts";
import type { DailyForecast } from "./weather.ts";

const DATE_FORMAT = new Intl.DateTimeFormat("es-ES", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  timeZone: "UTC",
});

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
  const parsed = new Date(`${date}T12:00:00Z`);
  const formatted = Number.isNaN(parsed.getTime()) ? date : DATE_FORMAT.format(parsed);
  return formatted.padEnd(DATE_WIDTH);
}
