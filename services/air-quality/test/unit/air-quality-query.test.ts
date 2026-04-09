import { describe, expect, it } from "vitest";

import { InvalidQueryError } from "../../src/errors.js";
import { parseAirQualityQuery } from "../../src/lib/air-quality-query.js";

describe("parseAirQualityQuery", () => {
  it("parses valid latitude and longitude values", () => {
    expect(
      parseAirQualityQuery({
        latitude: "48.8566",
        longitude: "2.3522",
      }),
    ).toEqual({
      latitude: 48.8566,
      longitude: 2.3522,
    });
  });

  it("rejects missing or out-of-range coordinates", () => {
    expect(() =>
      parseAirQualityQuery({
        latitude: "200",
      }),
    ).toThrow(InvalidQueryError);
  });
});
