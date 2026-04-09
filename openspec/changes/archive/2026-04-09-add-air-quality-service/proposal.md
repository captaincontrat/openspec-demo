# Proposal: Add Air Quality Service

## Why

The system needs a dedicated microservice that provides current air-quality data to the local BFF without exposing the BFF directly to the Open-Meteo Air Quality API. Isolating this integration keeps the public provider contract, validation, and failure handling inside a single service boundary.

## What Changes

- Add a new microservice named `air-quality-service` in `services/air-quality/`.
- Make the service listen on port `3004` and expose `GET /health`.
- Expose a primary JSON endpoint at `GET /air-quality/current?latitude=<number>&longitude=<number>`.
- Use `Open-Meteo Air Quality` as the upstream provider for current air-quality data.
- Return a normalized payload tailored for the BFF instead of proxying the upstream response as-is.
- Add unit tests for request validation and upstream mapping.
- Add E2E tests for startup, health, the main endpoint, invalid input, and upstream failure behavior.

## Capabilities

### New Capabilities

- `air-quality-service`: provides current air-quality context for a requested latitude/longitude pair.

### Modified Capabilities

- None.

## Impact

- `services/air-quality/`: new microservice project and tests.
- `openspec/changes/add-air-quality-service/`: new proposal, delta spec, design, and tasks for this service.
- `BFF`: no direct implementation change required in this change, but the service contract is designed for BFF consumption.
