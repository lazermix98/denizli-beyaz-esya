export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "CONFLICT"
  | "CONFIGURATION_ERROR"
  | "UPSTREAM_ERROR";

const statusByCode: Record<ApiErrorCode, number> = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  RATE_LIMITED: 429,
  CONFLICT: 409,
  CONFIGURATION_ERROR: 503,
  UPSTREAM_ERROR: 502,
};

export class ApiError extends Error {
  constructor(
    public code: ApiErrorCode,
    message: string,
    public details?: unknown
  ) {
    super(message);
  }
}

export function errorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return Response.json(
      { error: error.message, code: error.code, details: error.details },
      { status: statusByCode[error.code] }
    );
  }

  const message =
    process.env.NODE_ENV === "development" && error instanceof Error
      ? error.message
      : "İşlem tamamlanamadı.";
  return Response.json({ error: message, code: "UPSTREAM_ERROR" }, { status: 500 });
}

export function safeMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) return error.message;
  return process.env.NODE_ENV === "development" && error instanceof Error ? error.message : fallback;
}
