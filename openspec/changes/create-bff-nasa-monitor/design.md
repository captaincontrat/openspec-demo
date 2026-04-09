# Design: create-bff-nasa-monitor

## Architecture overview

```
          FRONTEND (Dashboard)
              │
              │  GET /api/events          ← map load
              │  GET /api/events/:id      ← event click
              │  GET /health              ← status
              ▼
    ┌───────────────────────────────┐
    │      bff-nasa-monitor         │
    │         (:3000)               │
    │                               │
    │  ┌─────────┐  ┌───────────┐  │
    │  │  Routes  │  │   Cache   │  │
    │  └────┬─────┘  │ (node-   │  │
    │       │        │  cache)   │  │
    │       ▼        └───────────┘  │
    │  ┌──────────┐                 │
    │  │ Services │                 │
    │  │  (fetch  │                 │
    │  │  + adapt)│                 │
    │  └────┬─────┘                 │
    │       │                       │
    │  ┌────▼─────┐                 │
    │  │ Adapters │                 │
    │  └──────────┘                 │
    └───┬────┬────┬────┬────────────┘
        │    │    │    │
        ▼    ▼    ▼    ▼
     :3001 :3002 :3003 :3004
```

## Tech stack

| Layer          | Choice                | Rationale                                      |
|----------------|----------------------|------------------------------------------------|
| Runtime        | Node.js 20+          | Native fetch, project requirement               |
| Framework      | Express              | Most documented, accessible for all skill levels |
| HTTP client    | Native `fetch`       | Built-in since Node 20, zero dependencies        |
| Cache          | `node-cache`         | Simple in-memory TTL cache, no infra needed      |
| Tests (unit)   | `vitest`             | Fast, modern, ESM-native                         |
| Tests (E2E)    | `supertest` + `vitest` | HTTP-level testing without starting server     |

## Project structure

```
apps/bff/
├── package.json
├── vitest.config.js
├── src/
│   ├── app.js                  ← Express app setup (exported for tests)
│   ├── server.js               ← Entry point (starts listening)
│   ├── config.js               ← Ports, URLs, TTLs, category mapping
│   ├── cache.js                ← node-cache singleton
│   ├── routes/
│   │   ├── events.js           ← GET /api/events, GET /api/events/:id
│   │   └── health.js           ← GET /health (enriched)
│   ├── services/
│   │   ├── nasa-events.service.js
│   │   ├── location-context.service.js
│   │   ├── weather-context.service.js
│   │   └── air-quality.service.js
│   └── adapters/
│       ├── nasa-events.adapter.js
│       ├── location-context.adapter.js
│       ├── weather-context.adapter.js
│       └── air-quality.adapter.js
└── tests/
    ├── unit/
    │   ├── adapters/
    │   │   ├── nasa-events.adapter.test.js
    │   │   ├── location-context.adapter.test.js
    │   │   ├── weather-context.adapter.test.js
    │   │   └── air-quality.adapter.test.js
    │   └── services/
    │       └── nasa-events.service.test.js
    └── e2e/
        ├── health.test.js
        └── events.test.js
```

## Key design decisions

### 1. Adapter pattern for microservice resilience

Each microservice has a dedicated adapter that normalizes its response into the BFF's internal format. Adapters use defensive field resolution to handle contract deviations:

```javascript
// Example: adapter tries expected field names, then common variants
const name = src.name || src.city_name || src.display_name || null;
```

This decouples the BFF from the actual microservice implementation, letting the frontend contract remain stable.

### 2. Two-layer service architecture (service + adapter)

- **Service layer**: handles HTTP communication (fetch, error handling, timeout)
- **Adapter layer**: handles data transformation (normalization, defaults)

Separation makes each layer independently testable.

### 3. Caching strategy

| Endpoint               | Cache key                  | TTL    | Rationale                                   |
|------------------------|----------------------------|--------|---------------------------------------------|
| `GET /api/events`      | `events` (+ query params)  | 5 min  | Event list changes slowly                    |
| `GET /api/events/:id`  | `detail:{id}:{lat}:{lon}`  | 2 min  | Weather/air data more volatile               |
| `GET /health`          | Not cached                 | —      | Must always reflect real-time status          |

