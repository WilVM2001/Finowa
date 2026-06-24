export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public metadata?: Record<string, unknown>
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, errors?: unknown) {
    super(400, "VALIDATION_ERROR", message, errors ? { errors } : undefined)
    this.name = "ValidationError"
  }
}

export class NotFoundError extends ApiError {
  constructor(entity: string, id?: string) {
    super(404, "NOT_FOUND", `${entity} no encontrado${id ? ` (ID: ${id})` : ""}`)
    this.name = "NotFoundError"
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = "Acceso denegado") {
    super(403, "FORBIDDEN", message)
    this.name = "ForbiddenError"
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "No autorizado") {
    super(401, "UNAUTHORIZED", message)
    this.name = "UnauthorizedError"
  }
}

export class ConflictError extends ApiError {
  constructor(message: string) {
    super(409, "CONFLICT", message)
    this.name = "ConflictError"
  }
}

export class RateLimitError extends ApiError {
  constructor(message = "Demasiadas solicitudes. Intenta de nuevo en unos segundos.") {
    super(429, "RATE_LIMIT", message)
    this.name = "RateLimitError"
  }
}
