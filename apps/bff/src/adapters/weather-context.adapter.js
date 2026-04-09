export function adaptWeatherResponse(raw) {
  const src = raw?.weather || raw?.current || raw?.data || raw || {};

  return {
    temperature: src.temperature ?? src.temp ?? src.temperature_2m ?? null,
    humidity:
      src.humidity ?? src.relative_humidity ?? src.relativehumidity_2m ?? null,
    windSpeed: src.windSpeed ?? src.wind_speed ?? src.windspeed_10m ?? null,
    windDirection:
      src.windDirection ??
      src.wind_direction ??
      src.winddirection_10m ??
      null,
    description:
      src.description ?? src.weatherDescription ?? src.summary ?? null,
    unit: src.unit || "metric",
  };
}
