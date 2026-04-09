export function adaptAirQualityResponse(raw) {
  const src = raw?.airQuality || raw?.air_quality || raw?.data || raw || {};

  return {
    aqi: src.aqi ?? src.us_aqi ?? src.european_aqi ?? null,
    pm25: src.pm25 ?? src.pm2_5 ?? src.pm25_concentration ?? null,
    pm10: src.pm10 ?? src.pm10_concentration ?? null,
    no2: src.no2 ?? src.nitrogen_dioxide ?? null,
    o3: src.o3 ?? src.ozone ?? null,
  };
}
