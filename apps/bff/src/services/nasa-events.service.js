import { config } from "../config.js";
import { adaptNasaEventsResponse } from "../adapters/nasa-events.adapter.js";

export async function fetchEvents(queryParams = {}) {
  try {
    const url = new URL("/events", config.services.nasaEvents);
    for (const [key, value] of Object.entries(queryParams)) {
      if (value) url.searchParams.set(key, value);
    }

    const res = await fetch(url, {
      signal: AbortSignal.timeout(config.fetchTimeout),
    });

    if (!res.ok) {
      return { status: "error", error: `nasa-events responded ${res.status}` };
    }

    const json = await res.json();
    return { status: "ok", data: adaptNasaEventsResponse(json) };
  } catch (err) {
    return {
      status: "error",
      error: err.name === "TimeoutError"
        ? "nasa-events-service timeout"
        : `nasa-events-service unavailable: ${err.message}`,
    };
  }
}
