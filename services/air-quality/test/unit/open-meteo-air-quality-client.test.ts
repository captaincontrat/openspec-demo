import { describe, expect, it, vi } from "vitest";

import { UpstreamResponseError } from "../../src/errors.js";
import { createOpenMeteoAirQualityClient } from "../../src/lib/open-meteo-air-quality-client.js";

describe("createOpenMeteoAirQualityClient", () => {
  it("requests the current metrics needed by the BFF and maps the response", async () => {
    const fetchImpl = vi.fn(async (input: URL | string | Request) => {
      expect(input).toBeInstanceOf(URL);

      const url = input as URL;
      expect(url.pathname).toBe("/v1/air-quality");
      expect(url.searchParams.get("latitude")).toBe("48.8566");
      expect(url.searchParams.get("longitude")).toBe("2.3522");
      expect(url.searchParams.get("current")).toBe("european_aqi,pm10,pm2_5");
      expect(url.searchParams.get("timezone")).toBe("auto");

      return new Response(
        JSON.stringify({
          latitude: 48.9,
          longitude: 2.3,
          current: {
            time: "2026-04-09T15:00",
            european_aqi: 38,
            pm10: 5.4,
            pm2_5: 4.3,
          },
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      );
    });

    const client = createOpenMeteoAirQualityClient({
      baseUrl: "https://example.com/v1",
      timeoutMs: 1000,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    await expect(
      client.getCurrentAirQuality({
        latitude: 48.8566,
        longitude: 2.3522,
      }),
    ).resolves.toEqual({
      location: {
        latitude: 48.9,
        longitude: 2.3,
      },
      observedAt: "2026-04-09T15:00",
      airQuality: {
        europeanAqi: 38,
        pm10: {
          value: 5.4,
          unit: "ug/m3",
        },
        pm2_5: {
          value: 4.3,
          unit: "ug/m3",
        },
      },
      source: "open-meteo",
    });
  });

  it("rejects malformed upstream payloads", async () => {
    const fetchImpl = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          latitude: 48.9,
          longitude: 2.3,
          current: {
            time: "2026-04-09T15:00",
            pm10: 5.4,
          },
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      );
    });

    const client = createOpenMeteoAirQualityClient({
      baseUrl: "https://example.com/v1",
      timeoutMs: 1000,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    await expect(
      client.getCurrentAirQuality({
        latitude: 48.8566,
        longitude: 2.3522,
      }),
    ).rejects.toBeInstanceOf(UpstreamResponseError);
  });
});
