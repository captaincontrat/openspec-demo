import { UpstreamResponseError, UpstreamTimeoutError } from "../errors.js";
import type {
  AirQualityClient,
  CurrentAirQualityResponse,
  LocationCoordinates,
} from "../types.js";
import { z } from "zod";

const openMeteoCurrentResponseSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  current: z.object({
    time: z.string(),
    european_aqi: z.number(),
    pm10: z.number(),
    pm2_5: z.number(),
  }),
});

type FetchImplementation = typeof fetch;

export interface OpenMeteoAirQualityClientOptions {
  baseUrl: string;
  timeoutMs: number;
  fetchImpl?: FetchImplementation;
}

export function createOpenMeteoAirQualityClient(
  options: OpenMeteoAirQualityClientOptions,
): AirQualityClient {
  const fetchImpl = options.fetchImpl ?? fetch;

  return {
    async getCurrentAirQuality(
      coordinates: LocationCoordinates,
    ): Promise<CurrentAirQualityResponse> {
      const url = new URL("air-quality", withTrailingSlash(options.baseUrl));
      url.searchParams.set("latitude", String(coordinates.latitude));
      url.searchParams.set("longitude", String(coordinates.longitude));
      url.searchParams.set("current", "european_aqi,pm10,pm2_5");
      url.searchParams.set("timezone", "auto");

      let response: Response;

      try {
        response = await fetchImpl(url, {
          signal: AbortSignal.timeout(options.timeoutMs),
          headers: {
            accept: "application/json",
          },
        });
      } catch (error) {
        if (isTimeoutLikeError(error)) {
          throw new UpstreamTimeoutError(undefined, error);
        }

        throw new UpstreamResponseError(
          "Unable to reach air quality provider",
          error,
        );
      }

      if (!response.ok) {
        throw new UpstreamResponseError(
          `Air quality provider returned HTTP ${response.status}`,
        );
      }

      let payload: unknown;

      try {
        payload = await response.json();
      } catch (error) {
        throw new UpstreamResponseError(
          "Air quality provider returned non-JSON data",
          error,
        );
      }

      const parsed = openMeteoCurrentResponseSchema.safeParse(payload);

      if (!parsed.success) {
        throw new UpstreamResponseError(
          "Air quality provider returned an invalid response",
          parsed.error.flatten(),
        );
      }

      return {
        location: {
          latitude: parsed.data.latitude,
          longitude: parsed.data.longitude,
        },
        observedAt: parsed.data.current.time,
        airQuality: {
          europeanAqi: parsed.data.current.european_aqi,
          pm10: {
            value: parsed.data.current.pm10,
            unit: "ug/m3",
          },
          pm2_5: {
            value: parsed.data.current.pm2_5,
            unit: "ug/m3",
          },
        },
        source: "open-meteo",
      };
    },
  };
}

function isTimeoutLikeError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === "AbortError" || error.name === "TimeoutError")
  );
}

function withTrailingSlash(baseUrl: string): string {
  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
}
