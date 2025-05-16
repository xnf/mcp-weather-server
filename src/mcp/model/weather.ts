import { z } from "zod";

// Define the units schema
export const UnitsSchema = z.object({
  air_pressure_at_sea_level: z.string(),
  air_temperature: z.string(),
  cloud_area_fraction: z.string(),
  precipitation_amount: z.string(),
  relative_humidity: z.string(),
  wind_from_direction: z.string(),
  wind_speed: z.string(),
});

// Define the meta schema
export const MetaSchema = z.object({
  updated_at: z.string(),
  units: UnitsSchema,
});

// Define the instant details schema
export const InstantDetailsSchema = z.object({
  air_pressure_at_sea_level: z.number(),
  air_temperature: z.number(),
  cloud_area_fraction: z.number(),
  relative_humidity: z.number(),
  wind_from_direction: z.number(),
  wind_speed: z.number(),
});

// Define the summary schema
export const SummarySchema = z.object({
  symbol_code: z.string(),
});

// Define the forecast details schema
export const ForecastDetailsSchema = z.object({
  precipitation_amount: z.number().optional(),
});

// Define the forecast period schema
export const ForecastPeriodSchema = z.object({
  summary: SummarySchema,
  details: ForecastDetailsSchema,
});

// Define the time series data schema
export const TimeSeriesDataSchema = z.object({
  instant: z.object({
    details: InstantDetailsSchema,
  }),
  next_1_hours: ForecastPeriodSchema.optional(),
  next_6_hours: ForecastPeriodSchema.optional(),
  next_12_hours: ForecastPeriodSchema.optional(),
});

// Define the time series entry schema
export const TimeSeriesEntrySchema = z.object({
  time: z.string(),
  data: TimeSeriesDataSchema,
});

// Define the properties schema
export const PropertiesSchema = z.object({
  meta: MetaSchema,
  timeseries: z.array(TimeSeriesEntrySchema),
});

// Define the geometry schema
export const GeometrySchema = z.object({
  type: z.literal("Point"),
  coordinates: z.tuple([z.number(), z.number(), z.number()]),
});

// Define the complete weather feature schema
export const WeatherFeatureSchema = z.object({
  type: z.literal("Feature"),
  geometry: GeometrySchema,
  properties: PropertiesSchema,
});

// Export types
export type Units = z.infer<typeof UnitsSchema>;
export type Meta = z.infer<typeof MetaSchema>;
export type InstantDetails = z.infer<typeof InstantDetailsSchema>;
export type Summary = z.infer<typeof SummarySchema>;
export type ForecastDetails = z.infer<typeof ForecastDetailsSchema>;
export type ForecastPeriod = z.infer<typeof ForecastPeriodSchema>;
export type TimeSeriesData = z.infer<typeof TimeSeriesDataSchema>;
export type TimeSeriesEntry = z.infer<typeof TimeSeriesEntrySchema>;
export type Properties = z.infer<typeof PropertiesSchema>;
export type Geometry = z.infer<typeof GeometrySchema>;
export type WeatherFeature = z.infer<typeof WeatherFeatureSchema>;
