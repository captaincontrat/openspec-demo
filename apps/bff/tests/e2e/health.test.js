import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../../src/app.js";

describe("GET /health", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("returns healthy when all services are up", async () => {
    fetch.mockResolvedValue({ ok: true, status: 200 });

    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("healthy");
    expect(res.body).toHaveProperty("uptime");
    expect(res.body).toHaveProperty("services");

    const services = res.body.services;
    expect(services["nasa-events"].status).toBe("up");
    expect(services["location-context"].status).toBe("up");
    expect(services["weather-context"].status).toBe("up");
    expect(services["air-quality"].status).toBe("up");
  });

  it("returns degraded when some services are down", async () => {
    fetch
      .mockResolvedValueOnce({ ok: true, status: 200 })
      .mockResolvedValueOnce({ ok: true, status: 200 })
      .mockRejectedValueOnce(new Error("ECONNREFUSED"))
      .mockResolvedValueOnce({ ok: true, status: 200 });

    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("degraded");
    expect(res.body.services["weather-context"].status).toBe("down");
  });

  it("returns unhealthy when all services are down", async () => {
    fetch.mockRejectedValue(new Error("ECONNREFUSED"));

    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("unhealthy");
  });
});
