import { describe, it, expect } from "vitest"
import {
  ApiError,
  ValidationError,
  NotFoundError,
  ForbiddenError,
  UnauthorizedError,
  ConflictError,
  RateLimitError,
} from "@/lib/errors"

describe("ApiError", () => {
  it("crea error con código y mensaje", () => {
    const err = new ApiError(400, "BAD_REQUEST", "Solicitud inválida")
    expect(err.statusCode).toBe(400)
    expect(err.code).toBe("BAD_REQUEST")
    expect(err.message).toBe("Solicitud inválida")
    expect(err.name).toBe("ApiError")
  })

  it("acepta metadata opcional", () => {
    const err = new ApiError(500, "ERR", "msg", { field: "x" })
    expect(err.metadata).toEqual({ field: "x" })
  })
})

describe("ValidationError", () => {
  it("hereda de ApiError con status 400", () => {
    const err = new ValidationError("Campo requerido")
    expect(err.statusCode).toBe(400)
    expect(err.code).toBe("VALIDATION_ERROR")
    expect(err).toBeInstanceOf(ApiError)
  })
})

describe("NotFoundError", () => {
  it("formatea mensaje con entidad", () => {
    const err = new NotFoundError("Usuario", "abc123")
    expect(err.message).toContain("Usuario")
    expect(err.message).toContain("abc123")
    expect(err.statusCode).toBe(404)
  })
})

describe("ForbiddenError", () => {
  it("tiene status 403", () => {
    const err = new ForbiddenError()
    expect(err.statusCode).toBe(403)
  })
})

describe("UnauthorizedError", () => {
  it("tiene status 401", () => {
    const err = new UnauthorizedError()
    expect(err.statusCode).toBe(401)
  })
})

describe("ConflictError", () => {
  it("tiene status 409", () => {
    const err = new ConflictError("Ya existe")
    expect(err.statusCode).toBe(409)
  })
})

describe("RateLimitError", () => {
  it("tiene status 429", () => {
    const err = new RateLimitError()
    expect(err.statusCode).toBe(429)
  })
})
