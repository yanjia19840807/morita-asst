export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class NotFoundError extends APIError {
  constructor(resource: string) {
    super('未查询到数据', 404, 'NOT_FOUND')
  }
}

export class ValidationError extends APIError {
  constructor(
    message: string,
    public details?: unknown
  ) {
    super(message, 400, 'VALIDATION_ERROR')
  }
}

export class UnauthorizedError extends APIError {
  constructor() {
    super('未认证', 401, 'UNAUTHORIZED')
  }
}

export class ForbiddenError extends APIError {
  constructor() {
    super('未授权', 403, 'FORBIDDEN')
  }
}
