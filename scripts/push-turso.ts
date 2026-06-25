// Push schema and seed to Turso
import { createClient } from "@libsql/client"
import { execSync } from "child_process"

async function main() {
  const url = process.env.TURSO_DATABASE_URL!
  const authToken = process.env.TURSO_AUTH_TOKEN!
  if (!url || !authToken) { console.error("❌ TURSO_DATABASE_URL y TURSO_AUTH_TOKEN requeridos"); process.exit(1) }

  console.log("📀 Conectando a Turso...")
  const turso = createClient({ url, authToken })

  // Obtener definiciones de esquema de prisma db push
  console.log("🏗️  Generando esquema SQLite...")
  
  // Crear tablas manualmente (equivalente a lo que genera prisma db push)
  const schema = `
    CREATE TABLE IF NOT EXISTS User (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE NOT NULL,
      image TEXT,
      password TEXT,
      role TEXT NOT NULL DEFAULT 'USER',
      isActive INTEGER NOT NULL DEFAULT 1,
      adminNotes TEXT,
      lastLoginAt TEXT,
      deletedAt TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS Account (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL REFERENCES User(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      provider TEXT NOT NULL,
      providerAccountId TEXT NOT NULL,
      refresh_token TEXT,
      access_token TEXT,
      expires_at INTEGER,
      token_type TEXT,
      scope TEXT,
      id_token TEXT,
      session_state TEXT,
      UNIQUE(provider, providerAccountId)
    );

    CREATE TABLE IF NOT EXISTS Session (
      id TEXT PRIMARY KEY,
      sessionToken TEXT UNIQUE NOT NULL,
      userId TEXT NOT NULL REFERENCES User(id) ON DELETE CASCADE,
      expires TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Category (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT DEFAULT 'circle',
      color TEXT DEFAULT '#6366f1',
      type TEXT NOT NULL,
      userId TEXT NOT NULL REFERENCES User(id) ON DELETE CASCADE,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(name, userId)
    );

    CREATE TABLE IF NOT EXISTS "Transaction" (
      id TEXT PRIMARY KEY,
      amount REAL NOT NULL,
      type TEXT NOT NULL,
      description TEXT NOT NULL,
      date TEXT NOT NULL DEFAULT (datetime('now')),
      categoryId TEXT NOT NULL REFERENCES "Category"(id),
      userId TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS "Budget" (
      id TEXT PRIMARY KEY,
      amount REAL NOT NULL,
      percentage REAL DEFAULT 0,
      spent REAL DEFAULT 0,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      categoryId TEXT NOT NULL REFERENCES "Category"(id),
      userId TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(categoryId, userId, month, year)
    );

    CREATE TABLE IF NOT EXISTS Goal (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      targetAmount REAL NOT NULL,
      currentAmount REAL DEFAULT 0,
      monthlyContribution REAL DEFAULT 0,
      deadline TEXT,
      icon TEXT DEFAULT 'target',
      color TEXT DEFAULT '#6366f1',
      userId TEXT NOT NULL REFERENCES User(id) ON DELETE CASCADE,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS AuditLog (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL REFERENCES User(id) ON DELETE CASCADE,
      action TEXT NOT NULL,
      entity TEXT NOT NULL,
      entityId TEXT,
      metadata TEXT,
      ipAddress TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `

  // Ejecutar SQL
  console.log("📝 Creando tablas en Turso...")
  for (const stmt of schema.split(";").filter(s => s.trim())) {
    try {
      await turso.execute(stmt)
    } catch (e: any) {
      // Ignorar errores de tabla ya existente
      if (!e.message?.includes("already exists")) {
        console.error("Error:", e.message)
      }
    }
  }

  console.log("✅ Esquema sincronizado en Turso")
  console.log("")
  console.log("📋 Ahora ejecutá: npm run seed")
  console.log("   (el seed usará TURSO_DATABASE_URL si está en .env)")

  turso.close()
}

main().catch(console.error)
