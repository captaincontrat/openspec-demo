## Why

`nasa-events-service` must expose NASA EONET data through a small, stable local contract instead of leaking the upstream response shape directly to consumers. We need to define that contract now so the service can be implemented with a clear scope and a documented facade in `services/nasa-events/`.

## What Changes

- Add a dedicated OpenSpec change for `nasa-events-service` as a facade over `https://eonet.gsfc.nasa.gov/api/v3/events`.
- Define a single public business endpoint, `GET /api/events`, that returns only open events and takes no public query parameters.
- Define the normalized event payload shape exposed by the service: `id`, `title`, `description`, `link`, simplified `categories`, simplified `sources`, and normalized `location`.
- Exclude upstream fields and behaviors that are out of scope for the facade, including `status`, `closed`, and `geometry`.
- Add a service-specific convention document at `docs/conventions-nasa-events-service.md` so consumers have a written contract before implementation starts.

## Capabilities

### New Capabilities
- `nasa-events-listing`: Expose a stable local JSON facade for open NASA EONET events through `GET /api/events`.

### Modified Capabilities
<!-- None. -->

## Impact

- `openspec/changes/service-nasa-events/`: proposal, specs, design, and tasks for the new service change
- `docs/conventions-nasa-events-service.md`: service-specific consumption contract for `nasa-events-service`
- `services/nasa-events/`: future implementation location for the service code
- External dependency: `https://eonet.gsfc.nasa.gov/api/v3/events`
