import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { Server } from "node:http";
import { app } from "../../src/server.js";

let server: Server;
const BASE = "http://localhost:3033";

beforeAll(() => {
  return new Promise<void>((resolve) => {
    server = app.listen(3033, resolve);
  });
});

afterAll(() => {
  return new Promise<void>((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
});

describe("GET /health", () => {
  it("returns 200 with status ok", async () => {
    const res = await fetch(`${BASE}/health`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ status: "ok" });
  });
});

describe("GET /api/weather", () => {
  it("returns 200 with valid JSON for valid coordinates", async () => {
    const res = await fetch(`${BASE}/api/weather?lat=34.05&lon=-118.24`);
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body).toHaveProperty("lat");
    expect(body).toHaveProperty("lon");
    expect(body).toHaveProperty("temperature_c");
    expect(body).toHaveProperty("humidity_pct");
    expect(body).toHaveProperty("wind_speed_kmh");
    expect(body).toHaveProperty("precipitation_mm");
    expect(body).toHaveProperty("weather_code");
    expect(body).toHaveProperty("weather_description");
    expect(body).toHaveProperty("observed_at");
    expect(typeof body.temperature_c).toBe("number");
    expect(typeof body.weather_description).toBe("string");
    expect(body.weather_description.length).toBeGreaterThan(0);
  });

  it("returns 400 for missing lat", async () => {
    const res = await fetch(`${BASE}/api/weather?lon=-118.24`);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toMatchObject({ error: "missing_parameter", detail: "lat is required" });
  });

  it("returns 400 for missing lon", async () => {
    const res = await fetch(`${BASE}/api/weather?lat=34.05`);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toMatchObject({ error: "missing_parameter", detail: "lon is required" });
  });

  it("returns 400 for non-numeric coordinates", async () => {
    const res = await fetch(`${BASE}/api/weather?lat=abc&lon=def`);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toMatchObject({ error: "invalid_parameter" });
  });

  it("returns 400 for out-of-range coordinates", async () => {
    const res = await fetch(`${BASE}/api/weather?lat=999&lon=999`);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toMatchObject({ error: "invalid_parameter" });
  });
});
