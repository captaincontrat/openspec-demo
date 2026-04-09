# Spec: weather-context

## ADDED Requirements

### Requirement: Health endpoint

The service exposes a health check so the BFF and operators can verify it is running.

#### Scenario: Health check returns OK

- **WHEN** a client sends `GET /health` to port 3003
- **THEN** the response status is `200`
- **AND** the response body contains `{ "status": "ok" }`

---

### Requirement: Current weather by coordinates

The service accepts latitude and longitude and returns current weather conditions from Open-Meteo.

#### Scenario: Valid coordinates return weather data

- **WHEN** a client sends `GET /api/weather?lat=34.05&lon=-118.24`
- **THEN** the response status is `200`
- **AND** the response body is JSON containing at least: `lat`, `lon`, `temperature_c`, `humidity_pct`, `wind_speed_kmh`, `precipitation_mm`, `weather_code`, `weather_description`, `observed_at`
- **AND** `temperature_c` is a number
- **AND** `weather_description` is a non-empty string derived from the WMO weather code

#### Scenario: Missing latitude parameter

- **WHEN** a client sends `GET /api/weather?lon=-118.24` (no `lat`)
- **THEN** the response status is `400`
- **AND** the response body contains `{ "error": "missing_parameter", "detail": "lat is required" }`

#### Scenario: Missing longitude parameter

- **WHEN** a client sends `GET /api/weather?lat=34.05` (no `lon`)
- **THEN** the response status is `400`
- **AND** the response body contains `{ "error": "missing_parameter", "detail": "lon is required" }`

#### Scenario: Non-numeric coordinates

- **WHEN** a client sends `GET /api/weather?lat=abc&lon=def`
- **THEN** the response status is `400`
- **AND** the response body contains `{ "error": "invalid_parameter" }`

#### Scenario: Coordinates out of range

- **WHEN** a client sends `GET /api/weather?lat=999&lon=999`
- **THEN** the response status is `400`
- **AND** the response body contains `{ "error": "invalid_parameter" }`

---

### Requirement: Upstream error handling

The service must not leak raw upstream errors to consumers.

#### Scenario: Open-Meteo is unreachable

- **WHEN** a client sends a valid weather request
- **AND** the Open-Meteo API is unreachable or times out
- **THEN** the response status is `502`
- **AND** the response body contains `{ "error": "upstream_unavailable" }`

#### Scenario: Open-Meteo returns unexpected format

- **WHEN** a client sends a valid weather request
- **AND** the Open-Meteo API returns a response that cannot be parsed
- **THEN** the response status is `502`
- **AND** the response body contains `{ "error": "upstream_invalid_response" }`
