export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvalidQueryError extends AppError {
  constructor(message = "latitude and longitude query parameters must be valid coordinates", details?: unknown) {
    super(message, 400, "INVALID_QUERY", details);
  }
}

export class UpstreamResponseError extends AppError {
  constructor(message = "Air quality provider returned an invalid response", details?: unknown) {
    super(message, 502, "UPSTREAM_RESPONSE_ERROR", details);
  }
}

export class UpstreamTimeoutError extends AppError {
  constructor(message = "Air quality provider timed out", details?: unknown) {
    super(message, 504, "UPSTREAM_TIMEOUT", details);
  }
}
