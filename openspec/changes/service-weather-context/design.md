# Design: weather-context-service

## Context

The NASA EONET live monitor system is composed of four microservices and one BFF. This service is responsible for weather context: given coordinates from a natural event, it returns current weather conditions by calling the Open-Meteo Forecast API.

The service lives at `services/weather-context/`, listens on port **3003**, and follows all conventions from `docs/conventions-microservices.md`.

## Goals / Non-Goals

**Goals:**
- Expose a single, stable JSON endpoint for current weather at given coordinates
- Map the Open-Meteo response to a compact DTO (not a raw proxy)
- Translate WMO weather codes into human-readable descriptions
- Handle upstream failures gracefully with structured error responses

**Non-Goals:**
- Forecast data (hourly, daily, weekly)
- Caching or persistence
- Authentication, rate limiting, or API keys
- Cross-service communication (the BFF calls us, we call nobody else internally)

## Decisions

### Decision 1: Map upstream response to a DTO

The Open-Meteo API returns a nested structure with `current`, `current_units`, timezone metadata, and elevation. The service maps this to a flat DTO:

```json
{
  "lat": 34.05,
  "lon": -118.24,
  "temperature_c": 14.4,
  "humidity_pct": 86,
  "wind_speed_kmh": 4.7,
  "precipitation_mm": 0.0,
  "weather_code": 3,
  "weather_description": "Overcast",
  "observed_at": "2026-04-09T06:15"
}
```

**Rationale:** Isolates consumers from upstream structure changes. The BFF does not need to know about Open-Meteo internals.

### Decision 2: Open-Meteo query parameters

Request only `current` fields: `temperature_2m`, `wind_speed_10m`, `weather_code`, `relative_humidity_2m`, `precipitation`. Add `timezone=auto` so `observed_at` reflects local time at the event location.

Full upstream URL pattern:
```
https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,wind_speed_10m,weather_code,relative_humidity_2m,precipitation&timezone=auto
```

### Decision 3: WMO code translation

Maintain a static lookup table for WMO weather interpretation codes (0–99) → English descriptions. This is a small, well-defined, stable mapping that does not warrant an external dependency.

### Decision 4: Input validation

Validate `lat` (must be a number in [-90, 90]) and `lon` (must be a number in [-180, 180]) before calling Open-Meteo. Return `400` immediately for invalid input — do not forward bad coordinates upstream.

### Decision 5: Upstream timeout

Set an HTTP client timeout of **5 seconds** for Open-Meteo calls. If the upstream does not respond in time, return `502` with `upstream_unavailable`. This protects the BFF from hanging on slow upstream responses.

### Decision 6: Technology stack — TypeScript + Express

**Runtime:** Node.js 20.19+ (already required by the repository for the OpenSpec CLI — zero additional runtime dependency for contributors).

**Language:** TypeScript — provides type safety for the DTO mapping and Open-Meteo response parsing.

**Framework:** Express — universally known, minimal setup, sufficient for a single-endpoint service.

**HTTP client:** Native `fetch()` (built into Node 20+) — no external HTTP dependency needed.

**Test runner:** Vitest — fast, TypeScript-native, compatible with Jest API.

**Dependencies (production):** `express`, `@types/express`, `typescript`
**Dependencies (dev):** `vitest`, `tsx` (for dev/run without a build step)

```
services/weather-context/
├── package.json
├── tsconfig.json
├── src/
│   ├── server.ts      ← Express app, routes, port 3003
│   ├── adapter.ts     ← fetch() towards Open-Meteo
│   ├── mapper.ts      ← Response DTO types + WMO code table
│   └── validator.ts   ← Input validation (lat/lon)
└── test/
    ├── unit/
    │   ├── mapper.test.ts
    │   ├── validator.test.ts
    │   └── adapter.test.ts
    └── e2e/
        └── server.test.ts
```
