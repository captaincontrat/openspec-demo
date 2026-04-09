import type { OpenMeteoCurrentResponse } from "./mapper.js";

const BASE_URL = "https://api.open-meteo.com/v1/forecast";
const CURRENT_FIELDS = "temperature_2m,wind_speed_10m,weather_code,relative_humidity_2m,precipitation";
const TIMEOUT_MS = 5_000;

export async function fetchWeather(lat: number, lon: number): Promise<OpenMeteoCurrentResponse> {
  const url = `${BASE_URL}?latitude=${lat}&longitude=${lon}&current=${CURRENT_FIELDS}&timezone=auto`;

  let response: Response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch {
    throw new Error("upstream_unavailable");
  }

  if (!response.ok) {
    throw new Error("upstream_unavailable");
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new Error("upstream_invalid_response");
  }

  return body as OpenMeteoCurrentResponse;
}
