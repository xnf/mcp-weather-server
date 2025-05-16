import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { WeatherContext } from "../context/weather";

// Initialize tRPC
const t = initTRPC.create();

// Create router and procedure
export const router = t.router;
export const publicProcedure = t.procedure;

// Type definitions for weather data
interface WeatherTimeSeries {
  time: string;
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
  windDirection?: number;
  precipitation?: number;
  cloudCover?: number;
  pressure?: number;
  data?: {
    instant: {
      details: {
        air_temperature: number;
        relative_humidity: number;
        wind_speed: number;
        wind_from_direction: number;
        cloud_area_fraction: number;
        air_pressure_at_sea_level: number;
      };
    };
  };
}

// Helper function to interpret natural language queries
function interpretNaturalLanguageQuery(query: string): string {
  // Common query patterns and their interpretations
  const patterns = [
    // English patterns
    {
      pattern: /temperature|temp/i,
      interpretation:
        "data.properties.timeseries.map(t => ({ time: t.time, temperature: t.data.instant.details.air_temperature }))",
    },
    {
      pattern: /humidity/i,
      interpretation:
        "data.properties.timeseries.map(t => ({ time: t.time, humidity: t.data.instant.details.relative_humidity }))",
    },
    {
      pattern: /wind/i,
      interpretation:
        "data.properties.timeseries.map(t => ({ time: t.time, windSpeed: t.data.instant.details.wind_speed, windDirection: t.data.instant.details.wind_from_direction }))",
    },
    {
      pattern: /rain|precipitation/i,
      interpretation:
        "data.properties.timeseries.filter(t => t.data.next_1_hours?.details.precipitation_amount > 0).map(t => ({ time: t.time, precipitation: t.data.next_1_hours.details.precipitation_amount }))",
    },
    {
      pattern: /cloud/i,
      interpretation:
        "data.properties.timeseries.map(t => ({ time: t.time, cloudCover: t.data.instant.details.cloud_area_fraction }))",
    },
    {
      pattern: /pressure/i,
      interpretation:
        "data.properties.timeseries.map(t => ({ time: t.time, pressure: t.data.instant.details.air_pressure_at_sea_level }))",
    },
    {
      pattern: /current|now/i,
      interpretation: "data.properties.timeseries[0]",
    },
    {
      pattern: /next (\d+) hours/i,
      interpretation: (match: RegExpMatchArray) =>
        `data.properties.timeseries.slice(0, ${match[1]})`,
    },

    // Latvian patterns
    {
      pattern: /temperatūra|temperatura/i,
      interpretation:
        "data.properties.timeseries.map(t => ({ time: t.time, temperature: t.data.instant.details.air_temperature }))",
    },
    {
      pattern: /mitrums|mitruma/i,
      interpretation:
        "data.properties.timeseries.map(t => ({ time: t.time, humidity: t.data.instant.details.relative_humidity }))",
    },
    {
      pattern: /vējš|vejs|vēja|veja/i,
      interpretation:
        "data.properties.timeseries.map(t => ({ time: t.time, windSpeed: t.data.instant.details.wind_speed, windDirection: t.data.instant.details.wind_from_direction }))",
    },
    {
      pattern: /lietus|lietus|nokrišņi|nokrisni/i,
      interpretation:
        "data.properties.timeseries.filter(t => t.data.next_1_hours?.details.precipitation_amount > 0).map(t => ({ time: t.time, precipitation: t.data.next_1_hours.details.precipitation_amount }))",
    },
    {
      pattern: /mākoņi|makoni|mākoņainība|makonainiba/i,
      interpretation:
        "data.properties.timeseries.map(t => ({ time: t.time, cloudCover: t.data.instant.details.cloud_area_fraction }))",
    },
    {
      pattern: /spiediens/i,
      interpretation:
        "data.properties.timeseries.map(t => ({ time: t.time, pressure: t.data.instant.details.air_pressure_at_sea_level }))",
    },
    {
      pattern: /pašreiz|pasreiz|tagad|šobrīd|sobrid/i,
      interpretation: "data.properties.timeseries[0]",
    },
    {
      pattern: /nākamās? (\d+) stundas?|nakamas? (\d+) stundas?/i,
      interpretation: (match: RegExpMatchArray) =>
        `data.properties.timeseries.slice(0, ${match[1]})`,
    },
    {
      pattern: /kāds|kads|kāda|kada/i,
      interpretation: "data.properties.timeseries[0]",
    },
  ];

  // Find matching patterns and combine their interpretations
  const interpretations = patterns
    .filter((p) => p.pattern.test(query))
    .map((p) =>
      typeof p.interpretation === "function"
        ? p.interpretation(query.match(p.pattern)!)
        : p.interpretation
    );

  if (interpretations.length === 0) {
    return "data.properties.timeseries[0]"; // Default to current weather if no patterns match
  }

  // If multiple patterns match, combine them
  if (interpretations.length > 1) {
    return `[${interpretations.join(", ")}]`;
  }

  return interpretations[0];
}

