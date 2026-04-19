import { NextResponse } from "next/server";

// lib/api/errors.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, "NOT_FOUND");
  }
}

export class ValidationError extends ApiError {
  constructor(
    message: string,
    public details?: unknown,
  ) {
    super(message, 400, "VALIDATION_ERROR");
  }
}

export class UnauthorizedError extends ApiError {
  constructor() {
    super("Unauthorized", 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends ApiError {
  constructor() {
    super("Forbidden", 403, "FORBIDDEN");
  }
}

export function handleApiError(error: unknown) {
  console.error("API Error:", error);

  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode },
    );
  }

  // Don't expose internal errors to clients
  return NextResponse.json(
    { error: "Internal server error", code: "INTERNAL_ERROR" },
    { status: 500 },
  );
}
