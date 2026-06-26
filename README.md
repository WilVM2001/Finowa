# Finowa — Gestión Financiera Inteligente

Aplicación web de finanzas personales construida con Next.js 16, diseñada para el contexto colombiano (COP, Cali) con el método **50/30/20**.

![Next.js](https://img.shields.io/badge/Next.js-16.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06b6d4)
![Prisma](https://img.shields.io/badge/Prisma-7-2d3748)
![NextAuth](https://img.shields.io/badge/NextAuth-v5-8b5cf6)
![Turso](https://img.shields.io/badge/Turso-libSQL-4FC08D)

---

## ⚡ Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Estilos | TailwindCSS 4, Framer Motion, Lucide Icons |
| 3D | React Three Fiber + @react-three/drei |
| Backend | Next.js API Routes (REST, serverless) |
| ORM | Prisma 7 con driver adapter libSQL |
| Base de datos | Turso Cloud (SQLite distribuido) / SQLite local |
| Autenticación | NextAuth v5 (Credentials + JWT) |
| Validación | Zod v4 |
| Gráficos | Recharts |
| Testing | Vitest + Testing Library |
| Despliegue | Vercel (serverless) |

---

## 📐 Método 50/30/20

La app organiza tus finanzas bajo el método **50/30/20** con contexto colombiano:

```
🏠 50% NECESIDADES
   Vivienda       — Arriendo, hipoteca
   Servicios      — Agua, luz, gas, internet, celular
   Alimentación   — Mercado, almuerzos
   Transporte     — MIO, taxi, gasolina, uber
   Salud          — EPS, medicamentos, citas

🎮 30% DESEOS
   Entretenimiento — Cine, bares, salidas, restaurantes
   Suscripciones   — Netflix, Spotify, YouTube
   Compras         — Ropa, electrónicos, no esenciales
   Viajes          — Ahorro para viajes

💰 20% AHORRO E INVERSIÓN
   Ahorro          — Fondo de emergencia
   Inversiones     — CDT, fondos, acciones
   Deudas          — Tarjetas de crédito, préstamos
```

Los presupuestos se calculan automáticamente como porcentaje de tus ingresos mensuales, con opción de monto fijo o porcentaje.

---

## ✨ Funcionalidades

### Dashboard Principal
- **SummaryCards** — Balance, Ingresos, Gastos, Tasa de ahorro con animaciones
- **IncomeBreakdown** — Desglose de ingresos por fuente con porcentajes y barra de progreso
- **AnalyticsCharts** — Gráfico de barras mensual + torta por categoría
- **FinancialInsights** — Alertas inteligentes (gastos elevados, suscripciones, metas)
- **TransactionsList** — Filtros por tipo, categoría y búsqueda; selección múltiple para borrado en lote
- **BudgetCard** — Presupuestos 50/30/20 con barras de progreso y alertas visuales
- **GoalsList** — Metas financieras con progreso y tiempo estimado
- **NotificationsDropdown** — Campana con alertas en tiempo real (presupuestos, insights)

### Landing Page
- Escena 3D interactiva con React Three Fiber
- Partículas animadas y esfera con distorsión
- Parallax con seguimiento del mouse
- Secciones: Hero, Características, CTA, Footer

### Administración
- **Panel Admin (`/admin`)** — Dashboard con métricas globales
- **Gestión de usuarios** — Lista, búsqueda, roles (USER/ADMIN/SUPER_ADMIN), suspender/activar
- **Detalle de usuario** — Estadísticas financieras, notas de admin, últimas transacciones
- **Reset de contraseña** — Admin puede restablecer contraseña de cualquier usuario
- **Purga de cuentas** — Eliminación definitiva con doble confirmación y auditoría
- **Auditoría** — Registro de todas las acciones (login, registro, cambios, eliminaciones)

### Configuración
- Editar perfil (nombre)
- Cambiar contraseña
- Gestión de categorías (crear, editar, eliminar)
- Importar CSV de transacciones
- Exportar reporte PDF

---

## 🏗️ Estructura del Proyecto

```
src/
├── app/
│   ├── api/                    # 16+ endpoints REST
│   │   ├── admin/              # Panel de administración
│   │   │   ├── audit-logs/
│   │   │   ├── stats/
│   │   │   └── users/[id]/     # CRUD + reset-password + purge
│   │   ├── auth/               # NextAuth + registro
│   │   ├── budgets/
│   │   ├── categories/[id]/
│   │   ├── goals/
│   │   ├── insights/
│   │   ├── reports/monthly/
│   │   ├── seed/
│   │   ├── summary/
│   │   ├── transactions/batch/
│   │   └── users/me/change-password/
│   ├── admin/                  # Páginas del panel admin
│   ├── dashboard/              # Dashboard + subpáginas
│   ├── login/                  # Login
│   └── register/               # Registro
├── components/
│   ├── 3d/                     # Escena 3D (Three.js)
│   ├── dashboard/              # 15 componentes del dashboard
│   ├── landing/                # Navbar, Hero, Features, CTA, Footer
│   └── ui/                     # 12+ componentes base (DataTable, EmptyState, Skeleton, etc.)
├── lib/                        # auth, prisma, errors, validations, audit, security
├── providers/                  # SessionProvider + Toaster
├── types/                      # TypeScript interfaces + next-auth.d.ts
└── generated/prisma/           # Cliente Prisma generado (gitignored)
```

---

## 🔌 API Endpoints

### Autenticación
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registrar usuario + 15 categorías 50/30/20 |
| GET/POST | `/api/auth/[...nextauth]` | NextAuth v5 (login, session, logout) |
| GET | `/api/users/me` | Perfil del usuario |
| PUT | `/api/users/me` | Actualizar nombre |
| PUT | `/api/users/me/change-password` | Cambiar contraseña |

### Transacciones
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/transactions` | Listar (paginado, filtros: type, categoryId, month, year, search) |
| POST | `/api/transactions` | Crear transacción |
| PUT | `/api/transactions` | Actualizar transacción |
| DELETE | `/api/transactions` | Eliminar una (decrementa budget spent) |
| DELETE | `/api/transactions/batch` | Eliminar múltiples |

### Dashboard
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/summary` | Resumen mensual + gráficas + desglose ingresos |
| GET | `/api/insights` | Alertas financieras inteligentes |
| GET | `/api/reports/monthly` | Reporte por mes + resumen anual |

### Administración (requiere ADMIN/SUPER_ADMIN)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admin/stats` | Estadísticas globales |
| GET | `/api/admin/users` | Lista de usuarios + conteos |
| GET | `/api/admin/users/[id]` | Detalle + stats financieras |
| PUT | `/api/admin/users/[id]` | Actualizar rol, estado, notas |
| DELETE | `/api/admin/users/[id]` | Soft delete (suspender) |
| POST | `/api/admin/users/[id]/purge` | Eliminación definitiva |
| PUT | `/api/admin/users/[id]/reset-password` | Reset de contraseña |
| GET | `/api/admin/audit-logs` | Registro de auditoría |

### Administración de datos
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST | `/api/categories` | CRUD categorías |
| PUT/DELETE | `/api/categories/[id]` | Editar / Eliminar categoría |
| GET/POST | `/api/budgets` | CRUD presupuestos |
| PUT/DELETE | `/api/budgets` | Actualizar / Eliminar presupuesto |
| GET/POST | `/api/goals` | CRUD metas |
| PUT/DELETE | `/api/goals` | Actualizar / Eliminar meta |
| POST | `/api/seed` | Sembrar datos demo |

---

## 🗄️ Base de Datos

### Esquema (Prisma + SQLite/Turso)

```
User ──┬── Transaction (amount, type, description, date, categoryId)
       ├── Category    (name, icon, color, type: INCOME/EXPENSE)
       ├── Budget      (amount, percentage, spent, month, year)
       ├── Goal        (name, targetAmount, currentAmount, monthlyContribution)
       ├── Account     (NextAuth OAuth)
       ├── Session     (NextAuth)
       └── AuditLog    (userId, action, entity, metadata)
```

### Roles (RBAC)
| Rol | Dashboard | Admin Panel | Gestión Usuarios |
|-----|-----------|-------------|------------------|
| USER | ✅ | ❌ | ❌ |
| ADMIN | ✅ | ✅ (limitado) | ❌ |
| SUPER_ADMIN | ✅ | ✅ (completo) | ✅ |

---

## 🌎 Contexto Colombiano

- **Moneda**: COP (peso colombiano) — formato `$ 1.500.000`
- **Ubicación**: Valores y referencias de Cali, Colombia
  - Arriendo estrato 3-4: $1.500.000
  - Transporte MIO: $2.900 por pasaje
  - Servicios EMCALI: ~$350.000
  - Lugares: Chipichape, Granada, San Antonio, Parque del Perro
- **Precios reales**: Netflix $24.900, Spotify $17.900, corrientazo $12.000
- **Fechas**: Formato `es-CO`

---

## 🔒 Seguridad

- Autenticación con NextAuth v5 (credentials + JWT)
- Contraseñas hasheadas con bcryptjs (12 rondas de sal)
- Middleware `withAuth` protege todas las rutas API
- Middleware `withRole` protege rutas admin
- Validación de datos con Zod en cada endpoint
- Headers de seguridad (X-Frame-Options, CSP, etc.)
- Rate limiting en memoria
- CSRF protection via NextAuth
- Soft delete + purga definitiva de cuentas
- Auditoría de acciones críticas

---

## 🧪 Testing

```bash
npm test              # Ejecutar todos los tests
npm run test:watch    # Modo watch
npm run test:coverage # Reporte de cobertura
```

---

## 📝 Scripts

```bash
npm run dev           # Servidor desarrollo (Turbopack)
npm run build         # prisma generate + next build
npm run start         # Servidor producción
npm run lint          # ESLint
npm test              # Vitest
npm run seed          # Inicializar admin + categorías
npx prisma db push    # Sincronizar esquema
npx prisma generate   # Generar cliente Prisma
npx tsx scripts/setup-turso.ts <token>  # Crear BD en Turso
npx tsx scripts/push-turso.ts           # Push schema a Turso
```
