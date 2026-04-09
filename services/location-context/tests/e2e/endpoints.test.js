const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { once } = require("node:events");

describe("location-context-service E2E", () => {
  let server;
  let base;

  before(async () => {
    const { app } = require("../../src/index");
    server = app.listen(0);
    await once(server, "listening");
    base = `http://localhost:${server.address().port}`;
  });

  after(() => {
    server.close();
  });

  it("GET /health returns 200 with status ok", async () => {
    const res = await fetch(`${base}/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.deepEqual(body, { status: "ok" });
  });

  it("GET /location with valid coordinates returns 200 and a location string", async () => {
    const res = await fetch(`${base}/location?lat=48.8566&lon=2.3522`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.lat, 48.8566);
    assert.equal(body.lon, 2.3522);
    assert.equal(typeof body.location, "string");
    assert.ok(body.location.length > 0);
  });

  it("GET /location without params returns 400", async () => {
    const res = await fetch(`${base}/location`);
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.ok(body.error.includes("Missing"));
  });

  it("GET /location with non-numeric params returns 400", async () => {
    const res = await fetch(`${base}/location?lat=foo&lon=bar`);
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.ok(body.error.includes("valid numbers"));
  });
});
