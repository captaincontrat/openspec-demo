# Tasks: create-bff-nasa-monitor

## Task 1: Project scaffold and configuration

**Status**: done

Set up the `apps/bff/` project structure with all dependencies and configuration.

**Subtasks**:
- Initialize `package.json` with `"type": "module"` (ESM)
- Add dependencies: `express`, `node-cache`
- Add dev dependencies: `vitest`, `supertest`
- Create `vitest.config.js`
- Create `src/config.js` with service URLs, ports, TTLs, and category style mapping
- Create `src/cache.js` with node-cache singleton (events TTL 5min, detail TTL 2min)
- Create `src/app.js` (Express app setup, middleware, route mounting — exported for tests)
- Create `src/server.js` (entry point, imports app and starts listening on port 3000)

**Files to create**:
- `apps/bff/package.json`
- `apps/bff/vitest.config.js`
- `apps/bff/src/config.js`
- `apps/bff/src/cache.js`
- `apps/bff/src/app.js`
- `apps/bff/src/server.js`

---

## Task 2: Adapters

**Status**: done
**Depends on**: Task 1

Create the 4 adapter modules that normalize microservice responses into stable internal formats. Each adapter must handle expected contract fields AND common variants (defensive coding for contract deviations).

**Subtasks**:
- Create `src/adapters/nasa-events.adapter.js` — normalizes event list from nasa-events-service; maps EONET categories to style metadata (color + icon)
- Create `src/adapters/location-context.adapter.js` — normalizes reverse geocoding response; tries `location` then `result` wrappers, resolves `name`/`city_name`, `admin`/`state`, `country`/`country_name`, `countryCode`/`country_code`
- Create `src/adapters/weather-context.adapter.js` — normalizes weather forecast; resolves `temperature`, `humidity`, `windSpeed`/`wind_speed`, `windDirection`/`wind_direction`, `description`
- Create `src/adapters/air-quality.adapter.js` — normalizes air quality data; resolves `aqi`, `pm25`/`pm2_5`, `pm10`, `no2`, `o3`

**Files to create**:
- `apps/bff/src/adapters/nasa-events.adapter.js`
- `apps/bff/src/adapters/location-context.adapter.js`
- `apps/bff/src/adapters/weather-context.adapter.js`
- `apps/bff/src/adapters/air-quality.adapter.js`

---

## Task 3: Service layer

**Status**: done
**Depends on**: Task 1, Task 2

Create the 4 service modules that handle HTTP communication with downstream microservices. Each service uses native `fetch`, handles timeouts and errors, and delegates response transformation to its adapter.

**Subtasks**:
- Create `src/services/nasa-events.service.js` — `GET {NASA_EVENTS_URL}/api/events`, passes through optional query params (category, status), uses nasa-events adapter
- Create `src/services/location-context.service.js` — `GET {LOCATION_CONTEXT_URL}/api/location?lat=X&lon=Y`, uses location-context adapter
- Create `src/services/weather-context.service.js` — `GET {WEATHER_CONTEXT_URL}/api/weather?lat=X&lon=Y`, uses weather-context adapter
- Create `src/services/air-quality.service.js` — `GET {AIR_QUALITY_URL}/api/air-quality?lat=X&lon=Y`, uses air-quality adapter

Each service must:
- Set a request timeout (5 seconds)
- Return `{ status: "ok", data: ... }` on success
- Return `{ status: "error", error: "message" }` on failure (no throw)

**Files to create**:
- `apps/bff/src/services/nasa-events.service.js`
- `apps/bff/src/services/location-context.service.js`
- `apps/bff/src/services/weather-context.service.js`
- `apps/bff/src/services/air-quality.service.js`

---

## Task 4: Routes

**Status**: done
**Depends on**: Task 3

Create the Express route handlers.

**Subtasks**:
- Create `src/routes/events.js`:
  - `GET /api/events` — calls nasa-events service, applies cache (5 min TTL), returns event list with category styles
  - `GET /api/events/:id` — requires `lat` and `lon` query params; calls location-context, weather-context, and air-quality services in parallel via `Promise.allSettled`; caches composite result (2 min TTL); returns partial response with per-section status
- Create `src/routes/health.js`:
  - `GET /health` — pings all 4 downstream service `/health` endpoints in parallel; reports per-service status and response time; computes top-level status (`healthy` / `degraded` / `unhealthy`); includes BFF uptime

**Files to create**:
- `apps/bff/src/routes/events.js`
- `apps/bff/src/routes/health.js`

---

## Task 5: Wire everything in app.js

**Status**: done
**Depends on**: Task 4

Mount routes in the Express app, add error-handling middleware, and ensure `server.js` starts correctly.

**Subtasks**:
- Mount health route and events routes in `app.js`
- Add JSON body parsing middleware
- Add global error handler (catches unhandled errors, returns 500 with generic message)
- Verify `server.js` imports `app.js` and calls `app.listen(config.port)`

**Files to modify**:
- `apps/bff/src/app.js`
- `apps/bff/src/server.js`

---

## Task 6: Unit tests

**Status**: done
**Depends on**: Task 2, Task 3

Write unit tests for adapters and service layer.

**Subtasks**:
- Test each adapter with the expected contract format → correct output
- Test each adapter with deviated format (renamed fields) → still produces correct output
- Test each adapter with missing/null fields → returns null defaults without crashing
- Test each service with mocked fetch (success case) → returns `{ status: "ok", data }`
- Test each service with mocked fetch (failure/timeout) → returns `{ status: "error", error }`

**Files to create**:
- `apps/bff/tests/unit/adapters/nasa-events.adapter.test.js`
- `apps/bff/tests/unit/adapters/location-context.adapter.test.js`
- `apps/bff/tests/unit/adapters/weather-context.adapter.test.js`
- `apps/bff/tests/unit/adapters/air-quality.adapter.test.js`
- `apps/bff/tests/unit/services/nasa-events.service.test.js`

---

## Task 7: E2E tests

**Status**: done
**Depends on**: Task 5

Write E2E tests using supertest against the Express app (no real server start needed).

**Subtasks**:
- Test `GET /health` returns 200 with expected structure
- Test `GET /api/events` returns 200 with events array (mocked nasa-events service)
- Test `GET /api/events/:id?lat=X&lon=Y` returns 200 with composite response (mocked downstream services)
- Test `GET /api/events/:id` without lat/lon returns 400
- Test partial response when one context service is down

**Files to create**:
- `apps/bff/tests/e2e/health.test.js`
- `apps/bff/tests/e2e/events.test.js`
