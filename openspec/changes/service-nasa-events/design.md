## Context

`nasa-events-service` is one of the standalone workshop services defined in `docs/conventions-microservices.md`. It must live in `services/nasa-events/`, listen on port `3001`, expose `GET /health`, and use NASA EONET as its only upstream provider.

The upstream API at `https://eonet.gsfc.nasa.gov/api/v3/events` exposes richer and more variable event objects than we want to commit to in the local contract. In particular, EONET event payloads include `closed`, `geometry`, and category/source structures that are useful internally but would make the local service harder to consume if forwarded directly.

This change defines the contract and design for a thin facade service before implementation starts. The main external consumer concern is a stable event-list response, not access to the full upstream model.

## Goals / Non-Goals

**Goals:**
- Define a stable local contract for `GET /events`.
- Restrict the public service scope to open NASA EONET events only.
- Normalize each returned event into a small payload with consumer-friendly fields.
- Document the service contract in a dedicated file, `docs/conventions-nasa-events-service.md`.
- Keep the service small enough to implement quickly in `services/nasa-events/`.

**Non-Goals:**
- Expose arbitrary passthrough query parameters to NASA EONET.
- Provide event detail endpoints or additional NASA EONET resources.
- Expose raw `geometry`, `closed`, or upstream status details.
- Add persistence, authentication, caching, or cross-service composition.
- Define conventions for the other microservices or for the BFF as a whole.

## Decisions

### Decision: Build a facade, not a proxy
The service will expose a purpose-built JSON contract instead of forwarding the upstream response shape.

Rationale:
- A facade gives consumers one stable format even if upstream details change.
- It avoids making consumers understand EONET-specific structures like `geometry[]` and source/category objects.
- It keeps the implementation scope aligned with the workshop goal: one thin service with one useful endpoint.

Alternatives considered:
- Raw proxying of the EONET response. Rejected because it leaks upstream complexity and undermines the value of the service boundary.
- Partial passthrough with optional raw fields. Rejected because it would create two competing contracts from the start.

### Decision: `GET /events` has no public query parameters
The public contract for the first version will be a single, parameterless `GET /events` endpoint.

Rationale:
- The user explicitly wants an ultra-simple contract.
- Removing public filters keeps the service contract small and easy to document.
- The service remains free to call EONET with internal defaults appropriate for open events without committing those controls to public consumers.

Alternatives considered:
- Exposing `status`, `limit`, `days`, or `category`. Rejected because they broaden the contract before we have a proven need.

### Decision: Return only normalized, open events
The service will return only open events and will expose each event with these fields:
- `id`
- `title`
- `description`
- `link`
- `categories` as `string[]`
- `sources` as `string[]`
- `location` as `{ lat, lon }`

Rationale:
- This is the minimum useful shape derived from the user requirements.
- It preserves the human-readable event information while stripping out upstream structure that consumers should not rely on.
- `location.lat` and `location.lon` avoid forcing consumers to interpret GeoJSON coordinate ordering.

Alternatives considered:
- Including `closed` or public `status`. Rejected because the service scope is only current events.
- Including full category or source objects. Rejected because consumers only need category IDs and source URLs.
- Including raw `geometry`. Rejected because it leaks the upstream model and complicates consumers.

### Decision: Exclude events that cannot be reduced to one location
The service will only return events it can normalize into a single latitude/longitude pair.

Rationale:
- The public contract requires a single `location` object.
- Some upstream events may be represented with shapes or histories that do not fit that contract cleanly.
- Omitting unrepresentable events is simpler and safer than inventing a lossy geometry contract we do not want to support.

Alternatives considered:
- Exposing raw geometry for unsupported cases. Rejected because it breaks the simplified facade.
- Returning events with nullable location values. Rejected because it weakens the usefulness of the contract for consumers.

### Decision: Standardize error responses as JSON
The service will return JSON error payloads with `error.code` and `error.message` for upstream failures.

Rationale:
- Consumers need a stable error shape independent of HTTP library details.
- This keeps upstream failure details from leaking through the service boundary.

Alternatives considered:
- Forwarding raw upstream bodies or text errors. Rejected because they are unstable and couple consumers to NASA EONET behavior.

## Risks / Trade-offs

- [Some open EONET events may be omitted because they cannot be represented as one location] -> Mitigation: document this explicitly in the service convention and spec so the behavior is intentional, not surprising.
- [A parameterless endpoint may return more data than some consumers want] -> Mitigation: keep the first version intentionally narrow and revisit filtering only if a real consumer need appears.
- [Upstream schema changes could break normalization logic] -> Mitigation: normalize only the small set of required fields and cover the upstream adapter with unit tests during implementation.
- [Consumers may later want richer event history or geometry] -> Mitigation: treat that as a future capability rather than leaking extra fields into the initial contract.

## Migration Plan

1. Add the service-specific convention document at `docs/conventions-nasa-events-service.md`.
2. Implement `nasa-events-service` in `services/nasa-events/` using the documented contract.
3. Verify `GET /health` and `GET /events` locally against live NASA EONET data.

Rollback is straightforward because this change introduces a new service contract rather than modifying an existing one. The contract artifacts can be revised before implementation if needed.

## Open Questions

- None for the initial implementation. The service uses the most recent valid `Point` geometry as the canonical `location`, and it does not expose or document an internal fetch limit in the public contract.
