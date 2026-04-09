const WMO_DESCRIPTIONS: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snowfall",
  73: "Moderate snowfall",
  75: "Heavy snowfall",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

export function describeWeatherCode(code: number): string {
  return WMO_DESCRIPTIONS[code] ?? "Unknown";
}

export interface WeatherDTO {
  lat: number;
  lon: number;
  temperature_c: number;
  humidity_pct: number;
  wind_speed_kmh: number;
  precipitation_mm: number;
  weather_code: number;
  weather_description: string;
  observed_at: string;
}

export interface OpenMeteoCurrentResponse {
  current?: {
    time?: string;
    temperature_2m?: number;
    relative_humidity_2m?: number;
    wind_speed_10m?: number;
    precipitation?: number;
    weather_code?: number;
  };
}

export function mapToDTO(
  lat: number,
  lon: number,
  raw: OpenMeteoCurrentResponse,
): WeatherDTO {
  const c = raw.current;
  if (!c || c.temperature_2m === undefined || c.weather_code === undefined) {
    throw new Error("upstream_invalid_response");
  }

  return {
    lat,
    lon,
    temperature_c: c.temperature_2m,
    humidity_pct: c.relative_humidity_2m ?? 0,
    wind_speed_kmh: c.wind_speed_10m ?? 0,
    precipitation_mm: c.precipitation ?? 0,
    weather_code: c.weather_code,
    weather_description: describeWeatherCode(c.weather_code),
    observed_at: c.time ?? "",
  };
}
