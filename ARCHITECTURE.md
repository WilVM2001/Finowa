# Arquitectura de Finowa

## Stack Técnico

```
Frontend ─── Next.js 16 (App Router) + React 19 + TypeScript
Estilos  ─── TailwindCSS 4 + Framer Motion + Lucide Icons
3D       ─── React Three Fiber + @react-three/drei
Backend  ─── Next.js API Routes (REST)
ORM      ─── Prisma 7 (SQLite/libSQL)
Auth     ─── NextAuth v5 (Credentials + JWT)
Validación ── Zod v4
Testing  ─── Vitest + Testing Library
```

## Patrón de Arquitectura

La aplicación sigue una arquitectura **monolítica modular** con Next.js App Router:

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js App Router                     │
├──────────────┬──────────────┬──────────────────────────────┤
│   Pages      │   API Routes │   Components                 │
│   (RSC/CC)   │   (REST)     │   (Client/Server)            │
└──────────────┴──────────────┴──────────────────────────────┘
        │              │               │
        ▼              ▼               ▼
┌──────────────────────────────────────────────────────────┐
│                    Capa de Negocio                        │
│  lib/auth.ts  lib/prisma.ts  lib/errors.ts               │
│  lib/validations.ts  lib/api-utils.ts  lib/audit.ts      │
└──────────────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────┐
│                    Persistencia                            │
│  Prisma ORM → SQLite (libSQL) archivo: prisma/dev.db     │
└──────────────────────────────────────────────────────────┘
```

## Flujo de Autenticación

```
1. Usuario envía POST /api/auth/callback/credentials
2. NextAuth valida credenciales contra Prisma (bcrypt)
3. JWT firmado con AUTH_SECRET
4. Sesión almacenada en cookie httpOnly
5. Middleware withAuth protege rutas API
6. Roles (USER/ADMIN/SUPER_ADMIN) via withRole
```

## Sistema de Roles (RBAC)

| Rol | Dashboard | Admin Panel | Gestión Usuarios |
|-----|-----------|-------------|------------------|
| USER | ✅ | ❌ | ❌ |
| ADMIN | ✅ | ✅ (limitado) | ❌ |
| SUPER_ADMIN | ✅ | ✅ (completo) | ✅ |

## Manejo de Errores

```
AppError (base)
├── ValidationError   (400) — Datos inválidos
├── NotFoundError     (404) — Entidad no encontrada
├── UnauthorizedError (401) — No autenticado
├── ForbiddenError    (403) — No autorizado (RBAC)
├── ConflictError     (409) — Conflicto de datos
└── RateLimitError    (429) — Límite de requests

handleApiError() → NextResponse JSON
```

## Base de Datos

```
User ──┬── Transaction (income/expense)
       ├── Category    (nombre, icono, color, tipo)
       ├── Budget      (monto, porcentaje, gastado)
       ├── Goal        (meta, progreso, aporte mensual)
       ├── Account     (NextAuth OAuth)
       ├── Session     (NextAuth session)
       └── AuditLog    (registro de acciones)
```

## Convenciones

- **Rutas API**: `withAuth()` para autenticación, `withRole(["ADMIN","SUPER_ADMIN"])` para admin
- **Validación**: Schemas Zod en `lib/validations.ts`
- **Errores**: Clases en `lib/errors.ts`, manejador en `lib/api-utils.ts`
- **Auditoría**: `createAuditLog()` en operaciones sensibles
- **Formato COP**: `Intl.NumberFormat("es-CO", { currency: "COP" })`
- **Fechas UTC**: `new Date(Date.UTC(year, month-1, 1))` para evitar timezone bugs
