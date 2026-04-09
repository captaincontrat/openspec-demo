import { config } from "../config.js";
import { adaptAirQualityResponse } from "../adapters/air-quality.adapter.js";

export async function fetchAirQuality(lat, lon) {
  try {
    const url = new URL("/air-quality/current", config.services.airQuality);
    url.searchParams.set("latitude", lat);
    url.searchParams.set("longitude", lon);

    const res = await fetch(url, {
      signal: AbortSignal.timeout(config.fetchTimeout),
    });

    if (!res.ok) {
      return {
        status: "error",
        error: `air-quality responded ${res.status}`,
      };
    }

    const json = await res.json();
    return { status: "ok", data: adaptAirQualityResponse(json) };
  } catch (err) {
    return {
      status: "error",
      error: err.name === "TimeoutError"
        ? "air-quality-service timeout"
        : `air-quality-service unavailable: ${err.message}`,
    };
  }
}
