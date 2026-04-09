# Design: Add Air Quality Service

## Context

The project conventions define `air-quality-service` as a standalone microservice living in `services/air-quality/`, listening on port `3004`, exposing `GET /health`, and using `Open-Meteo Air Quality` as its public data source. This service is intended only for the local BFF, so the public contract can stay intentionally narrow and optimized for internal consumption.

## Goals / Non-Goals

**Goals**

- Provide a stable local HTTP contract for current air-quality data.
- Hide the upstream provider details from the BFF.
- Normalize the response so the BFF consumes a small, predictable payload.
- Validate request input and surface upstream failures clearly.
- Keep the service lightweight and easy to test locally.

**Non-Goals**

- Expose full upstream passthrough features such as arbitrary hourly variables.
- Persist air-quality data in a database.
- Add authentication or authorization.
- Implement BFF integration in this change.
- Add long-term caching or background polling.

## Decisions

### Decision 1: Use a lightweight TypeScript HTTP stack

The service will use Node.js 20, TypeScript, Fastify, Zod, native `fetch`, and Vitest.

Rationale:

- Fastify keeps the HTTP layer small and quick to bootstrap.
- TypeScript and Zod make query validation and response mapping explicit.
- Native `fetch` avoids an extra HTTP client dependency.
- Vitest can cover both unit and HTTP-level tests with minimal setup.

### Decision 2: Expose a narrow BFF-facing contract

The primary endpoint will be:

- `GET /air-quality/current?latitude=<number>&longitude=<number>`

The service will not expose upstream query controls such as `current`, `hourly`, `timezone`, or `domains` to callers. Those remain implementation details inside the service.

Rationale:

- The service only exists to serve the BFF.
- A narrow contract limits coupling to provider-specific parameters.
- The response can stay stable even if the provider or selected metrics change later.

### Decision 3: Return normalized current metrics only

The response will normalize the upstream payload into a small JSON document containing:

- request location
- observation timestamp
- `europeanAqi`
- `pm10`
- `pm2_5`
- source metadata

Illustrative shape:

```json
{
  "location": {
    "latitude": 48.8566,
    "longitude": 2.3522
  },
  "observedAt": "2026-04-09T15:00:00+02:00",
  "airQuality": {
    "europeanAqi": 38,
    "pm10": {
      "value": 5.4,
      "unit": "ug/m3"
    },
    "pm2_5": {
      "value": 4.3,
      "unit": "ug/m3"
    }
  },
  "source": "open-meteo"
}
```

Rationale:

- The BFF currently needs the current state, not a forecast series.
- The normalized payload is simpler than the upstream structure.
- Restricting the first version keeps implementation and testing focused.

### Decision 4: Perform request-time upstream fetches without persistence

Each valid request will trigger a request-time fetch to Open-Meteo Air Quality using the selected current variables.

Rationale:

- The service is read-only and lightweight.
- There is no requirement for historical storage.
- Avoiding persistence keeps the first version simple.

### Decision 5: Fail explicitly on invalid input and upstream errors

The service will:

- return `400` for invalid or missing coordinates
- return `502` when the upstream returns an error or unusable response
- return `504` when the upstream request times out

Rationale:

- The BFF needs predictable failure modes.
- Explicit error mapping is easier to test and operate than generic failures.

## Testing Strategy

- Unit tests cover coordinate validation, upstream request construction, and payload mapping.
- E2E tests cover application startup, `GET /health`, successful current lookup, invalid query parameters, and upstream error handling.