### 4. Graceful degradation with `Promise.allSettled`

For the event detail endpoint, the 3 context services are called in parallel. Each result section includes a `status` field:

```json
{
  "event": { "..." },
  "location": { "status": "ok", "data": { "..." } },
  "weather":  { "status": "error", "error": "Service unavailable", "data": null },
  "airQuality": { "status": "ok", "data": { "..." } }
}
```

The frontend can render available data and show appropriate messages for unavailable sections.

### 5. Enriched health check

`GET /health` pings each downstream service's `/health` endpoint in parallel and reports composite status:

```json
{
  "status": "degraded",
  "uptime": 3600,
  "services": {
    "nasa-events":      { "status": "up", "responseTime": 45 },
    "location-context": { "status": "up", "responseTime": 120 },
    "weather-context":  { "status": "down", "error": "ECONNREFUSED" },
    "air-quality":      { "status": "up", "responseTime": 88 }
  }
}
```

Top-level status is `"healthy"` if all up, `"degraded"` if some up, `"unhealthy"` if all down.

### 6. Category style mapping

The BFF enriches each event with visual metadata based on EONET category:

```javascript
const CATEGORY_STYLES = {
  wildfires:          { color: "#E53E3E", icon: "flame" },
  volcanoes:          { color: "#DD6B20", icon: "volcano" },
  severeStorms:       { color: "#805AD5", icon: "storm" },
  floods:             { color: "#3182CE", icon: "water" },
  seaLakeIce:         { color: "#00B5D8", icon: "snowflake" },
  snow:               { color: "#E2E8F0", icon: "snowflake" },
  earthquakes:        { color: "#8B6914", icon: "earthquake" },
  landslides:         { color: "#6B4226", icon: "landslide" },
  drought:            { color: "#D69E2E", icon: "sun" },
  dustHaze:           { color: "#C4A35A", icon: "haze" },
  tempExtremes:       { color: "#C53030", icon: "thermometer" },
  waterColor:         { color: "#38A169", icon: "droplet" },
  manmade:            { color: "#718096", icon: "alert" },
};
```

### 7. Configuration externalization

All service URLs, ports, and TTLs are centralized in `config.js` with environment variable overrides:

```javascript
export const config = {
  port: process.env.BFF_PORT || 3000,
  services: {
    nasaEvents:      process.env.NASA_EVENTS_URL      || "http://localhost:3001",
    locationContext: process.env.LOCATION_CONTEXT_URL  || "http://localhost:3002",
    weatherContext:  process.env.WEATHER_CONTEXT_URL   || "http://localhost:3003",
    airQuality:     process.env.AIR_QUALITY_URL        || "http://localhost:3004",
  },
  cache: {
    eventsTTL:  300,
    detailTTL:  120,
  },
};
```

## API contracts expected from microservices

### nasa-events-service (:3001)

```
GET /api/events[?category=X&status=open]

{
  "events": [{
    "id": "EONET_12345",
    "title": "Wildfire - Southern California",
    "category": { "id": "wildfires", "title": "Wildfires" },
    "sources": [{ "id": "InciWeb", "url": "https://..." }],
    "geometry": {
      "date": "2026-04-08T00:00:00Z",
      "coordinates": { "lat": 34.05, "lon": -118.24 }
    }
  }]
}
```

### location-context-service (:3002)

```
GET /api/location?lat=X&lon=Y

{
  "location": {
    "name": "Los Angeles",
    "admin": "California",
    "country": "United States",
    "countryCode": "US"
  }
}
```

### weather-context-service (:3003)

```
GET /api/weather?lat=X&lon=Y

{
  "weather": {
    "temperature": 28.5,
    "humidity": 45,
    "windSpeed": 12.3,
    "windDirection": 225,
    "description": "Clear sky",
    "unit": "metric"
  }
}
```

### air-quality-service (:3004)

```
GET /api/air-quality?lat=X&lon=Y

{
  "airQuality": {
    "aqi": 85,
    "pm25": 22.1,
    "pm10": 45.3,
    "no2": 18.7,
    "o3": 62.4
  }
}
```

### Error convention (all services)

```json
{ "error": { "code": "UPSTREAM_ERROR", "message": "..." } }
```