// Helper function to generate human-readable responses
function generateHumanReadableResponse(
  query: string,
  result: WeatherTimeSeries | WeatherTimeSeries[] | unknown,
  _interpretedQuery: string
): { en: string; lv: string } {
  // Type guard for time series array
  const isTimeSeries = (data: unknown): data is WeatherTimeSeries[] =>
    Array.isArray(data) && data.length > 0 && "time" in data[0];

  // Type guard for single time series
  const isSingleTimeSeries = (data: unknown): data is WeatherTimeSeries =>
    typeof data === "object" && data !== null && "time" in data;

  // Helper to format temperature
  const formatTemp = (temp: number) => `${temp.toFixed(1)}°C`;

  // Helper to format time
  const formatTime = (time: string) =>
    new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  // Check if result is an array of time series data
  const timeSeriesData = isTimeSeries(result)
    ? result
    : isSingleTimeSeries(result)
    ? [result]
    : null;

  // English responses
  const enResponses: { [key: string]: string } = {
    temperature: timeSeriesData
      ? `The temperature will be ${formatTemp(
          timeSeriesData[0].temperature ?? 0
        )} at ${formatTime(timeSeriesData[0].time)}`
      : "Temperature data not available",
    humidity: timeSeriesData
      ? `The humidity will be ${
          timeSeriesData[0].humidity ?? 0
        }% at ${formatTime(timeSeriesData[0].time)}`
      : "Humidity data not available",
    wind: timeSeriesData
      ? `The wind speed will be ${timeSeriesData[0].windSpeed ?? 0} m/s from ${
          timeSeriesData[0].windDirection ?? 0
        }° at ${formatTime(timeSeriesData[0].time)}`
      : "Wind data not available",
    rain: timeSeriesData
      ? timeSeriesData.length > 0 && timeSeriesData[0].precipitation
        ? `Rain is expected at ${formatTime(timeSeriesData[0].time)} with ${
            timeSeriesData[0].precipitation
          }mm of precipitation`
        : "No rain is expected in the next period"
      : "Rain data not available",
    cloud: timeSeriesData
      ? `The cloud cover will be ${
          timeSeriesData[0].cloudCover ?? 0
        }% at ${formatTime(timeSeriesData[0].time)}`
      : "Cloud data not available",
    pressure: timeSeriesData
      ? `The pressure will be ${
          timeSeriesData[0].pressure ?? 0
        } hPa at ${formatTime(timeSeriesData[0].time)}`
      : "Pressure data not available",
    current:
      timeSeriesData && timeSeriesData[0].data
        ? `Current weather conditions: Temperature ${formatTemp(
            timeSeriesData[0].data.instant.details.air_temperature
          )}°C, ` +
          `Humidity ${timeSeriesData[0].data.instant.details.relative_humidity}%, ` +
          `Wind ${timeSeriesData[0].data.instant.details.wind_speed} m/s from ${timeSeriesData[0].data.instant.details.wind_from_direction}°`
        : "Current weather data not available",
  };

  // Latvian responses
  const lvResponses: { [key: string]: string } = {
    temperature: timeSeriesData
      ? `Temperatūra būs ${formatTemp(
          timeSeriesData[0].temperature ?? 0
        )} plkst. ${formatTime(timeSeriesData[0].time)}`
      : "Temperatūras dati nav pieejami",
    humidity: timeSeriesData
      ? `Mitrums būs ${timeSeriesData[0].humidity ?? 0}% plkst. ${formatTime(
          timeSeriesData[0].time
        )}`
      : "Mitruma dati nav pieejami",
    wind: timeSeriesData
      ? `Vēja ātrums būs ${timeSeriesData[0].windSpeed ?? 0} m/s no ${
          timeSeriesData[0].windDirection ?? 0
        }° virziena plkst. ${formatTime(timeSeriesData[0].time)}`
      : "Vēja dati nav pieejami",
    rain: timeSeriesData
      ? timeSeriesData.length > 0 && timeSeriesData[0].precipitation
        ? `Lietus paredzams plkst. ${formatTime(timeSeriesData[0].time)} ar ${
            timeSeriesData[0].precipitation
          }mm nokrišņiem`
        : "Nākamajā periodā lietus nav paredzams"
      : "Lietus dati nav pieejami",
    cloud: timeSeriesData
      ? `Mākoņainība būs ${
          timeSeriesData[0].cloudCover ?? 0
        }% plkst. ${formatTime(timeSeriesData[0].time)}`
      : "Mākoņu dati nav pieejami",
    pressure: timeSeriesData
      ? `Spiediens būs ${
          timeSeriesData[0].pressure ?? 0
        } hPa plkst. ${formatTime(timeSeriesData[0].time)}`
      : "Spiediena dati nav pieejami",
    current:
      timeSeriesData && timeSeriesData[0].data
        ? `Pašreizējie laika apstākļi: Temperatūra ${formatTemp(
            timeSeriesData[0].data.instant.details.air_temperature
          )}°C, ` +
          `Mitrums ${timeSeriesData[0].data.instant.details.relative_humidity}%, ` +
          `Vējš ${timeSeriesData[0].data.instant.details.wind_speed} m/s no ${timeSeriesData[0].data.instant.details.wind_from_direction}° virziena`
        : "Pašreizējie laika apstākļu dati nav pieejami",
  };

  // Determine which response to use based on the query
  const queryType = /temperature|temp|temperatūra|temperatura/i.test(query)
    ? "temperature"
    : /humidity|mitrums|mitruma/i.test(query)
    ? "humidity"
    : /wind|vējš|vejs|vēja|veja/i.test(query)
    ? "wind"
    : /rain|precipitation|lietus|nokrišņi|nokrisni/i.test(query)
    ? "rain"
    : /cloud|mākoņi|makoni|mākoņainība|makonainiba/i.test(query)
    ? "cloud"
    : /pressure|spiediens/i.test(query)
    ? "pressure"
    : "current";

  return {
    en: enResponses[queryType] || "Here is the weather data you requested.",
    lv: lvResponses[queryType] || "Šeit ir pieprasītie laika apstākļu dati.",
  };
}

