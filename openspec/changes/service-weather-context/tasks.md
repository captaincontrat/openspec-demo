# Tasks: weather-context-service

## 1. Project scaffolding

- [x] 1.1 Create `services/weather-context/` directory with dependency management (package.json, go.mod, Cargo.toml, or equivalent depending on chosen stack)
- [x] 1.2 Configure the project to start a server on port **3003** (override framework default if needed)

## 2. Health endpoint

- [x] 2.1 Implement `GET /health` returning `200` with `{ "status": "ok" }`

## 3. Input validation

- [x] 3.1 Implement a validator module that checks `lat` is a number in [-90, 90] and `lon` is a number in [-180, 180]
- [x] 3.2 Return `400` with structured JSON error (`missing_parameter` or `invalid_parameter`) when validation fails

## 4. Open-Meteo adapter

- [x] 4.1 Implement an HTTP client module that calls `https://api.open-meteo.com/v1/forecast` with the query parameters defined in design (current fields + timezone=auto)
- [x] 4.2 Set a 5-second timeout on the HTTP call
- [x] 4.3 Handle upstream errors: unreachable/timeout → `502 upstream_unavailable`, unparseable response → `502 upstream_invalid_response`

## 5. Response mapper

- [x] 5.1 Create a WMO weather code lookup table (codes 0–99 → English descriptions)
- [x] 5.2 Implement a mapper that transforms the Open-Meteo response into the flat DTO defined in design (`lat`, `lon`, `temperature_c`, `humidity_pct`, `wind_speed_kmh`, `precipitation_mm`, `weather_code`, `weather_description`, `observed_at`)

## 6. Main endpoint

- [x] 6.1 Wire `GET /api/weather?lat=<lat>&lon=<lon>` route: validate → call adapter → map → respond

## 7. Unit tests

- [x] 7.1 Test the validator: valid coordinates, missing params, non-numeric, out-of-range
- [x] 7.2 Test the mapper: valid Open-Meteo response → correct DTO, WMO code → description
- [x] 7.3 Test the adapter with mocked HTTP: successful call, timeout, non-200 upstream, malformed response

## 8. E2E tests

- [x] 8.1 Test server starts and `GET /health` returns 200
- [x] 8.2 Test `GET /api/weather?lat=34.05&lon=-118.24` returns 200 with valid JSON structure
- [x] 8.3 Test `GET /api/weather` with missing/invalid params returns 400
