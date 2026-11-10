import type { WeatherReading } from "../types/Weather.ts";
import type { Theme } from "../utils/colors.ts";
import { messages } from "./messages.ts";

export function createPrinter(output: NodeJS.WritableStream): (text: string) => void {
  return (text) => output.write(`${text}\n`);
}

export function renderWeather(label: string, reading: WeatherReading, theme: Theme): string {
  const temperature = theme.temperature(`${reading.temperature} ${reading.unit}`);
  return messages.weather(label, temperature);
}
