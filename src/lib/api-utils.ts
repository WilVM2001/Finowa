import { NextResponse } from "next/server"
import { ZodError } from "zod"
import { ApiError, NotFoundError, ForbiddenError, UnauthorizedError, ConflictError, RateLimitError, ValidationError } from "./errors"

export { ApiError, NotFoundError, ForbiddenError, UnauthorizedError, ConflictError, RateLimitError, ValidationError }

export type ApiHandler = (
  req: Request,
  context: { userId: string; params: Record<string, string> }
) => Promise<NextResponse>

export function withAuth(handler: ApiHandler) {
  return async (
    req: Request,
    { params }: { params: Promise<Record<string, string>> } = { params: Promise.resolve({}) }
  ): Promise<NextResponse> => {
    const { auth } = await import("@/lib/auth")
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado", code: "UNAUTHORIZED" },
        { status: 401 }
      )
    }

    try {
      const resolvedParams = await params
      return await handler(req, { userId: session.user.id, params: resolvedParams })
    } catch (error) {
      return handleApiError(error)
    }
  }
}

export function withRole(allowedRoles: string[]) {
  return (handler: ApiHandler) => {
    return async (
      req: Request,
      routeCtx: { params: Promise<Record<string, string>> } = { params: Promise.resolve({}) }
    ): Promise<NextResponse> => {
      const { auth } = await import("@/lib/auth")
      const { prisma } = await import("@/lib/prisma")

      const session = await auth()
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: "No autorizado", code: "UNAUTHORIZED" },
          { status: 401 }
        )
      }

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true, isActive: true },
      })

      if (!user || !user.isActive) {
        return NextResponse.json(
          { error: "Cuenta desactivada", code: "ACCOUNT_DISABLED" },
          { status: 403 }
        )
      }

      if (!allowedRoles.includes(user.role)) {
        return NextResponse.json(
          { error: "Acceso denegado", code: "FORBIDDEN" },
          { status: 403 }
        )
      }

      try {
        const resolvedParams = await routeCtx.params
        return await handler(req, { userId: session.user.id, params: resolvedParams })
      } catch (error) {
        return handleApiError(error)
      }
    }
  }
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Datos inválidos",
        code: "VALIDATION_ERROR",
        details: error.issues.map((e) => ({
          field: String(e.path.join(".")),
          message: e.message,
        })),
      },
      { status: 400 }
    )
  }

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        ...(error.metadata && { details: error.metadata }),
      },
      { status: error.statusCode }
    )
  }

  console.error("[API Error]", error instanceof Error ? error.message : error)
  return NextResponse.json(
    { error: "Error interno del servidor", code: "INTERNAL_ERROR" },
    { status: 500 }
  )
}

export function success<T>(data: T, status = 200) {
  return NextResponse.json(data, { status })
}

export function parseBody<T = Record<string, unknown>>(req: Request): Promise<T> {
  return req.json().catch(() => {
    throw new ApiError(400, "INVALID_JSON", "El cuerpo de la solicitud no es JSON válido")
  }) as Promise<T>
}
