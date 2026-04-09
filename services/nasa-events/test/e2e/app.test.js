import test from "node:test";
import assert from "node:assert/strict";

import { buildApp } from "../../src/app.js";

test("GET /health returns the service health payload", async (t) => {
  const app = buildApp({
    nasaClient: {
      async fetchOpenEvents() {
        return [];
      },
    },
  });

  t.after(async () => {
    await app.close();
  });

  const response = await app.inject({
    method: "GET",
    url: "/health",
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), {
    status: "ok",
    service: "nasa-events-service",
  });
});

test("GET /events returns the normalized open events payload", async (t) => {
  const app = buildApp({
    nasaClient: {
      async fetchOpenEvents() {
        return [
          {
            id: "EONET_99",
            title: "Tracked wildfire",
            description: null,
            link: "https://example.test/events/EONET_99",
            categories: [{ id: "wildfires", title: "Wildfires" }],
            sources: [{ id: "SRC", url: "https://source.test/99" }],
            geometry: [
              {
                date: "2026-04-09T00:00:00Z",
                type: "Point",
                coordinates: [-81.2, 27.6],
              },
            ],
          },
        ];
      },
    },
  });

  t.after(async () => {
    await app.close();
  });

  const response = await app.inject({
    method: "GET",
    url: "/events",
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), {
    source: "NASA EONET",
    events: [
      {
        id: "EONET_99",
        title: "Tracked wildfire",
        description: null,
        link: "https://example.test/events/EONET_99",
        categories: ["wildfires"],
        sources: ["https://source.test/99"],
        location: {
          lat: 27.6,
          lon: -81.2,
        },
      },
    ],
  });
});

test("GET /events returns JSON errors for upstream failures", async (t) => {
  const app = buildApp({
    nasaClient: {
      async fetchOpenEvents() {
        const error = new Error("upstream unavailable");
        error.code = "UPSTREAM_UNAVAILABLE";
        error.statusCode = 502;
        error.publicMessage = "NASA EONET is unavailable";
        throw error;
      },
    },
  });

  t.after(async () => {
    await app.close();
  });

  const response = await app.inject({
    method: "GET",
    url: "/events",
  });

  assert.equal(response.statusCode, 502);
  assert.deepEqual(response.json(), {
    error: {
      code: "UPSTREAM_UNAVAILABLE",
      message: "NASA EONET is unavailable",
    },
  });
});
