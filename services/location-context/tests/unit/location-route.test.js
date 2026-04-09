const { describe, it, beforeEach, afterEach, mock } = require("node:test");
const assert = require("node:assert/strict");
const { once } = require("node:events");

async function buildApp() {
  const express = require("express");
  const locationRouter = require("../../src/routes/location");
  const app = express();
  app.use("/location", locationRouter);
  const server = app.listen(0);
  await once(server, "listening");
  const port = server.address().port;
  return { server, base: `http://localhost:${port}` };
}

async function get(base, path) {
  const res = await fetch(`${base}${path}`);
  const body = await res.json();
  return { status: res.status, body };
}

describe("GET /location", () => {
  let originalFetch;
  let server;
  let base;

  beforeEach(async () => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    if (server) server.close();
  });

  it("returns 400 when lat is missing", async () => {
    ({ server, base } = await buildApp());
    const { status, body } = await get(base, "/location?lon=2.35");
    assert.equal(status, 400);
    assert.ok(body.error.includes("Missing"));
  });

  it("returns 400 when lon is missing", async () => {
    ({ server, base } = await buildApp());
    const { status, body } = await get(base, "/location?lat=48.85");
    assert.equal(status, 400);
    assert.ok(body.error.includes("Missing"));
  });

  it("returns 400 for non-numeric values", async () => {
    ({ server, base } = await buildApp());
    const { status, body } = await get(base, "/location?lat=abc&lon=xyz");
    assert.equal(status, 400);
    assert.ok(body.error.includes("valid numbers"));
  });

  it("returns 503 when Nominatim is down", async () => {
    globalThis.fetch = mock.fn(async (url) => {
      if (url.includes("nominatim")) {
        return { ok: false, status: 500, json: async () => ({}) };
      }
      return originalFetch(url);
    });

    delete require.cache[require.resolve("../../src/services/nominatim")];
    delete require.cache[require.resolve("../../src/routes/location")];

    ({ server, base } = await buildApp());
    const { status, body } = await get(base, "/location?lat=48.85&lon=2.35");
    assert.equal(status, 503);
    assert.ok(body.error.includes("unavailable"));
  });
});
