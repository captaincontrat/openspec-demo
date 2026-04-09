## ADDED Requirements

### Requirement: Expose an open events listing
`nasa-events-service` SHALL expose `GET /events` and return a JSON document containing only open events from NASA EONET. The public contract SHALL not require any query parameters.

#### Scenario: Client requests the event list
- **WHEN** a client sends `GET /events`
- **THEN** the service returns HTTP 200 with a JSON body
- **AND** the body contains a top-level `source` string equal to `NASA EONET`
- **AND** the body contains a top-level `events` array
- **AND** the returned events correspond only to upstream events that are currently open

### Requirement: Normalize the public event shape
For each returned event, the service SHALL expose only the fields `id`, `title`, `description`, `link`, `categories`, `sources`, and `location`. The service SHALL NOT expose upstream `status`, `closed`, or `geometry` fields in its public event payload.

#### Scenario: Event payload is simplified for consumers
- **WHEN** the service includes an event in the response
- **THEN** the event object includes `id`, `title`, `description`, `link`, `categories`, `sources`, and `location`
- **AND** `categories` is an array of category IDs
- **AND** `sources` is an array of source URLs
- **AND** `location` contains `lat` and `lon`
- **AND** the event object does not contain `status`, `closed`, or `geometry`

### Requirement: Return only location-normalized events
The service SHALL return only events that it can normalize into a single `lat` and `lon` pair for the public contract.

#### Scenario: Upstream event cannot be represented as a single location
- **WHEN** an upstream event cannot be normalized into one `lat` and `lon`
- **THEN** the service omits that event from the `events` array

### Requirement: Translate upstream failures into JSON errors
The service SHALL translate upstream failures into a stable JSON error payload instead of leaking raw NASA EONET responses or transport details.

#### Scenario: NASA EONET is unavailable
- **WHEN** NASA EONET cannot be reached or returns an unusable response
- **THEN** the service returns a JSON error body
- **AND** the error body contains `error.code`
- **AND** the error body contains `error.message`

### Requirement: Expose a health endpoint
`nasa-events-service` SHALL expose `GET /health` and return a JSON payload identifying the service as healthy.

#### Scenario: Client requests service health
- **WHEN** a client sends `GET /health`
- **THEN** the service returns HTTP 200 with a JSON body
- **AND** the body contains `status` equal to `ok`
- **AND** the body contains `service` equal to `nasa-events-service`
