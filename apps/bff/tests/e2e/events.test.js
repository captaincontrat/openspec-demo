import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../../src/app.js";
import { eventsCache, detailCache } from "../../src/cache.js";

describe("GET /api/events", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    eventsCache.flushAll();
    detailCache.flushAll();
  });

  it("returns 200 with events array", async () => {
    const mockEvents = {
      events: [
        {
          id: "EONET_1",
          title: "Wildfire",
          category: { id: "wildfires", title: "Wildfires" },
          geometry: {
            date: "2026-04-08",
            coordinates: { lat: 34.0, lon: -118.0 },
          },
        },
      ],
    };

    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockEvents),
    });

    const res = await request(app).get("/api/events");

    expect(res.status).toBe(200);
    expect(res.body.events).toHaveLength(1);
    expect(res.body.events[0].id).toBe("EONET_1");
    expect(res.body.events[0].category.color).toBe("#E53E3E");
  });

  it("returns 502 when nasa-events service is down", async () => {
    fetch.mockRejectedValue(new Error("ECONNREFUSED"));

    const res = await request(app).get("/api/events");

    expect(res.status).toBe(502);
    expect(res.body).toHaveProperty("error");
  });
});

describe("GET /api/events/:id", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    eventsCache.flushAll();
    detailCache.flushAll();
  });

  it("returns 400 when lat/lon are missing", async () => {
    const res = await request(app).get("/api/events/EONET_1");

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("lat");
  });

  it("returns composite response with all services up", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            location: {
              name: "Los Angeles",
              admin: "California",
              country: "United States",
              countryCode: "US",
            },
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            weather: {
              temperature: 28.5,
              humidity: 45,
              windSpeed: 12.3,
              windDirection: 225,
              description: "Clear sky",
              unit: "metric",
            },
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            airQuality: { aqi: 85, pm25: 22.1, pm10: 45.3, no2: 18.7, o3: 62.4 },
          }),
      });

    const res = await request(app)
      .get("/api/events/EONET_1")
      .query({ lat: 34.05, lon: -118.24 });

    expect(res.status).toBe(200);
    expect(res.body.event.id).toBe("EONET_1");
    expect(res.body.location.status).toBe("ok");
    expect(res.body.location.data.name).toBe("Los Angeles");
    expect(res.body.weather.status).toBe("ok");
    expect(res.body.weather.data.temperature).toBe(28.5);
    expect(res.body.airQuality.status).toBe("ok");
    expect(res.body.airQuality.data.aqi).toBe(85);
  });

  it("returns partial response when one service is down", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            location: { name: "Tokyo", admin: "Kanto", country: "Japan", countryCode: "JP" },
          }),
      })
      .mockRejectedValueOnce(new Error("ECONNREFUSED"))
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            airQuality: { aqi: 40, pm25: 8.0, pm10: 20.0, no2: 10.0, o3: 45.0 },
          }),
      });

    const res = await request(app)
      .get("/api/events/EONET_2")
      .query({ lat: 35.68, lon: 139.69 });

    expect(res.status).toBe(200);
    expect(res.body.location.status).toBe("ok");
    expect(res.body.weather.status).toBe("error");
    expect(res.body.weather.data).toBeNull();
    expect(res.body.airQuality.status).toBe("ok");
  });
});
