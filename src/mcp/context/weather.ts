import axios from "axios";
import { WeatherFeature, WeatherFeatureSchema } from "../model/weather";

export class WeatherContext {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async getWeatherForecast(): Promise<WeatherFeature> {
    try {
      const response = await axios.get(`${this.baseUrl}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      // Validate the response data against our schema
      const validatedData = WeatherFeatureSchema.parse(response.data);
      return validatedData;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch weather data: ${error.message}`);
      }
      throw error;
    }
  }

  // Helper method to get current weather
  getCurrentWeather(forecast: WeatherFeature) {
    const currentTime = new Date().toISOString();
    const currentEntry = forecast.properties.timeseries.find(
      (entry) => new Date(entry.time) >= new Date(currentTime)
    );

    if (!currentEntry) {
      throw new Error("No current weather data available");
    }

    return {
      temperature: currentEntry.data.instant.details.air_temperature,
      humidity: currentEntry.data.instant.details.relative_humidity,
      windSpeed: currentEntry.data.instant.details.wind_speed,
      windDirection: currentEntry.data.instant.details.wind_from_direction,
      cloudCover: currentEntry.data.instant.details.cloud_area_fraction,
      pressure: currentEntry.data.instant.details.air_pressure_at_sea_level,
      nextHourForecast: currentEntry.data.next_1_hours,
      nextSixHoursForecast: currentEntry.data.next_6_hours,
      nextTwelveHoursForecast: currentEntry.data.next_12_hours,
    };
  }

  // Helper method to get hourly forecast for the next 24 hours
  getHourlyForecast(forecast: WeatherFeature, hours: number = 24) {
    const currentTime = new Date().toISOString();
    const futureEntries = forecast.properties.timeseries
      .filter((entry) => new Date(entry.time) >= new Date(currentTime))
      .slice(0, hours);

    return futureEntries.map((entry) => ({
      time: entry.time,
      temperature: entry.data.instant.details.air_temperature,
      humidity: entry.data.instant.details.relative_humidity,
      windSpeed: entry.data.instant.details.wind_speed,
      windDirection: entry.data.instant.details.wind_from_direction,
      cloudCover: entry.data.instant.details.cloud_area_fraction,
      pressure: entry.data.instant.details.air_pressure_at_sea_level,
      precipitation: entry.data.next_1_hours?.details.precipitation_amount ?? 0,
      symbol: entry.data.next_1_hours?.summary.symbol_code ?? "unknown",
    }));
  }
}
