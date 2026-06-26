# API Reference — Finowa

Todas las rutas API están bajo `/api/`. Las rutas protegidas requieren sesión activa (cookie JWT) y devuelven `401` si no hay autenticación.

URL base: `https://tu-app.vercel.app/api`

---

## Autenticación

### POST /api/auth/register
Registrar un nuevo usuario con rol `USER` y 15 categorías 50/30/20.

**Request:**
```json
{
  "name": "Nombre Usuario",
  "email": "usuario@correo.com",
  "password": "Password123!"
}
```

**Response 201:**
```json
{
  "success": true,
  "user": { "id": "cuid...", "name": "Nombre Usuario", "email": "usuario@correo.com" }
}
```

**Response 409 (email existente):**
```json
{ "error": "El email ya está registrado", "code": "EMAIL_EXISTS" }
```

### POST /api/auth/[...nextauth]
Manejador de NextAuth v5. Se usa internamente por `signIn("credentials")`.

**Request body (credentials):**
```json
{ "email": "admin@wdev.com", "password": "Wdev2024!", "csrfToken": "...", "callbackUrl": "/dashboard", "json": true }
```

### GET /api/auth/session
Obtener la sesión actual.

**Response 200 (autenticado):**
```json
{
  "user": { "id": "cuid...", "name": "WDEV Admin", "email": "admin@wdev.com", "role": "SUPER_ADMIN" },
  "expires": "2026-07-25T..."
}
```

**Response 200 (no autenticado):** `null`

### GET /api/auth/csrf
Obtener token CSRF (requerido para login).

---

## Usuario

### GET /api/users/me
Obtener perfil del usuario autenticado.

**Response:**
```json
{
  "id": "cuid...",
  "name": "WDEV Admin",
  "email": "admin@wdev.com",
  "role": "SUPER_ADMIN",
  "isActive": true,
  "createdAt": "...",
  "_count": { "transactions": 2, "budgets": 0, "goals": 0 }
}
```

### PUT /api/users/me
Actualizar nombre del usuario.

**Request:**
```json
{ "name": "Nuevo Nombre" }
```

### PUT /api/users/me/change-password
Cambiar la contraseña del usuario autenticado.

**Request:**
```json
{ "currentPassword": "Wdev2024!", "newPassword": "NuevaPass123!" }
```

---

## Transacciones

### GET /api/transactions
Listar transacciones del usuario autenticado.

**Query parameters:**
| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `page` | number | 1 | Número de página |
| `limit` | number | 50 | Items por página (max 100) |
| `type` | string | - | Filtrar por tipo: `INCOME` o `EXPENSE` |
| `categoryId` | string | - | Filtrar por categoría |
| `month` | number | - | Mes (1-12) |
| `year` | number | - | Año |
| `search` | string | - | Búsqueda por descripción |
| `sort` | string | date | Campo de orden: `date`, `amount`, `createdAt` |
| `order` | string | desc | Dirección: `asc` o `desc` |

**Response:**
```json
{
  "data": [
    {
      "id": "cuid...",
      "amount": 2000000,
      "type": "INCOME",
      "description": "Salario Mes Junio",
      "date": "2026-06-01T00:00:00.000Z",
      "categoryId": "cuid...",
      "category": { "id": "cuid...", "name": "Salario", "color": "#22c55e" },
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 2,
    "totalPages": 1
  }
}
```

### POST /api/transactions
Crear una transacción.

**Request:**
```json
{
  "amount": 50000,
  "type": "EXPENSE",
  "description": "Almuerzo ejecutivo",
  "date": "2026-06-25",
  "categoryId": "cuid_categoria"
}
```

### PUT /api/transactions
Actualizar una transacción existente.

**Request:**
```json
{
  "id": "cuid_transaccion",
  "amount": 55000,
  "description": "Almuerzo ejecutivo actualizado"
}
```

### DELETE /api/transactions?id={id}
Eliminar una transacción (decrementa el gasto del presupuesto correspondiente).

### DELETE /api/transactions/batch
Eliminar múltiples transacciones.

**Request:**
```json
{ "ids": ["cuid1", "cuid2", "cuid3"] }
```

---

## Dashboard

### GET /api/summary
Resumen mensual completo para el dashboard.

**Response:**
```json
{
  "totalIncome": 2000000,
  "totalExpenses": 700000,
  "balance": 1300000,
  "savingsRate": 65,
  "incomeCount": 1,
  "expenseCount": 1,
  "transactions": [...],
  "budgets": [...],
  "goals": [...],
  "monthlyTrend": [
    { "month": "01/2026", "income": 2000000, "expenses": 700000 }
  ],
  "categoryBreakdown": [
    { "name": "Deudas", "amount": 700000, "color": "#ef4444", "icon": "credit-card" }
  ],
  "incomeBreakdown": [
    { "categoryId": "cuid...", "categoryName": "Salario", "amount": 2000000, "count": 1 }
  ],
  "allTimeIncome": 2000000,
  "allTimeExpenses": 700000,
  "last30DaysIncome": 2000000,
  "last30DaysExpenses": 700000
}
```

