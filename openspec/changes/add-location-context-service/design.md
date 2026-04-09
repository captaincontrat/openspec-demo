## Context

The NASA EONET monitor is composed of four microservices and a BFF. Each microservice wraps one public API. The `location-context-service` wraps the Nominatim reverse-geocoding API to turn raw event coordinates into human-readable place names.

No services exist yet in the repository. The project conventions (`docs/conventions-microservices.md`) prescribe the directory layout (`services/location-context/`), port (`3002`), required endpoints (`GET /health` + one main JSON endpoint), and test expectations (unit + E2E).

Node.js 20.19+ is already required by the project. No shared framework has been mandated across the five contributors.

## Goals / Non-Goals

**Goals:**
- Expose `GET /location?lat=<lat>&lon=<lon>` returning a simple location string (city, region, country).
- Expose `GET /health` returning a readiness status.
- Cache responses in memory so the same coordinates are never queried twice.
- Throttle outgoing Nominatim requests to at most 1 per second.
- Provide API documentation for BFF consumers.
- Include unit and E2E tests.

**Non-Goals:**
- Forward geocoding (address to coordinates).
- Persistent/on-disk cache — in-memory is sufficient for the demo.
- Handling batch requests — each call resolves one coordinate pair.
- Deploying or configuring a self-hosted Nominatim instance.

## Decisions

### Framework: Express

**Choice:** Express (minimal setup).

**Rationale:** The project already requires Node.js 20.19+. Express is the most widely known Node.js HTTP framework, needs no build step, and keeps the service understandable for any contributor. Fastify or Hono would also work, but Express minimises onboarding friction and the service is too small for performance differences to matter.

**Alternatives considered:**
- *Node.js built-in `http` module* — viable but more boilerplate for routing, query parsing, and JSON responses.
- *Fastify* — better performance and schema validation, but adds learning curve for a two-endpoint service.

### Nominatim client: plain `fetch`

**Choice:** Use the global `fetch` available in Node 20+ to call Nominatim.

**Rationale:** No HTTP client library needed. The call is a single `GET` with query parameters. A thin adapter function wraps `fetch` so it can be mocked in tests.

### Rate limiter: in-memory queue in the adapter

**Choice:** An in-memory request queue inside the Nominatim adapter. Incoming uncached lookups are pushed onto the queue and drained one at a time, with at least 1 000 ms between each outgoing Nominatim call. The caller receives a promise that resolves when its item reaches the front and completes.

**Rationale:** Nominatim's policy is max 1 request/second. A simple timestamp gate works for sequential callers but breaks down when several concurrent requests arrive (they'd all sleep, then fire at once). A queue serialises outgoing calls properly: each request waits its turn, and the drain loop spaces them 1 s apart. No external library needed — just an array and a `setTimeout`-based drain function. This sits inside the adapter, invisible to the route handler.

### Cache: `Map<string, string>` keyed by rounded coordinates

**Choice:** An in-memory `Map` keyed by `"lat,lon"` (rounded to a fixed number of decimal places, e.g. 4 digits ≈ 11 m precision). Values are the formatted location string.

**Rationale:** Natural events don't move. A given coordinate pair will always resolve to the same place name. A simple `Map` avoids re-querying Nominatim. No TTL or eviction needed for the demo scope — the number of distinct coordinates from EONET events is small.

**Alternatives considered:**
- *LRU cache with TTL* — overkill given the small dataset and demo scope.
- *Redis* — adds infrastructure for no real benefit here.

### Response format: simple string

**Choice:** Return a JSON object with the original coordinates and a single `location` string formatted as `"City, Region, Country"`. Fields that Nominatim doesn't return for a given point are omitted from the string gracefully.

```json
{
  "lat": 38.89,
  "lon": -77.03,
  "location": "Washington, District of Columbia, United States"
}
```

### Project structure

```
services/location-context/
├── package.json
├── src/
│   ├── index.js          # Express app bootstrap + server start
│   ├── routes/
│   │   ├── health.js     # GET /health
│   │   └── location.js   # GET /location
│   ├── services/
│   │   └── nominatim.js  # Nominatim adapter (fetch + rate-limit + cache)
│   └── docs/
│       └── api.md        # Consumer documentation for the BFF team
├── tests/
│   ├── unit/
│   │   └── nominatim.test.js
│   └── e2e/
│       └── endpoints.test.js
└── README.md
```

## Risks / Trade-offs

- **Nominatim public instance availability** → The service degrades if Nominatim is down or rate-limits us. Mitigation: return a clear error response (`503`) with a message so the BFF can handle it. The cache absorbs repeat lookups.
- **Unbounded in-memory cache** → Memory grows with unique coordinates. Mitigation: acceptable for the demo. EONET exposes hundreds, not millions, of events. Can add LRU eviction later if needed.
- **Coordinate precision mismatch** → Two queries for nearly-identical coordinates (e.g. 38.8900 vs 38.8901) would trigger separate Nominatim calls returning the same place. Mitigation: round to 4 decimal places before cache lookup (≈ 11 m precision — more than enough for natural events).
- **No persistent cache** → Restarting the service loses all cached results. Mitigation: acceptable for a demo; the cache rebuilds organically from BFF traffic.
