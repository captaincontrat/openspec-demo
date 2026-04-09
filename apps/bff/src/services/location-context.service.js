import { config } from "../config.js";
import { adaptLocationResponse } from "../adapters/location-context.adapter.js";

export async function fetchLocation(lat, lon) {
  try {
    const url = new URL("/api/location", config.services.locationContext);
    url.searchParams.set("lat", lat);
    url.searchParams.set("lon", lon);

    const res = await fetch(url, {
      signal: AbortSignal.timeout(config.fetchTimeout),
    });

    if (!res.ok) {
      return {
        status: "error",
        error: `location-context responded ${res.status}`,
      };
    }

    const json = await res.json();
    return { status: "ok", data: adaptLocationResponse(json) };
  } catch (err) {
    return {
      status: "error",
      error: err.name === "TimeoutError"
        ? "location-context-service timeout"
        : `location-context-service unavailable: ${err.message}`,
    };
  }
}
