import { describe, it, expect } from "vitest";
import { adaptLocationResponse } from "../../../src/adapters/location-context.adapter.js";

describe("location-context adapter", () => {
  it("normalizes a standard contract response", () => {
    const raw = {
      location: {
        name: "Los Angeles",
        admin: "California",
        country: "United States",
        countryCode: "US",
      },
    };

    const result = adaptLocationResponse(raw);

    expect(result).toEqual({
      name: "Los Angeles",
      admin: "California",
      country: "United States",
      countryCode: "US",
    });
  });

  it("handles deviated field names (result wrapper)", () => {
    const raw = {
      result: {
        city_name: "Paris",
        state: "Ile-de-France",
        country_name: "France",
        country_code: "FR",
      },
    };

    const result = adaptLocationResponse(raw);

    expect(result.name).toBe("Paris");
    expect(result.admin).toBe("Ile-de-France");
    expect(result.country).toBe("France");
    expect(result.countryCode).toBe("FR");
  });

  it("handles alternative field names (display_name, region)", () => {
    const raw = {
      location: {
        display_name: "Tokyo",
        region: "Kanto",
        country: "Japan",
        countryISO: "JP",
      },
    };

    const result = adaptLocationResponse(raw);

    expect(result.name).toBe("Tokyo");
    expect(result.admin).toBe("Kanto");
    expect(result.countryCode).toBe("JP");
  });

  it("returns nulls for missing fields", () => {
    const result = adaptLocationResponse({});

    expect(result).toEqual({
      name: null,
      admin: null,
      country: null,
      countryCode: null,
    });
  });

  it("handles null input", () => {
    const result = adaptLocationResponse(null);

    expect(result).toEqual({
      name: null,
      admin: null,
      country: null,
      countryCode: null,
    });
  });
});
