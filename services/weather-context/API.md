# weather-context-service — API Documentation

**Base URL:** `http://localhost:3003`

---

## GET /health

Health check endpoint.

**Response:** `200`

```json
{ "status": "ok" }
```

---

## GET /api/weather

Returns current weather conditions for the given coordinates.

### Query Parameters

| Parameter | Type   | Required | Constraints          | Example    |
|-----------|--------|----------|----------------------|------------|
| `lat`     | number | yes      | [-90, 90]            | `34.05`    |
| `lon`     | number | yes      | [-180, 180]          | `-118.24`  |

### Success Response — `200`

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

| Field                 | Type   | Description                                      |
|-----------------------|--------|--------------------------------------------------|
| `lat`                 | number | Latitude as provided in the request               |
| `lon`                 | number | Longitude as provided in the request              |
| `temperature_c`       | number | Current temperature in °C                         |
| `humidity_pct`        | number | Relative humidity in %                            |
| `wind_speed_kmh`      | number | Wind speed in km/h                                |
| `precipitation_mm`    | number | Current precipitation in mm                       |
| `weather_code`        | number | WMO weather interpretation code (0–99)            |
| `weather_description` | string | Human-readable weather description (e.g. "Overcast") |
| `observed_at`         | string | Observation timestamp in local time (ISO 8601, no timezone suffix) |

### Error Responses

#### `400` — Invalid input

Missing parameter:

```json
{ "error": "missing_parameter", "detail": "lat is required" }
```

```json
{ "error": "missing_parameter", "detail": "lon is required" }
```

Invalid parameter (non-numeric or out of range):

```json
{ "error": "invalid_parameter", "detail": "lat and lon must be numbers" }
```

```json
{ "error": "invalid_parameter", "detail": "lat must be in [-90,90] and lon in [-180,180]" }
```

#### `502` — Upstream error

Open-Meteo unreachable or timed out:

```json
{ "error": "upstream_unavailable" }
```

Open-Meteo returned an unparseable response:

```json
{ "error": "upstream_invalid_response" }
```

---

## Integration Example (BFF)

```ts
const response = await fetch("http://localhost:3003/api/weather?lat=34.05&lon=-118.24");

if (!response.ok) {
  // handle 400 or 502 — body always has { "error": "..." }
  const err = await response.json();
  console.warn(`weather-context-service error: ${err.error}`);
  return null;
}

const weather = await response.json();
// weather.temperature_c, weather.weather_description, etc.
```

---

## Notes

- This service wraps the [Open-Meteo Forecast API](https://open-meteo.com/en/docs). It is the **only** entry point for weather data in the system — the BFF must not call Open-Meteo directly.
- No API key is required (Open-Meteo is free and keyless).
- Upstream calls have a **5-second timeout**. If Open-Meteo is slow, expect `502`.
