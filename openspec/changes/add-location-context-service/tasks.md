## 1. Project scaffolding

- [x] 1.1 Create `services/location-context/` directory with `package.json` (name: `location-context-service`, dependencies: `express`; devDependencies: test runner)
- [x] 1.2 Create `src/index.js` with Express app listening on port 3002

## 2. Health endpoint

- [x] 2.1 Create `src/routes/health.js` exposing `GET /health` returning `{ "status": "ok" }`
- [x] 2.2 Register the health route in `src/index.js`

## 3. Nominatim adapter

- [x] 3.1 Create `src/services/nominatim.js` with a `reverseGeocode(lat, lon)` function that calls Nominatim `/reverse` via `fetch`, sends a `User-Agent` header (`location-context-service/1.0`), and returns parsed address fields
- [x] 3.2 Add rate-limited request queue — uncached lookups are pushed onto an in-memory queue; a drain loop processes them one at a time with at least 1 000 ms between each outgoing Nominatim call, returning a promise to each caller
- [x] 3.3 Add in-memory cache (`Map`) keyed by coordinates rounded to 4 decimal places; return cached result on hit, skip Nominatim call
- [x] 3.4 Handle Nominatim errors (non-200 responses, timeouts) — throw typed errors the route can catch

## 4. Location endpoint

- [x] 4.1 Create `src/routes/location.js` exposing `GET /location?lat=<lat>&lon=<lon>`
- [x] 4.2 Validate query parameters (presence and numeric format); return 400 on invalid input
- [x] 4.3 Call `reverseGeocode`, format the result as `"City, Region, Country"` (skip missing fields gracefully), return JSON `{ lat, lon, location }`
- [x] 4.4 Handle upstream errors from the adapter — return 503 with an error message

## 5. Consumer API documentation

- [x] 5.1 Create `src/docs/api.md` documenting `GET /location` and `GET /health` (parameters, response format, error codes, examples)

## 6. Unit tests

- [x] 6.1 Test `reverseGeocode` — mock `fetch`, verify Nominatim URL construction, User-Agent header, and response parsing
- [x] 6.2 Test cache behavior — verify second call with same coordinates does not trigger `fetch`
- [x] 6.3 Test rate limiting — verify calls are spaced at least 1 000 ms apart
- [x] 6.4 Test location route — mock adapter, verify 200 with valid input, 400 on missing/invalid params, 503 on upstream error

## 7. E2E tests

- [x] 7.1 Test server startup and `GET /health` returns 200
- [x] 7.2 Test `GET /location` with valid coordinates returns 200 and a location string
- [x] 7.3 Test `GET /location` with missing/invalid parameters returns 400
