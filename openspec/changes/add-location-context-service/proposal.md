## Why

The NASA EONET monitor provides natural event data with raw coordinates (latitude/longitude), but end users need human-readable location context. A dedicated `location-context-service` will reverse-geocode coordinates via the Nominatim API so the BFF can display meaningful place names (city, region, country) alongside each event.

## What Changes

- New microservice `location-context-service` in `services/location-context/`, listening on port `3002`.
- `GET /location?lat=<lat>&lon=<lon>` endpoint returning a simplified location string (city, region, country).
- `GET /health` endpoint for readiness checks.
- In-memory cache to avoid redundant Nominatim calls for the same coordinates.
- Request throttling (max 1 request/second) to comply with Nominatim's usage policy.
- API documentation for BFF consumers describing the contract and expected response format.

## Capabilities

### New Capabilities

- `location-context-service`: Reverse geocoding microservice wrapping Nominatim. Covers the HTTP endpoints, response format, caching strategy, rate limiting, and consumer documentation.

### Modified Capabilities


## Impact

- New directory `services/location-context/` with its own `package.json` and dependencies.
- The BFF (`apps/bff/`) will gain a new upstream dependency on `http://localhost:3002`.
- External dependency on the public Nominatim API (`https://nominatim.openstreetmap.org/reverse`); rate-limited to 1 req/s per their usage policy.
- Node.js runtime (already available in the project).
