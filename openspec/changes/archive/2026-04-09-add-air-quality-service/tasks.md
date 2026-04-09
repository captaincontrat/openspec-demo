# Tasks

## 1. Scaffold the service

- [x] 1.1 Create the service project in `services/air-quality/`.
- [x] 1.2 Configure the service to run on port `3004`.
- [x] 1.3 Add the base application wiring and environment configuration needed for local development and tests.

## 2. Implement the HTTP contract

- [x] 2.1 Add `GET /health`.
- [x] 2.2 Add `GET /air-quality/current`.
- [x] 2.3 Validate `latitude` and `longitude` query parameters and return `400` on invalid input.

## 3. Integrate Open-Meteo Air Quality

- [x] 3.1 Implement an upstream client that requests current air-quality data from Open-Meteo Air Quality.
- [x] 3.2 Request the current metrics needed for the BFF: `european_aqi`, `pm10`, and `pm2_5`.
- [x] 3.3 Map the upstream payload to the service's normalized JSON response.
- [x] 3.4 Translate upstream failures and timeouts into explicit `502` and `504` responses.

## 4. Verify the service

- [x] 4.1 Add unit tests for validation, upstream request construction, and payload mapping.
- [x] 4.2 Add E2E tests for startup, `GET /health`, successful current lookup, invalid coordinates, and upstream failure behavior.
- [x] 4.3 Verify that the implementation stays aligned with `docs/conventions-microservices.md`.
