import { describe, it, expect } from "vitest";
import { validateCoordinates } from "../../src/validator.js";

describe("validateCoordinates", () => {
  it("accepts valid coordinates", () => {
    const result = validateCoordinates("34.05", "-118.24");
    expect(result).toEqual({ valid: true, lat: 34.05, lon: -118.24 });
  });

  it("accepts boundary values", () => {
    expect(validateCoordinates("90", "180")).toEqual({ valid: true, lat: 90, lon: 180 });
    expect(validateCoordinates("-90", "-180")).toEqual({ valid: true, lat: -90, lon: -180 });
    expect(validateCoordinates("0", "0")).toEqual({ valid: true, lat: 0, lon: 0 });
  });

  it("rejects missing lat", () => {
    const result = validateCoordinates(undefined, "-118.24");
    expect(result).toMatchObject({ valid: false, status: 400, body: { error: "missing_parameter", detail: "lat is required" } });
  });

  it("rejects missing lon", () => {
    const result = validateCoordinates("34.05", undefined);
    expect(result).toMatchObject({ valid: false, status: 400, body: { error: "missing_parameter", detail: "lon is required" } });
  });

  it("rejects empty string lat", () => {
    const result = validateCoordinates("", "-118.24");
    expect(result).toMatchObject({ valid: false, body: { error: "missing_parameter" } });
  });

  it("rejects non-numeric lat", () => {
    const result = validateCoordinates("abc", "def");
    expect(result).toMatchObject({ valid: false, body: { error: "invalid_parameter" } });
  });

  it("rejects out-of-range coordinates", () => {
    const result = validateCoordinates("999", "999");
    expect(result).toMatchObject({ valid: false, body: { error: "invalid_parameter" } });
  });

  it("rejects lat just outside range", () => {
    expect(validateCoordinates("90.1", "0")).toMatchObject({ valid: false, body: { error: "invalid_parameter" } });
    expect(validateCoordinates("-90.1", "0")).toMatchObject({ valid: false, body: { error: "invalid_parameter" } });
  });
});
