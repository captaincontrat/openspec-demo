const { describe, it, beforeEach, afterEach, mock } = require("node:test");
const assert = require("node:assert/strict");
const {
  createNominatimClient,
  NominatimError,
  formatLocation,
  roundCoord,
  cacheKey,
} = require("../../src/services/nominatim");

describe("roundCoord", () => {
  it("rounds to 4 decimal places", () => {
    assert.equal(roundCoord(38.890012), 38.89);
    assert.equal(roundCoord(-77.032456), -77.0325);
  });
});

describe("cacheKey", () => {
  it("produces a stable key from rounded coords", () => {
    assert.equal(cacheKey(38.890012, -77.032456), "38.89,-77.0325");
  });
});

describe("formatLocation", () => {
  it("formats city, state, country", () => {
    assert.equal(
      formatLocation({ city: "Washington", state: "DC", country: "US" }),
      "Washington, DC, US"
    );
  });

  it("falls back to town when city is missing", () => {
    assert.equal(
      formatLocation({ town: "Springfield", state: "IL", country: "US" }),
      "Springfield, IL, US"
    );
  });

  it("skips missing fields", () => {
    assert.equal(formatLocation({ country: "Iceland" }), "Iceland");
  });

  it('returns "Unknown location" when address is empty', () => {
    assert.equal(formatLocation({}), "Unknown location");
  });
});

describe("createNominatimClient", () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  function mockFetch(address, { status = 200 } = {}) {
    globalThis.fetch = mock.fn(async () => ({
      ok: status >= 200 && status < 300,
      status,
      json: async () => ({ address }),
    }));
  }

  it("calls Nominatim with correct URL and User-Agent", async () => {
    mockFetch({ city: "Washington", state: "DC", country: "US" });
    const client = createNominatimClient();
    await client.reverseGeocode(38.89, -77.03);

    const call = globalThis.fetch.mock.calls[0];
    const url = call.arguments[0];
    const opts = call.arguments[1];

    assert.ok(url.includes("lat=38.89"));
    assert.ok(url.includes("lon=-77.03"));
    assert.ok(url.includes("format=json"));
    assert.equal(opts.headers["User-Agent"], "location-context-service/1.0");
  });

  it("parses and returns a formatted location string", async () => {
    mockFetch({ city: "Paris", state: "Île-de-France", country: "France" });
    const client = createNominatimClient();
    const result = await client.reverseGeocode(48.8566, 2.3522);
    assert.equal(result, "Paris, Île-de-France, France");
  });

  it("returns cached result without calling fetch again", async () => {
    mockFetch({ city: "Berlin", state: "Berlin", country: "Germany" });
    const client = createNominatimClient();

    const first = await client.reverseGeocode(52.52, 13.405);
    const second = await client.reverseGeocode(52.52, 13.405);

    assert.equal(first, second);
    assert.equal(globalThis.fetch.mock.callCount(), 1);
  });

  it("treats nearly-identical coords as the same cache key", async () => {
    mockFetch({ city: "Rome", country: "Italy" });
    const client = createNominatimClient();

    await client.reverseGeocode(41.90221, 12.49637);
    await client.reverseGeocode(41.90222, 12.49638);

    assert.equal(globalThis.fetch.mock.callCount(), 1);
  });

  it("spaces requests at least 1 000 ms apart", async () => {
    const timestamps = [];
    globalThis.fetch = mock.fn(async () => {
      timestamps.push(Date.now());
      return {
        ok: true,
        status: 200,
        json: async () => ({ address: { country: "Test" } }),
      };
    });

    const client = createNominatimClient();
    await Promise.all([
      client.reverseGeocode(1, 1),
      client.reverseGeocode(2, 2),
      client.reverseGeocode(3, 3),
    ]);

    for (let i = 1; i < timestamps.length; i++) {
      const gap = timestamps[i] - timestamps[i - 1];
      assert.ok(gap >= 950, `Gap between requests was only ${gap}ms`);
    }
  });

  it("throws NominatimError on non-200 response", async () => {
    mockFetch({}, { status: 500 });
    const client = createNominatimClient();
    await assert.rejects(
      () => client.reverseGeocode(0, 0),
      (err) => {
        assert.ok(err instanceof NominatimError);
        assert.ok(err.message.includes("500"));
        return true;
      }
    );
  });
});
