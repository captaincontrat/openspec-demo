import { describe, it, expect } from "vitest";
import { adaptWeatherResponse } from "../../../src/adapters/weather-context.adapter.js";

describe("weather-context adapter", () => {
  it("normalizes a standard contract response", () => {
    const raw = {
      weather: {
        temperature: 28.5,
        humidity: 45,
        windSpeed: 12.3,
        windDirection: 225,
        description: "Clear sky",
        unit: "metric",
      },
    };

    const result = adaptWeatherResponse(raw);

    expect(result).toEqual({
      temperature: 28.5,
      humidity: 45,
      windSpeed: 12.3,
      windDirection: 225,
      description: "Clear sky",
      unit: "metric",
    });
  });

  it("handles Open-Meteo style field names", () => {
    const raw = {
      current: {
        temperature_2m: 22.0,
        relativehumidity_2m: 60,
        windspeed_10m: 8.1,
        winddirection_10m: 180,
        summary: "Partly cloudy",
      },
    };

    const result = adaptWeatherResponse(raw);

    expect(result.temperature).toBe(22.0);
    expect(result.humidity).toBe(60);
    expect(result.windSpeed).toBe(8.1);
    expect(result.windDirection).toBe(180);
    expect(result.description).toBe("Partly cloudy");
  });

  it("handles snake_case variants", () => {
    const raw = {
      weather: {
        temp: 15.0,
        relative_humidity: 72,
        wind_speed: 5.5,
        wind_direction: 90,
      },
    };

    const result = adaptWeatherResponse(raw);

    expect(result.temperature).toBe(15.0);
    expect(result.humidity).toBe(72);
    expect(result.windSpeed).toBe(5.5);
    expect(result.windDirection).toBe(90);
  });

  it("returns nulls for missing fields", () => {
    const result = adaptWeatherResponse({});

    expect(result).toEqual({
      temperature: null,
      humidity: null,
      windSpeed: null,
      windDirection: null,
      description: null,
      unit: "metric",
    });
  });

  it("preserves zero values", () => {
    const raw = {
      weather: { temperature: 0, humidity: 0, windSpeed: 0, windDirection: 0 },
    };

    const result = adaptWeatherResponse(raw);

    expect(result.temperature).toBe(0);
    expect(result.humidity).toBe(0);
    expect(result.windSpeed).toBe(0);
    expect(result.windDirection).toBe(0);
  });
});
