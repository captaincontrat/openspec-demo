import { config } from "../config.js";
import { adaptWeatherResponse } from "../adapters/weather-context.adapter.js";

export async function fetchWeather(lat, lon) {
  try {
    const url = new URL("/api/weather", config.services.weatherContext);
    url.searchParams.set("lat", lat);
    url.searchParams.set("lon", lon);

    const res = await fetch(url, {
      signal: AbortSignal.timeout(config.fetchTimeout),
    });

    if (!res.ok) {
      return {
        status: "error",
        error: `weather-context responded ${res.status}`,
      };
    }

    const json = await res.json();
    return { status: "ok", data: adaptWeatherResponse(json) };
  } catch (err) {
    return {
      status: "error",
      error: err.name === "TimeoutError"
        ? "weather-context-service timeout"
        : `weather-context-service unavailable: ${err.message}`,
    };
  }
}
