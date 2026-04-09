# Delta for Air Quality Service

## ADDED Requirements

### Requirement: Service Health Endpoint

The system SHALL expose a health endpoint so local consumers can verify that `air-quality-service` is running.

#### Scenario: Healthy service

- GIVEN the service process is running
- WHEN a client sends `GET /health`
- THEN the service responds with HTTP `200`
- AND the response body is JSON
- AND the response indicates that the service is healthy

### Requirement: Current Air Quality Lookup

The system SHALL return current air-quality context for a latitude and longitude pair by querying the Open-Meteo Air Quality API.

#### Scenario: Valid coordinates return normalized air-quality data

- GIVEN a client provides valid `latitude` and `longitude` query parameters
- WHEN the client sends `GET /air-quality/current`
- THEN the service responds with HTTP `200`
- AND the response body is JSON
- AND the response includes the resolved location coordinates
- AND the response includes the observation timestamp
- AND the response includes `europeanAqi`, `pm10`, and `pm2_5`
- AND the response identifies the upstream source

#### Scenario: Invalid coordinates are rejected

- GIVEN a client omits or provides invalid `latitude` or `longitude`
- WHEN the client sends `GET /air-quality/current`
- THEN the service responds with HTTP `400`
- AND the response explains that the query parameters are invalid

### Requirement: Upstream Failure Handling

The system SHALL fail clearly when the upstream air-quality provider is unavailable, times out, or returns unusable data.

#### Scenario: Upstream provider failure

- GIVEN the upstream provider returns an error, timeout, or malformed payload
- WHEN the service handles `GET /air-quality/current`
- THEN the service responds with an HTTP `5xx` status
- AND the service does not return a fabricated air-quality payload
- AND the response identifies the failure as upstream-related
