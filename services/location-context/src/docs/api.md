# location-context-service API

Base URL: `http://localhost:3002`

## GET /health

Returns the service readiness status.

**Response** `200 OK`

```json
{ "status": "ok" }
```

---

## GET /location

Reverse-geocodes a coordinate pair into a human-readable location string.

### Query parameters

| Parameter | Type   | Required | Description       |
|-----------|--------|----------|-------------------|
| `lat`     | number | yes      | Latitude (WGS 84) |
| `lon`     | number | yes      | Longitude (WGS 84)|

### Responses

#### 200 OK

```json
{
  "lat": 38.89,
  "lon": -77.03,
  "location": "Washington, District of Columbia, United States"
}
```

The `location` field is a comma-separated string built from city (or town/village), region/state, and country. Fields not available for the given coordinates are omitted. If no information is available at all, the value is `"Unknown location"`.

#### 400 Bad Request

Returned when `lat` or `lon` is missing or not a valid number.

```json
{ "error": "Missing required query parameters: lat and lon" }
```

```json
{ "error": "lat and lon must be valid numbers" }
```

#### 503 Service Unavailable

Returned when the upstream Nominatim API is unreachable, returns an error, or times out.

```json
{ "error": "Upstream geocoding service is unavailable" }
```

```json
{ "error": "Upstream geocoding service timed out" }
```

---

## Notes for BFF consumers

- Coordinates are rounded to 4 decimal places internally (~11 m precision). Sending `38.8900` and `38.8901` will yield the same cached result.
- The first request for a new coordinate pair may take up to a few seconds if the internal request queue is busy (Nominatim rate limit: 1 request/second). Subsequent requests for the same coordinates are served instantly from cache.
- If the service returns 503, retry after a short delay or display a fallback message to the end user.
