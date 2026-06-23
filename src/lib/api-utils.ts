import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { ZodError } from "zod"

export type ApiHandler = (
  req: Request,
  context: { userId: string; params: Record<string, string> }
) => Promise<NextResponse>

export function withAuth(handler: ApiHandler) {
  return async (
    req: Request,
    { params }: { params: Promise<Record<string, string>> } = { params: Promise.resolve({}) }
  ): Promise<NextResponse> => {
    try {
      const session = await auth()
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: "No autorizado", code: "UNAUTHORIZED" },
          { status: 401 }
        )
      }

      const resolvedParams = await params
      return await handler(req, { userId: session.user.id, params: resolvedParams })
    } catch (error) {
      return handleApiError(error)
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
      { error: error.message, code: error.code },
      { status: error.status }
    )
  }

  console.error("[API Error]", error)
  return NextResponse.json(
    { error: "Error interno del servidor", code: "INTERNAL_ERROR" },
    { status: 500 }
  )
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export function success<T>(data: T, status = 200) {
  return NextResponse.json(data, { status })
}

export function parseBody<T = Record<string, unknown>>(req: Request): Promise<T> {
  return req.json() as Promise<T>
}
