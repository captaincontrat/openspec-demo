# Proposal: create-bff-nasa-monitor

## Summary

Create the BFF (Backend For Frontend) `bff-nasa-monitor` that orchestrates 4 microservices to power a dashboard displaying natural events on a world map with enriched contextual data (location, weather, air quality).

## Problem

The project needs a central aggregation layer between the frontend dashboard and 4 independent microservices (`nasa-events-service`, `location-context-service`, `weather-context-service`, `air-quality-service`). Without a BFF, the frontend would need to know about each service, handle orchestration, manage failures, and deal with inconsistent response formats — all of which belong server-side.

## Approach

**Strategy B — Two-step data loading:**

1. **Map load**: BFF calls `nasa-events-service` to get all events with coordinates. Returns a lightweight list for map rendering.
2. **Event click**: BFF calls the 3 context services in parallel (`location-context`, `weather-context`, `air-quality`) to enrich a single event. Returns a composite response with graceful degradation.

The BFF guarantees a **stable contract to the frontend** regardless of how individual microservices behave (adapter pattern).

## Scope

### In scope

- Express.js application in `apps/bff/` on port 3000
- `GET /api/events` — list all natural events for the map (cached 5 min)
- `GET /api/events/:id` with `lat` and `lon` query params — enriched detail (cached 2 min)
- `GET /health` — enriched health check showing status of all 4 downstream services
- Adapter layer to normalize responses from each microservice
- Category style mapping (color + icon per EONET category)
- Graceful degradation via `Promise.allSettled` (partial responses when services are down)
- In-memory caching with TTL (`node-cache`)
- Unit tests (vitest) and E2E tests (supertest + vitest)

### Out of scope

- The 4 microservices themselves (developed by other team members)
- The frontend dashboard
- Authentication / authorization
- Database or persistent storage
- Deployment / containerization

## Constraints

- Must follow conventions from `docs/conventions-microservices.md` (port 3000, `apps/bff/` directory, health endpoint)
- Must not call external APIs directly — only compose local microservices
- Must handle microservice unavailability without crashing
- Must work even when microservices return unexpected response formats (defensive adapters)

## Success criteria

- BFF starts on port 3000 and responds to `GET /health`
- `GET /api/events` returns normalized event list from nasa-events-service with category styling
- `GET /api/events/:id?lat=X&lon=Y` returns composite response from 3 context services
- If a context service is down, response includes partial data with per-section error status
- All unit and E2E tests pass
