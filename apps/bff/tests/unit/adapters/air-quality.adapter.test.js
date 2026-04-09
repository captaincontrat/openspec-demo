import { describe, it, expect } from "vitest";
import { adaptAirQualityResponse } from "../../../src/adapters/air-quality.adapter.js";

describe("air-quality adapter", () => {
  it("normalizes a standard contract response", () => {
    const raw = {
      airQuality: {
        aqi: 85,
        pm25: 22.1,
        pm10: 45.3,
        no2: 18.7,
        o3: 62.4,
      },
    };

    const result = adaptAirQualityResponse(raw);

    expect(result).toEqual({
      aqi: 85,
      pm25: 22.1,
      pm10: 45.3,
      no2: 18.7,
      o3: 62.4,
    });
  });

  it("normalizes actual air-quality service response (europeanAqi + object metrics)", () => {
    const raw = {
      location: { latitude: 34.05, longitude: -118.24 },
      observedAt: "2026-04-09T06:15:00Z",
      airQuality: {
        europeanAqi: 42,
        pm10: { value: 15.3, unit: "ug/m3" },
        pm2_5: { value: 8.7, unit: "ug/m3" },
      },
      source: "open-meteo",
    };

    const result = adaptAirQualityResponse(raw);

    expect(result.aqi).toBe(42);
    expect(result.pm25).toBe(8.7);
    expect(result.pm10).toBe(15.3);
    expect(result.no2).toBeNull();
    expect(result.o3).toBeNull();
  });

  it("handles snake_case wrapper and Open-Meteo field names", () => {
    const raw = {
      air_quality: {
        european_aqi: 42,
        pm2_5: 10.5,
        pm10: 30.0,
        nitrogen_dioxide: 15.2,
        ozone: 55.0,
      },
    };

    const result = adaptAirQualityResponse(raw);

    expect(result.aqi).toBe(42);
    expect(result.pm25).toBe(10.5);
    expect(result.pm10).toBe(30.0);
    expect(result.no2).toBe(15.2);
    expect(result.o3).toBe(55.0);
  });

  it("handles us_aqi variant", () => {
    const raw = {
      data: { us_aqi: 100, pm25: 35.0, pm10: 50.0 },
    };

    const result = adaptAirQualityResponse(raw);

    expect(result.aqi).toBe(100);
    expect(result.pm25).toBe(35.0);
  });

  it("returns nulls for missing fields", () => {
    const result = adaptAirQualityResponse({});

    expect(result).toEqual({
      aqi: null,
      pm25: null,
      pm10: null,
      no2: null,
      o3: null,
    });
  });

  it("handles null input", () => {
    const result = adaptAirQualityResponse(null);

    expect(result).toEqual({
      aqi: null,
      pm25: null,
      pm10: null,
      no2: null,
      o3: null,
    });
  });

  it("preserves zero values", () => {
    const raw = {
      airQuality: { aqi: 0, pm25: 0, pm10: 0, no2: 0, o3: 0 },
    };

    const result = adaptAirQualityResponse(raw);

    expect(result.aqi).toBe(0);
    expect(result.pm25).toBe(0);
  });
});
