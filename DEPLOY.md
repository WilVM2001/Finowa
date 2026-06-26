# Guía de Despliegue — Finowa en Vercel + Turso

## Arquitectura de Producción

```
Usuario → https://finowa.vercel.app
               │
               ▼
         Vercel CDN ─── Páginas estáticas (landing, login)
               │
               ▼
      Funciones Serverless ─── API Routes (NextAuth, Prisma, etc.)
               │
               ▼
         Turso Cloud ─── Base de datos libSQL distribuida
```

## Requisitos Previos

1. Cuenta en [Vercel](https://vercel.com) (gratis)
2. Cuenta en [Turso](https://turso.tech) (gratis)
3. Repositorio en GitHub con el código

---

## Paso 1: Crear Base de Datos en Turso

### Opción A: Script automático

```bash
# 1. Obtener token de API en https://turso.tech → Settings → API Tokens
# 2. Ejecutar:
npx tsx scripts/setup-turso.ts turs_tu_token_aqui
```

Esto crea:
- Un grupo `us-east` en AWS Virginia
- Una base `finowa` dentro del grupo
- Un token de autenticación

Te imprimirá las variables necesarias:

```
TURSO_DATABASE_URL="libsql://finowa-wilvm2001.aws-us-east-1.turso.io"
TURSO_AUTH_TOKEN="eyJhbGciOiJ..."
```

### Opción B: Manual desde la web de Turso

1. Ir a [turso.tech](https://turso.tech) → Databases → Create Database
2. Nombre: `finowa`, Región: `us-east`
3. Una vez creada, ir a **Auth Tokens** → Generate Token
4. Anotar la URL de conexión y el token

---

## Paso 2: Configurar Schema y Usuario Admin

```bash
# 1. Configurar variables de entorno (Windows PowerShell):
$env:TURSO_DATABASE_URL="libsql://finowa-wilvm2001.aws-us-east-1.turso.io"
$env:TURSO_AUTH_TOKEN="eyJhbGciOiJ..."

# 2. Crear tablas en Turso:
npx tsx scripts/push-turso.ts

# 3. Crear admin@wdev.com + categorias 50/30/20:
npx tsx prisma/seed.ts
```

---

## Paso 3: Desplegar en Vercel

### 3.1 Conectar repositorio

1. Ir a [vercel.com/new](https://vercel.com/new)
2. Importar `WilVM2001/Finowa` (o tu repositorio)
3. Framework: **Next.js** (se detecta automáticamente)

### 3.2 Variables de entorno

Agregar estas **4 variables** en **Environment Variables**:

| Variable | Valor | Propósito |
|----------|-------|-----------|
| `AUTH_SECRET` | `finanza-super-secret-key-2024-must-be-at-least-32-chars` | Firma JWT de NextAuth |
| `TURSO_DATABASE_URL` | `libsql://finowa-wilvm2001.aws-us-east-1.turso.io` | URL de conexión a Turso |
| `TURSO_AUTH_TOKEN` | `eyJhbGciOiJ...` | Token de autenticación de Turso |
| `NEXT_PUBLIC_APP_URL` | `https://finowa.vercel.app` | URL del deployment (la de Vercel) |

> **⚠️ Importante**: `NEXT_PUBLIC_APP_URL` debe ser la URL exacta que asigna Vercel (ej: `https://finowa-xxxxx.vercel.app`). Se puede actualizar después si se configura dominio personalizado.

### 3.3 Build

El comando de build es:
```bash
prisma generate && next build
```

(Está configurado automáticamente en `package.json` como `"build"`)

### 3.4 Deploy

Click en **Deploy**. Vercel ejecutará:
1. `npm install` → instala todas las dependencias
2. `prisma generate` → genera el cliente Prisma en `src/generated/prisma/`
3. `next build` → compila Next.js con Turbopack

---

## Paso 4: Post-Deploy

### Verificar funcionamiento

1. Ir a `https://tu-app.vercel.app/login`
2. Iniciar sesión con `admin@wdev.com / Wdev2024!`
3. Verificar que el dashboard cargue con los datos
4. Ir a `https://tu-app.vercel.app/admin` → Panel de administración

### Dominio personalizado (opcional)

1. Vercel → Project → Settings → Domains
2. Agregar tu dominio (ej: `finowa.com.co`)
3. Configurar los DNS según las instrucciones de Vercel
4. Actualizar `NEXT_PUBLIC_APP_URL` al nuevo dominio

### Monitoreo

- **Vercel**: Logs de funciones en Dashboard → Functions → Logs
- **Turso**: Dashboard en https://turso.tech → Databases → finowa → Usage

---

## Solución de Problemas

### Error: "There is a problem with the server configuration"

**Causa**: Falta `AUTH_SECRET` o `TURSO_DATABASE_URL` en las variables de entorno de Vercel.

**Solución**: Verificar que las 4 variables están configuradas en Vercel → Settings → Environment Variables. Redeploy después de agregarlas.

### Error: "Module not found: Can't resolve '@/generated/prisma/client'"

**Causa**: El cliente Prisma no fue generado antes del build.

**Solución**: El comando `prisma generate` ya está incluido en `npm run build`. Verificar que `prisma` está en `devDependencies` en `package.json`. Redeploy.

### Error: "SQL_PARSE_ERROR" al ejecutar push-turso.ts

**Causa**: SQL mal formado para Turso. Se corrigió usando nombres de tabla con comillas dobles.

**Solución**: Usar la versión más reciente de `scripts/push-turso.ts` del repositorio.

### Error: "Invalid database URL"

**Causa**: La URL de Turso no es válida.

**Solución**: Verificar que `TURSO_DATABASE_URL` empiece con `libsql://` y que `TURSO_AUTH_TOKEN` sea el token JWT correcto.

### Error 403 al acceder a /admin

**Causa**: El usuario no tiene rol ADMIN o SUPER_ADMIN.

**Solución**: Ejecutar seed que asigna SUPER_ADMIN automáticamente:
```bash
npx tsx prisma/seed.ts
```

---

## Mantenimiento

### Actualizar esquema de base de datos

Cuando se modifica `prisma/schema.prisma`:

```bash
# 1. Actualizar local (SQLite):
npx prisma db push

# 2. Actualizar Turso:
npx tsx scripts/push-turso.ts
```

### Reseed completo (solo admin + categorías)

```bash
npx tsx prisma/seed.ts
```

### Ver logs en producción

Vercel → Project → Functions → seleccionar función → Logs

---

## Presupuesto

### Vercel (Hobby - Gratis)
- 100 GB ancho de banda
- 6000 minutos de ejecución serverless/mes
- 1 sitio web
- Límite de 10 segundos por función serverless

### Turso (Starter - Gratis)
- Hasta 500 bases de datos
- 1 GB por base de datos
- 5 grupos de ubicación
- Sin costo mensual
