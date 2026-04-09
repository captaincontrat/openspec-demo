import {
  UpstreamBadResponseError,
  UpstreamServiceError,
} from "./errors.js";

const EONET_EVENTS_URL = "https://eonet.gsfc.nasa.gov/api/v3/events";

export function createNasaEonetClient({
  fetchImpl = globalThis.fetch,
  eventsUrl = EONET_EVENTS_URL,
} = {}) {
  if (typeof fetchImpl !== "function") {
    throw new TypeError("fetchImpl must be a function");
  }

  return {
    async fetchOpenEvents() {
      const url = new URL(eventsUrl);
      url.searchParams.set("status", "open");

      let response;

      try {
        response = await fetchImpl(url, {
          headers: {
            accept: "application/json",
          },
        });
      } catch {
        throw new UpstreamServiceError();
      }

      if (!response.ok) {
        throw new UpstreamBadResponseError(
          `NASA EONET returned status ${response.status}`,
        );
      }

      let payload;

      try {
        payload = await response.json();
      } catch {
        throw new UpstreamBadResponseError();
      }

      if (!payload || !Array.isArray(payload.events)) {
        throw new UpstreamBadResponseError();
      }

      return payload.events;
    },
  };
}
