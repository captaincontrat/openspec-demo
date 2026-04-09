import type { AppConfig } from "./config.js";
import { loadConfig } from "./config.js";
import { AppError } from "./errors.js";
import { parseAirQualityQuery } from "./lib/air-quality-query.js";
import { createOpenMeteoAirQualityClient } from "./lib/open-meteo-air-quality-client.js";
import type { AirQualityClient } from "./types.js";
import Fastify from "fastify";

export interface BuildAppOptions {
  config?: AppConfig;
  airQualityClient?: AirQualityClient;
  logger?: boolean;
}

export function buildApp(options: BuildAppOptions = {}) {
  const config = options.config ?? loadConfig();
  const airQualityClient =
    options.airQualityClient ??
    createOpenMeteoAirQualityClient({
      baseUrl: config.openMeteoBaseUrl,
      timeoutMs: config.upstreamTimeoutMs,
    });

  const app = Fastify({
    logger: options.logger ?? { level: config.logLevel },
  });

  app.setErrorHandler((error, request, reply) => {
    request.log.error(error);

    if (error instanceof AppError) {
      reply.status(error.statusCode).send({
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      });
      return;
    }

    reply.status(500).send({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Unexpected server error",
      },
    });
  });

  app.get("/health", async () => {
    return {
      status: "ok",
      service: "air-quality-service",
    };
  });

  app.get("/air-quality/current", async (request) => {
    const coordinates = parseAirQualityQuery(
      request.query as Record<string, unknown>,
    );

    return airQualityClient.getCurrentAirQuality(coordinates);
  });

  return app;
}