### GET /api/insights
Alertas financieras inteligentes basadas en los datos del usuario.

**Response:**
```json
{
  "insights": [
    { "type": "info", "severity": "medium", "title": "Suscripciones detectadas", "message": "...", "action": "..." }
  ],
  "totalIncome": 2000000,
  "totalExpenses": 700000,
  "balance": 1300000,
  "transactionCount": 2,
  "subscriptionCount": 0
}
```

### GET /api/reports/monthly?year=2026
Reporte financiero por mes y resumen anual.

**Response:**
```json
{
  "year": 2026,
  "months": [
    { "month": 1, "income": 2000000, "expenses": 700000, "balance": 1300000, "savingsRate": 65, "transactionCount": 2, "categoryCount": 1 }
  ],
  "summary": {
    "totalIncome": 2000000,
    "totalExpenses": 700000,
    "totalTransactions": 2,
    "averageSavingsRate": 65
  }
}
```

---

## Categorías

### GET /api/categories
Listar categorías del usuario.

### POST /api/categories
Crear categoría.

**Request:**
```json
{ "name": "Nueva Categoría", "icon": "circle", "color": "#6366f1", "type": "EXPENSE" }
```

### PUT /api/categories/[id]
Editar categoría.

**Request:**
```json
{ "name": "Nombre Actualizado", "color": "#22c55e" }
```

### DELETE /api/categories/[id]
Eliminar categoría (solo si no tiene transacciones asociadas).

---

## Presupuestos

### GET /api/budgets
Listar presupuestos del usuario.

### POST /api/budgets
Crear presupuesto con el método 50/30/20.

**Request:**
```json
{
  "categoryId": "cuid_categoria",
  "amount": 500000,
  "percentage": 12,
  "month": 6,
  "year": 2026
}
```

### PUT /api/budgets
Actualizar presupuesto.

**Request:**
```json
{ "id": "cuid_budget", "amount": 600000, "percentage": 15 }
```

### DELETE /api/budgets?id={id}
Eliminar presupuesto.

---

## Metas

### GET /api/goals
Listar metas del usuario.

### POST /api/goals
Crear meta.

**Request:**
```json
{
  "name": "Viaje a Cartagena",
  "targetAmount": 5000000,
  "currentAmount": 500000,
  "monthlyContribution": 500000,
  "color": "#06b6d4",
  "icon": "plane"
}
```

### PUT /api/goals
Actualizar meta.

### DELETE /api/goals?id={id}
Eliminar meta.

---

## Administración (requiere ADMIN/SUPER_ADMIN)

### GET /api/admin/stats
Estadísticas globales del sistema.

**Response:**
```json
{
  "totalUsers": 3,
  "totalTransactions": 2,
  "adminCount": 1,
  "activeThisMonth": 3,
  "newThisWeek": 0,
  "recentUsers": [{ "id": "...", "name": "Admin", "email": "admin@wdev.com", "role": "SUPER_ADMIN", "createdAt": "..." }]
}
```

### GET /api/admin/users
Lista completa de usuarios con conteo de transacciones.

### GET /api/admin/users/[id]
Detalle del usuario con estadísticas financieras.

### PUT /api/admin/users/[id]
Actualizar usuario (rol, estado, notas).

**Request:**
```json
{ "role": "ADMIN", "isActive": true, "adminNotes": "Usuario verificado" }
```

### DELETE /api/admin/users/[id]
Soft delete (desactiva la cuenta).

### POST /api/admin/users/[id]/purge
Eliminación definitiva de la cuenta y todos sus datos (solo SUPER_ADMIN).

### PUT /api/admin/users/[id]/reset-password
Restablecer contraseña de cualquier usuario (solo SUPER_ADMIN).

**Request:**
```json
{ "newPassword": "NuevaPassSegura123!" }
```

### GET /api/admin/audit-logs
Registro de auditoría de todas las acciones del sistema.

---

## Códigos de Error

| Código | HTTP | Descripción |
|--------|------|-------------|
| `UNAUTHORIZED` | 401 | No autenticado |
| `FORBIDDEN` | 403 | No tiene permisos (rol insuficiente) |
| `ACCOUNT_DISABLED` | 403 | Cuenta suspendida |
| `NOT_FOUND` | 404 | Entidad no encontrada |
| `VALIDATION_ERROR` | 400 | Datos inválidos |
| `CONFLICT` | 409 | Conflicto (ej: email ya registrado) |
| `INTERNAL_ERROR` | 500 | Error interno del servidor |
| `RATE_LIMIT` | 429 | Demasiadas solicitudes |

**Formato de error:**
```json
{
  "error": "Descripción del error",
  "code": "ERROR_CODE",
  "details": [
    { "field": "email", "message": "Email inválido" }
  ]
}
```
