import type { AddressInfo } from "node:net";

import { afterEach, describe, expect, it, vi } from "vitest";

import type { AppConfig } from "../../src/config.js";
import { UpstreamResponseError, UpstreamTimeoutError } from "../../src/errors.js";
import { buildApp } from "../../src/app.js";
import type { AirQualityClient, CurrentAirQualityResponse } from "../../src/types.js";

const testConfig: AppConfig = {
  port: 3004,
  host: "127.0.0.1",
  openMeteoBaseUrl: "https://example.com/v1",
  upstreamTimeoutMs: 1000,
  logLevel: "silent",
};

describe("air-quality-service e2e", () => {
  let cleanup: (() => Promise<void>) | undefined;

  afterEach(async () => {
    if (cleanup) {
      await cleanup();
      cleanup = undefined;
    }
  });

  it("starts successfully and serves GET /health", async () => {
    const baseUrl = await startServer({
      getCurrentAirQuality: async () => {
        throw new Error("not used");
      },
    });

    const response = await fetch(`${baseUrl}/health`);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      status: "ok",
      service: "air-quality-service",
    });
  });

  it("returns normalized current air quality data for valid coordinates", async () => {
    const baseUrl = await startServer({
      getCurrentAirQuality: async () =>
        sampleCurrentAirQualityResponse({
          latitude: 48.9,
          longitude: 2.3,
        }),
    });

    const response = await fetch(
      `${baseUrl}/air-quality/current?latitude=48.8566&longitude=2.3522`,
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(
      sampleCurrentAirQualityResponse({
        latitude: 48.9,
        longitude: 2.3,
      }),
    );
  });

  it("rejects invalid coordinates with HTTP 400", async () => {
    const airQualityClient = {
      getCurrentAirQuality: vi.fn(async () =>
        sampleCurrentAirQualityResponse({
          latitude: 48.9,
          longitude: 2.3,
        }),
      ),
    };

    const baseUrl = await startServer(airQualityClient);
    const response = await fetch(
      `${baseUrl}/air-quality/current?latitude=foo&longitude=2.3522`,
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toMatchObject({
      error: {
        code: "INVALID_QUERY",
      },
    });
    expect(airQualityClient.getCurrentAirQuality).not.toHaveBeenCalled();
  });

  it("returns HTTP 504 when the upstream provider times out", async () => {
    const baseUrl = await startServer({
      getCurrentAirQuality: async () => {
        throw new UpstreamTimeoutError();
      },
    });

    const response = await fetch(
      `${baseUrl}/air-quality/current?latitude=48.8566&longitude=2.3522`,
    );
    const payload = await response.json();

    expect(response.status).toBe(504);
    expect(payload).toMatchObject({
      error: {
        code: "UPSTREAM_TIMEOUT",
      },
    });
  });

  it("returns HTTP 502 when the upstream provider returns an unusable response", async () => {
    const baseUrl = await startServer({
      getCurrentAirQuality: async () => {
        throw new UpstreamResponseError();
      },
    });

    const response = await fetch(
      `${baseUrl}/air-quality/current?latitude=48.8566&longitude=2.3522`,
    );
    const payload = await response.json();

    expect(response.status).toBe(502);
    expect(payload).toMatchObject({
      error: {
        code: "UPSTREAM_RESPONSE_ERROR",
      },
    });
  });

  async function startServer(airQualityClient: AirQualityClient) {
    const app = buildApp({
      config: testConfig,
      airQualityClient,
      logger: false,
    });

    await app.listen({
      host: testConfig.host,
      port: 0,
    });

    cleanup = async () => {
      await app.close();
    };

    const address = app.server.address() as AddressInfo | null;

    if (!address) {
      throw new Error("Could not determine bound port");
    }

    return `http://${testConfig.host}:${address.port}`;
  }
});

function sampleCurrentAirQualityResponse(
  location: CurrentAirQualityResponse["location"],
): CurrentAirQualityResponse {
  return {
    location,
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
  };
}
