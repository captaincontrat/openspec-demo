export interface ValidationSuccess {
  valid: true;
  lat: number;
  lon: number;
}

export interface ValidationError {
  valid: false;
  status: 400;
  body: { error: string; detail?: string };
}

export type ValidationResult = ValidationSuccess | ValidationError;

export function validateCoordinates(
  latRaw: unknown,
  lonRaw: unknown,
): ValidationResult {
  if (latRaw === undefined || latRaw === null || latRaw === "") {
    return { valid: false, status: 400, body: { error: "missing_parameter", detail: "lat is required" } };
  }
  if (lonRaw === undefined || lonRaw === null || lonRaw === "") {
    return { valid: false, status: 400, body: { error: "missing_parameter", detail: "lon is required" } };
  }

  const lat = Number(latRaw);
  const lon = Number(lonRaw);

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return { valid: false, status: 400, body: { error: "invalid_parameter", detail: "lat and lon must be numbers" } };
  }
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return { valid: false, status: 400, body: { error: "invalid_parameter", detail: "lat must be in [-90,90] and lon in [-180,180]" } };
  }

  return { valid: true, lat, lon };
}
