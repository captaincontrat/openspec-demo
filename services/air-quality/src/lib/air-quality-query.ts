import { InvalidQueryError } from "../errors.js";
import type { LocationCoordinates } from "../types.js";
import { z } from "zod";

export const airQualityQuerySchema = z.object({
  latitude: z.coerce.number().finite().min(-90).max(90),
  longitude: z.coerce.number().finite().min(-180).max(180),
});

export function parseAirQualityQuery(
  input: Record<string, unknown>,
): LocationCoordinates {
  const parsed = airQualityQuerySchema.safeParse(input);

  if (!parsed.success) {
    throw new InvalidQueryError(undefined, parsed.error.flatten());
  }

  return parsed.data;
}
