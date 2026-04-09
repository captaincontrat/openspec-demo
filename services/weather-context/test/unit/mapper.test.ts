import { describe, it, expect } from "vitest";
import { mapToDTO, describeWeatherCode } from "../../src/mapper.js";

describe("describeWeatherCode", () => {
  it("returns description for known codes", () => {
    expect(describeWeatherCode(0)).toBe("Clear sky");
    expect(describeWeatherCode(3)).toBe("Overcast");
    expect(describeWeatherCode(61)).toBe("Slight rain");
    expect(describeWeatherCode(95)).toBe("Thunderstorm");
  });

  it("returns 'Unknown' for unmapped codes", () => {
    expect(describeWeatherCode(4)).toBe("Unknown");
    expect(describeWeatherCode(100)).toBe("Unknown");
  });
});

describe("mapToDTO", () => {
  const validRaw = {
    current: {
      time: "2026-04-09T06:15",
      temperature_2m: 14.4,
      relative_humidity_2m: 86,
      wind_speed_10m: 4.7,
      precipitation: 0.0,
      weather_code: 3,
    },
  };

  it("maps a valid Open-Meteo response to DTO", () => {
    const dto = mapToDTO(34.05, -118.24, validRaw);
    expect(dto).toEqual({
      lat: 34.05,
      lon: -118.24,
      temperature_c: 14.4,
      humidity_pct: 86,
      wind_speed_kmh: 4.7,
      precipitation_mm: 0.0,
      weather_code: 3,
      weather_description: "Overcast",
      observed_at: "2026-04-09T06:15",
    });
  });

  it("defaults optional fields to zero/empty when missing", () => {
    const partial = {
      current: {
        temperature_2m: 10,
        weather_code: 0,
      },
    };
    const dto = mapToDTO(0, 0, partial);
    expect(dto.humidity_pct).toBe(0);
    expect(dto.wind_speed_kmh).toBe(0);
    expect(dto.precipitation_mm).toBe(0);
    expect(dto.observed_at).toBe("");
  });

  it("throws on missing current block", () => {
    expect(() => mapToDTO(0, 0, {})).toThrow("upstream_invalid_response");
  });

  it("throws on missing temperature_2m", () => {
    expect(() => mapToDTO(0, 0, { current: { weather_code: 0 } as any })).toThrow("upstream_invalid_response");
  });
});
