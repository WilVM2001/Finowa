# Changelog

## v2.0.0 — Profesionalización (2026-06-24)

### Agregado
- Sistema RBAC (USER, ADMIN, SUPER_ADMIN) con middleware `withRole`
- Panel de administración (`/admin`) con dashboard, gestión de usuarios y auditoría
- Modelo `AuditLog` para registro de acciones
- Sistema de errores profesional (`AppError`, `ValidationError`, `NotFoundError`, etc.)
- Componentes UI profesionales: `DataTable`, `EmptyState`, `ErrorState`, `Skeleton`
- Tests unitarios con Vitest (18 tests pasando)
- Rate limiting básico + headers de seguridad
- `ARCHITECTURE.md` y `CHANGELOG.md`

### Mejorado
- `api-utils.ts` con `withRole`, re-export de errores, mejor `parseBody`
- `validations.ts` con `budgetUpdateSchema`, validaciones mejoradas
- Todas las fechas usan `Date.UTC()` para evitar bugs de zona horaria
- Sidebar colapsable sincronizado vía React Context
- Categorías reorganizadas bajo método 50/30/20
- Seed mínimo (solo usuario + categorías, sin datos demo)

### Corregido
- Login: database path incorrecto en seed script
- Ingresos no sumaban por timezone en Date()
- Transaction DELETE ahora decrementa budget spent
- Presupuesto editable: toggle porcentaje/monto fijo
- Sidebar layout gap al colapsar
- Navbar/Footer links muertos

## v1.0.0 — Lanzamiento Inicial

- Next.js 16 con App Router + TypeScript
- Landing page 3D con React Three Fiber
- Dashboard con SummaryCards, gráficos Recharts, transacciones, presupuestos, metas
- Autenticación NextAuth v5 (credentials + JWT)
- Prisma ORM + SQLite (libSQL)
- 16 endpoints REST con validación Zod
- Método 50/30/20 contextualizado para Colombia (COP, Cali)
- Modo oscuro premium
- Notificaciones con campana de alertas
- Selección múltiple de transacciones
- Gestión de categorías
- Cambio de contraseña
- Importar CSV / Exportar PDF
