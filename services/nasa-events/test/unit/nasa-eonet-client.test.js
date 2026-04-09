import test from "node:test";
import assert from "node:assert/strict";

import { createNasaEonetClient } from "../../src/nasa-eonet-client.js";

test("fetchOpenEvents requests open events from NASA EONET", async () => {
  let requestedUrl;

  const client = createNasaEonetClient({
    fetchImpl: async (url) => {
      requestedUrl = url;

      return {
        ok: true,
        async json() {
          return { events: [{ id: "EONET_1" }] };
        },
      };
    },
  });

  const events = await client.fetchOpenEvents();

  assert.equal(requestedUrl.searchParams.get("status"), "open");
  assert.deepEqual(events, [{ id: "EONET_1" }]);
});

test("fetchOpenEvents maps transport failures to UPSTREAM_UNAVAILABLE", async () => {
  const client = createNasaEonetClient({
    fetchImpl: async () => {
      throw new Error("network down");
    },
  });

  await assert.rejects(
    client.fetchOpenEvents(),
    (error) => error.code === "UPSTREAM_UNAVAILABLE" && error.statusCode === 502,
  );
});

test("fetchOpenEvents rejects unusable upstream responses", async () => {
  const client = createNasaEonetClient({
    fetchImpl: async () => ({
      ok: true,
      async json() {
        return { invalid: true };
      },
    }),
  });

  await assert.rejects(
    client.fetchOpenEvents(),
    (error) => error.code === "UPSTREAM_BAD_RESPONSE" && error.statusCode === 502,
  );
});
