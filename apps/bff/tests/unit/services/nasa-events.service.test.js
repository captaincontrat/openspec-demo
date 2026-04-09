import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchEvents } from "../../../src/services/nasa-events.service.js";

describe("nasa-events service", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("returns adapted data on success", async () => {
    const mockResponse = {
      events: [
        {
          id: "EONET_1",
          title: "Fire",
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
      json: () => Promise.resolve(mockResponse),
    });

    const result = await fetchEvents();

    expect(result.status).toBe("ok");
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe("EONET_1");
    expect(result.data[0].category.color).toBe("#E53E3E");
  });

  it("returns error on non-ok response", async () => {
    fetch.mockResolvedValue({ ok: false, status: 503 });

    const result = await fetchEvents();

    expect(result.status).toBe("error");
    expect(result.error).toContain("503");
  });

  it("returns error on network failure", async () => {
    fetch.mockRejectedValue(new Error("ECONNREFUSED"));

    const result = await fetchEvents();

    expect(result.status).toBe("error");
    expect(result.error).toContain("ECONNREFUSED");
  });

  it("returns error on timeout", async () => {
    const timeoutError = new Error("Timeout");
    timeoutError.name = "TimeoutError";
    fetch.mockRejectedValue(timeoutError);

    const result = await fetchEvents();

    expect(result.status).toBe("error");
    expect(result.error).toContain("timeout");
  });

  it("forwards query params to URL", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ events: [] }),
    });

    await fetchEvents({ category: "wildfires", status: "open" });

    const calledUrl = fetch.mock.calls[0][0].toString();
    expect(calledUrl).toContain("category=wildfires");
    expect(calledUrl).toContain("status=open");
  });
});
