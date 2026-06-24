# Finowa — Gestión Financiera Inteligente

Aplicación web de finanzas personales construida con Next.js 16, diseñada para el contexto colombiano (COP, Cali) con el método **50/30/20**.

![Next.js](https://img.shields.io/badge/Next.js-16.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06b6d4)
![Prisma](https://img.shields.io/badge/Prisma-7-2d3748)
![NextAuth](https://img.shields.io/badge/NextAuth-v5-8b5cf6)
![Three.js](https://img.shields.io/badge/Three.js-R3F-000)

---

## 🚀 Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Estilos | TailwindCSS 4, Framer Motion |
| 3D | React Three Fiber (R3F), @react-three/drei |
| Backend | Next.js API Routes, Prisma ORM |
| Base de datos | SQLite (libSQL) |
| Autenticación | NextAuth v5 (Credentials + JWT) |
| Validación | Zod v4 |
| Gráficos | Recharts |
| Utilidades | bcryptjs, papaparse, jsPDF |

---

## 📐 Método 50/30/20

La app organiza tus finanzas bajo el método **50/30/20** con contexto colombiano:

```
🏠 50% NECESIDADES
   Vivienda        — Arriendo, hipoteca
   Servicios       — Agua, luz, gas, internet, celular
   Alimentación    — Mercado, almuerzos
   Transporte      — MIO, taxi, gasolina
   Salud           — EPS, medicamentos, citas

🎮 30% DESEOS
   Entretenimiento — Cine, bares, salidas
   Suscripciones   — Netflix, Spotify, YouTube
   Compras         — Ropa, electrónicos, no esenciales
   Viajes          — Ahorro para viajes

💰 20% AHORRO E INVERSIÓN
   Ahorro          — Fondo de emergencia
   Inversiones     — CDT, fondos, acciones
   Deudas          — Tarjetas de crédito, préstamos
```

Los presupuestos se calculan automáticamente como porcentaje de tus ingresos mensuales.

---

## ⚡ Instalación

```bash
# Clonar
git clone https://github.com/WilVM2001/Finowa.git
cd Finowa

# Instalar dependencias
npm install

# Inicializar base de datos
npx prisma db push

# Sembrar datos demo (opcional)
npx tsx prisma/seed.ts

# Iniciar servidor
npm run dev
```

Abrir http://localhost:3000

---

## 👤 Usuario Demo

```
Email:    admin@wdev.com
Password: Wdev2024!
```

---

## 📂 Estructura del Proyecto

```
src/
├── app/
│   ├── api/                    # 16 endpoints REST
│   │   ├── auth/[...nextauth]/ # NextAuth handler
│   │   ├── auth/register/      # Registro + categorías
│   │   ├── budgets/            # CRUD presupuestos
│   │   ├── categories/         # CRUD categorías
│   │   │   └── [id]/
│   │   ├── goals/              # CRUD metas
│   │   ├── insights/           # Alertas financieras
│   │   ├── reports/monthly/    # Reporte mensual
│   │   ├── seed/               # Ejecutar seed
│   │   ├── summary/            # Resumen dashboard
│   │   ├── transactions/       # CRUD transacciones
│   │   │   └── batch/          # Operaciones en lote
│   │   └── users/me/           # Perfil + cambio contraseña
│   │       └── change-password/
│   ├── dashboard/              # Páginas protegidas
│   │   ├── analytics/          # Análisis + reporte mensual
│   │   ├── budgets/            # Presupuestos 50/30/20
│   │   ├── goals/              # Metas financieras
│   │   ├── settings/           # Perfil, categorías, import/export
│   │   └── transactions/       # Lista con filtros + selección múltiple
│   ├── login/                  # Inicio de sesión
│   └── register/               # Registro
├── components/
│   ├── 3d/                     # Escena 3D del landing
│   ├── dashboard/              # 15 componentes del dashboard
│   ├── landing/                # Navbar, Hero, Features, Footer
│   └── ui/                     # 12 componentes UI base
├── lib/                        # auth, prisma, utils, validations
├── providers/                  # SessionProvider + Toaster
└── types/                      # TypeScript types + next-auth.d.ts
```

---

## 🔌 API Endpoints

### Autenticación
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registrar usuario (crea 15 categorías 50/30/20) |
| GET/POST | `/api/auth/[...nextauth]` | NextAuth v5 (login/logout/session) |
| GET | `/api/users/me` | Obtener perfil + estadísticas |
| PUT | `/api/users/me` | Actualizar nombre |
| PUT | `/api/users/me/change-password` | Cambiar contraseña |

### Transacciones
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/transactions` | Listar (filtros: type, categoryId, month, year, search, paginación) |
| POST | `/api/transactions` | Crear transacción |
| PUT | `/api/transactions` | Actualizar transacción |
| DELETE | `/api/transactions` | Eliminar una transacción |
| DELETE | `/api/transactions/batch` | Eliminar múltiples transacciones |

### Dashboard
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/summary` | Resumen mensual + gráficas + desglose ingresos |
| GET | `/api/insights` | Alertas financieras inteligentes |
| GET | `/api/reports/monthly` | Reporte por mes + resumen anual |

### Administración
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST | `/api/categories` | Listar / Crear categoría |
| PUT/DELETE | `/api/categories/[id]` | Editar / Eliminar categoría |
| GET/POST | `/api/budgets` | Listar / Crear presupuesto |
| PUT/DELETE | `/api/budgets` | Actualizar / Eliminar presupuesto |
| GET/POST | `/api/goals` | Listar / Crear meta |
| PUT/DELETE | `/api/goals` | Actualizar / Eliminar meta |

---

## 🎯 Features

### Dashboard Principal
- **SummaryCards** — Balance, Ingresos, Gastos, Tasa de ahorro
- **IncomeBreakdown** — Desglose de ingresos por fuente con porcentajes
- **AnalyticsCharts** — Gráfico de barras mensual + torta por categoría
- **FinancialInsights** — Alertas inteligentes (gastos, suscripciones, metas)
- **TransactionsList** — Últimas 50 transacciones con filtros
- **BudgetCard** — Presupuestos 50/30/20 con barras de progreso
- **GoalsList** — Metas con progreso y tiempo estimado
- **NotificationsDropdown** — Campana con alertas en tiempo real

### Modo Oscuro Premium
- Estética fintech tipo Stripe/Revolut
- Landing page con escena 3D interactiva (React Three Fiber)
- Partículas, esfera con distorsión, parallax

### Funcionalidades Clave
- Selección múltiple de transacciones para eliminar en lote
- Filtro por categoría, tipo, búsqueda por texto
- Presupuestos dinámicos por porcentaje o monto fijo
- Importar CSV de transacciones
- Exportar reporte PDF
- Gestión completa de categorías (crear, editar, eliminar)
- Cambio de contraseña
- Sidebar colapsable
- Diseño responsive

---

## 🗄️ Base de Datos

### Modelos (Prisma + SQLite)

```
User ──┬── Transaction (amount, type, description, date, category)
       ├── Category    (name, icon, color, type: INCOME/EXPENSE)
       ├── Budget      (amount, percentage, spent, month, year)
       ├── Goal        (name, targetAmount, currentAmount, monthlyContribution)
       ├── Account     (NextAuth)
       └── Session     (NextAuth)
```

---

## 🌎 Contexto Colombiano

- **Moneda**: COP (peso colombiano) con formato `$ 1.500.000`
- **Ubicación**: Valores y referencias de Cali, Colombia
  - Arriendo estrato 3-4 en Cali
  - Transporte MIO, EMCALI, Gases de Occidente
  - Lugares: Chipichape, Granada, San Antonio, Parque del Perro
- **Precios reales**: Netflix $24.900, Spotify $17.900, corrientazo $12.000
- **Fechas**: Formato colombiano (`es-CO`)

---

## 📝 Scripts

```bash
npm run dev       # Servidor desarrollo (Turbopack)
npm run build     # Compilar producción
npm run start     # Iniciar producción
npm run seed      # Sembrar datos demo 50/30/20
npx prisma db push      # Sincronizar esquema SQLite
npx prisma generate     # Generar cliente Prisma
npx tsx prisma/seed.ts  # Ejecutar seed manualmente
```

---

## 🔒 Seguridad

- Autenticación con NextAuth v5 (credentials + JWT)
- Contraseñas hasheadas con bcryptjs (12 rondas)
- Todas las rutas API protegidas con middleware `withAuth`
- Validación de datos con Zod en cada endpoint
- CSRF protection via NextAuth
- Sesiones encriptadas con JWT

---

## 📄 Licencia

MIT — Desarrollado para WDEV
