## ADDED Requirements

### Requirement: Reverse geocode coordinates
The service SHALL accept a `GET /location` request with `lat` and `lon` query parameters and return a JSON response containing the original coordinates and a human-readable location string formatted as `"City, Region, Country"`.

#### Scenario: Valid coordinates
- **WHEN** the client sends `GET /location?lat=38.89&lon=-77.03`
- **THEN** the service returns HTTP 200 with a JSON body containing `lat`, `lon`, and a `location` string (e.g. `"Washington, District of Columbia, United States"`)

#### Scenario: Missing query parameters
- **WHEN** the client sends `GET /location` without `lat` or `lon`
- **THEN** the service returns HTTP 400 with an error message indicating the missing parameters

#### Scenario: Invalid coordinate values
- **WHEN** the client sends `GET /location?lat=abc&lon=xyz`
- **THEN** the service returns HTTP 400 with an error message indicating the values are not valid numbers

#### Scenario: Coordinates in the ocean or uninhabited area
- **WHEN** the client sends coordinates that Nominatim cannot resolve to a named place
- **THEN** the service returns HTTP 200 with a `location` string containing whatever information Nominatim provides (country or partial data), or `"Unknown location"` if Nominatim returns no usable fields

### Requirement: Health check endpoint
The service SHALL expose a `GET /health` endpoint that returns a readiness status.

#### Scenario: Service is running
- **WHEN** the client sends `GET /health`
- **THEN** the service returns HTTP 200 with a JSON body containing `{ "status": "ok" }`

### Requirement: In-memory caching
The service SHALL cache reverse-geocoding results in memory so that identical coordinates are never queried against Nominatim more than once.

#### Scenario: First request for a coordinate pair
- **WHEN** the client requests a coordinate pair for the first time
- **THEN** the service queries Nominatim, caches the result, and returns it

#### Scenario: Repeated request for the same coordinates
- **WHEN** the client requests the same coordinate pair a second time
- **THEN** the service returns the cached result without calling Nominatim

#### Scenario: Nearly-identical coordinates
- **WHEN** the client requests coordinates that differ only beyond the 4th decimal place (e.g. 38.89001 vs 38.89002)
- **THEN** the service treats them as the same cache key (rounded to 4 decimal places)

### Requirement: Nominatim rate limiting
The service SHALL NOT send more than one request per second to the Nominatim API.

#### Scenario: Rapid successive uncached requests
- **WHEN** multiple uncached coordinate requests arrive within the same second
- **THEN** the service queues outgoing Nominatim calls so that at most one is sent per second

### Requirement: Nominatim unavailability handling
The service SHALL return a clear error when Nominatim is unreachable or returns an error.

#### Scenario: Nominatim returns a non-200 response
- **WHEN** the Nominatim API responds with a 5xx or 4xx error
- **THEN** the service returns HTTP 503 with an error message indicating the upstream service is unavailable

#### Scenario: Nominatim request times out
- **WHEN** the Nominatim API does not respond within a reasonable timeout
- **THEN** the service returns HTTP 503 with an error message indicating a timeout

### Requirement: Consumer API documentation
The service SHALL include a documentation file describing the endpoint contract, expected query parameters, response format, and error cases for BFF consumers.

#### Scenario: Documentation is accessible
- **WHEN** a BFF developer looks at `services/location-context/src/docs/api.md`
- **THEN** they find endpoint descriptions, request/response examples, and error code explanations

### Requirement: Meaningful User-Agent header
The service SHALL send a descriptive `User-Agent` header with every Nominatim request, as required by Nominatim's usage policy.

#### Scenario: Outgoing request headers
- **WHEN** the service makes a request to Nominatim
- **THEN** the `User-Agent` header contains the service name (e.g. `location-context-service/1.0`)
