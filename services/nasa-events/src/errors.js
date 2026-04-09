export class UpstreamServiceError extends Error {
  constructor(message = "NASA EONET is unavailable") {
    super(message);
    this.name = "UpstreamServiceError";
    this.code = "UPSTREAM_UNAVAILABLE";
    this.statusCode = 502;
    this.publicMessage = message;
  }
}

export class UpstreamBadResponseError extends Error {
  constructor(message = "NASA EONET returned an unusable response") {
    super(message);
    this.name = "UpstreamBadResponseError";
    this.code = "UPSTREAM_BAD_RESPONSE";
    this.statusCode = 502;
    this.publicMessage = message;
  }
}

export function toErrorResponse(error) {
  if (error?.code && error?.statusCode && error?.publicMessage) {
    return {
      statusCode: error.statusCode,
      body: {
        error: {
          code: error.code,
          message: error.publicMessage,
        },
      },
    };
  }

  return {
    statusCode: 500,
    body: {
      error: {
        code: "INTERNAL_ERROR",
        message: "Internal server error",
      },
    },
  };
}
