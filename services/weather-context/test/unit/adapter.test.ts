import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchWeather } from "../../src/adapter.js";

describe("fetchWeather", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("returns parsed JSON on success", async () => {
    const mockBody = { current: { temperature_2m: 20, weather_code: 0 } };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockBody),
    }) as any;

    const result = await fetchWeather(34.05, -118.24);
    expect(result).toEqual(mockBody);

    const calledUrl = (globalThis.fetch as any).mock.calls[0][0] as string;
    expect(calledUrl).toContain("latitude=34.05");
    expect(calledUrl).toContain("longitude=-118.24");
    expect(calledUrl).toContain("timezone=auto");
  });

  it("throws upstream_unavailable on network error", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError("fetch failed")) as any;
    await expect(fetchWeather(0, 0)).rejects.toThrow("upstream_unavailable");
  });

  it("throws upstream_unavailable on non-ok status", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    }) as any;
    await expect(fetchWeather(0, 0)).rejects.toThrow("upstream_unavailable");
  });

  it("throws upstream_invalid_response on malformed JSON", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.reject(new SyntaxError("Unexpected token")),
    }) as any;
    await expect(fetchWeather(0, 0)).rejects.toThrow("upstream_invalid_response");
  });
});
