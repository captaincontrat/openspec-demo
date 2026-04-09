function extractValue(raw) {
  if (raw == null) return null;
  if (typeof raw === "number") return raw;
  if (typeof raw === "object" && raw.value != null) return raw.value;
  return null;
}

export function adaptAirQualityResponse(raw) {
  const src = raw?.airQuality || raw?.air_quality || raw?.data || raw || {};

  return {
    aqi: src.aqi ?? src.us_aqi ?? src.european_aqi ?? src.europeanAqi ?? null,
    pm25: extractValue(src.pm25 ?? src.pm2_5 ?? src.pm25_concentration),
    pm10: extractValue(src.pm10 ?? src.pm10_concentration),
    no2: src.no2 ?? src.nitrogen_dioxide ?? null,
    o3: src.o3 ?? src.ozone ?? null,
  };
}
