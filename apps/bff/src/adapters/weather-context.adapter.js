export function adaptWeatherResponse(raw) {
  const src = raw?.weather || raw?.current || raw?.data || raw || {};

  return {
    temperature:
      src.temperature ?? src.temp ?? src.temperature_2m ?? src.temperature_c ?? null,
    humidity:
      src.humidity ?? src.relative_humidity ?? src.relativehumidity_2m ?? src.humidity_pct ?? null,
    windSpeed:
      src.windSpeed ?? src.wind_speed ?? src.windspeed_10m ?? src.wind_speed_kmh ?? null,
    windDirection:
      src.windDirection ?? src.wind_direction ?? src.winddirection_10m ?? null,
    description:
      src.description ?? src.weatherDescription ?? src.summary ?? src.weather_description ?? null,
    unit: src.unit || "metric",
  };
}
