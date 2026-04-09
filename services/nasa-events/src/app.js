import Fastify from "fastify";

import { createNasaEonetClient } from "./nasa-eonet-client.js";
import { toErrorResponse } from "./errors.js";
import { normalizeEvent } from "./normalize-event.js";

export function buildApp({
  logger = false,
  nasaClient = createNasaEonetClient(),
} = {}) {
  const app = Fastify({ logger });

  app.get("/health", async () => {
    return {
      status: "ok",
      service: "nasa-events-service",
    };
  });

  app.get("/events", async (request, reply) => {
    try {
      const upstreamEvents = await nasaClient.fetchOpenEvents();
      const events = upstreamEvents.map(normalizeEvent).filter(Boolean);

      return {
        source: "NASA EONET",
        events,
      };
    } catch (error) {
      const errorResponse = toErrorResponse(error);

      if (errorResponse.statusCode === 500) {
        request.log.error({ err: error }, "Unhandled error while listing events");
      }

      reply.code(errorResponse.statusCode);
      return errorResponse.body;
    }
  });

  return app;
}