// Create weather router
export const weatherRouter = router({
  getCurrentWeather: publicProcedure.query(async () => {
    const weatherContext = new WeatherContext(
      process.env.WEATHER_API_URL ||
        "https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=56.9496&lon=24.1052",
      process.env.WEATHER_API_KEY || ""
    );

    const forecast = await weatherContext.getWeatherForecast();
    return weatherContext.getCurrentWeather(forecast);
  }),

  getHourlyForecast: publicProcedure
    .input(
      z.object({
        hours: z.number().min(1).max(48).default(24),
      })
    )
    .query(async ({ input }) => {
      const weatherContext = new WeatherContext(
        process.env.WEATHER_API_URL ||
          "https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=56.9496&lon=24.1052",
        process.env.WEATHER_API_KEY || ""
      );

      const forecast = await weatherContext.getWeatherForecast();
      return weatherContext.getHourlyForecast(forecast, input.hours);
    }),

  queryWeatherData: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const weatherContext = new WeatherContext(
        process.env.WEATHER_API_URL ||
          "https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=56.9496&lon=24.1052",
        process.env.WEATHER_API_KEY || ""
      );

      const forecast = await weatherContext.getWeatherForecast();
      try {
        // Parse the query as JSON and evaluate it against the forecast data
        const queryFn = new Function("data", `return ${input.query}`);
        return queryFn(forecast);
      } catch (error) {
        throw new Error(
          `Invalid query: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }),

  naturalLanguageQuery: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const weatherContext = new WeatherContext(
        process.env.WEATHER_API_URL ||
          "https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=56.9496&lon=24.1052",
        process.env.WEATHER_API_KEY || ""
      );

      const forecast = await weatherContext.getWeatherForecast();
      try {
        const interpretedQuery = interpretNaturalLanguageQuery(input.query);
        const queryFn = new Function("data", `return ${interpretedQuery}`);
        const result = queryFn(forecast);
        const humanReadable = generateHumanReadableResponse(
          input.query,
          result,
          interpretedQuery
        );

        return {
          originalQuery: input.query,
          interpretedQuery,
          result,
          humanReadable,
        };
      } catch (error) {
        throw new Error(
          `Failed to process natural language query: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }),
});
