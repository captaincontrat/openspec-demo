## 1. Contract documentation

- [ ] 1.1 Create `docs/conventions-nasa-events-service.md` with the service identity, endpoint list, response shape, excluded fields, and JSON error format.
- [ ] 1.2 Include at least one concrete JSON example for `GET /events` and one for `GET /health` in the convention document.

## 2. Service scaffold

- [ ] 2.1 Create the `services/nasa-events/` application scaffold and configure it to run on port `3001`.
- [ ] 2.2 Add a `GET /health` endpoint that returns `{ "status": "ok", "service": "nasa-events-service" }`.

## 3. EONET facade implementation

- [ ] 3.1 Implement an upstream adapter for `https://eonet.gsfc.nasa.gov/api/v3/events` that fetches open events only.
- [ ] 3.2 Normalize upstream events into the public facade shape with `id`, `title`, `description`, `link`, `categories`, `sources`, and `location`.
- [ ] 3.3 Omit events that cannot be reduced to a single `{ lat, lon }` location and ensure public payloads never expose `status`, `closed`, or `geometry`.
- [ ] 3.4 Add `GET /events` with the parameterless JSON contract defined in the convention document.

## 4. Verification

- [ ] 4.1 Add unit tests for the normalization logic and the upstream adapter error handling.
- [ ] 4.2 Add E2E tests covering service startup, `GET /health`, and `GET /events`.
- [ ] 4.3 Run the local test suite and manually verify live responses from NASA EONET.
