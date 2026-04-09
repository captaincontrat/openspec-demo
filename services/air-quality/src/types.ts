export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface AirQualityMetric {
  value: number;
  unit: "ug/m3";
}

export interface CurrentAirQualityResponse {
  location: LocationCoordinates;
  observedAt: string;
  airQuality: {
    europeanAqi: number;
    pm10: AirQualityMetric;
    pm2_5: AirQualityMetric;
  };
  source: "open-meteo";
}

export interface AirQualityClient {
  getCurrentAirQuality(
    coordinates: LocationCoordinates,
  ): Promise<CurrentAirQualityResponse>;
}
