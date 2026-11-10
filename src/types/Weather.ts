export interface WeatherReading {
  temperature: number;
  unit: string;
}

export interface ForecastDay {
  date: string;
  maximum: number;
  minimum: number;
}

export interface DailyForecast {
  unit: string;
  days: ForecastDay[];
}
