# Proposal: weather-context-service

## Why

The NASA EONET live monitor needs current weather data for natural event coordinates. No existing service provides this. The `bff-nasa-monitor` must not call external APIs directly — it needs a dedicated microservice that wraps Open-Meteo and exposes a stable, compact JSON contract.

## What Changes

- A new standalone microservice is created at `services/weather-context/` (port 3003).
- It exposes `GET /health` and `GET /api/weather?lat=<lat>&lon=<lon>`.
- It calls the Open-Meteo Forecast API (`https://api.open-meteo.com/v1/forecast`) for current weather conditions.
- It returns a mapped DTO (not a raw proxy of the upstream response).
- It includes unit tests and E2E tests as required by `docs/conventions-microservices.md`.

## Capabilities

### New Capabilities

- `weather-context`: Given geographic coordinates, return current weather conditions (temperature, humidity, wind, precipitation, WMO weather code with human-readable description).

## Impact

- `services/weather-context/` — new directory, entire service created from scratch
- No impact on other services or the BFF (this is a new, independent component)
- The BFF will later consume `GET /api/weather` but that is out of scope for this change

## Out of Scope

- Forecast data (hourly, daily) — only current conditions
- Caching layer
- Authentication or rate limiting
- Database or persistent storage
