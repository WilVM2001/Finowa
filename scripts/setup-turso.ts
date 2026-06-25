// Script para crear base de datos en Turso Cloud
// Uso: npx tsx scripts/setup-turso.ts <TOKEN_API>
//
// 1. Registrarse en https://turso.tech
// 2. Ir a Settings > API Tokens > Generar token
// 3. Ejecutar: npx tsx scripts/setup-turso.ts turs_xxxxxxxxx

const API = "https://api.turso.tech/v1"

async function main() {
  const token = process.argv[2]
  if (!token) {
    console.error("❌ Usa: npx tsx scripts/setup-turso.ts <TU_TOKEN_API>")
    process.exit(1)
  }

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }

  // 1. Obtener organizacion
  const orgRes = await fetch(`${API}/organizations`, { headers })
  const orgs = await orgRes.json()
  const org = Array.isArray(orgs) ? orgs[0]?.slug : orgs.data?.[0]?.slug
  if (!org) { console.error("❌ No se encontró organización"); process.exit(1) }
  console.log(`📦 Organización: ${org}`)

  // 2. Crear grupo si no existe
  const groupsRes = await fetch(`${API}/organizations/${org}/groups`, { headers })
  const groupsData = await groupsRes.json()
  const groups = (groupsData.groups || []).map((g: any) => g.name)
  const group = "us-east"
  if (!groups.includes(group)) {
    console.log(`📍 Creando grupo '${group}' en aws-us-east-1...`)
    await fetch(`${API}/organizations/${org}/groups`, {
      method: "POST",
      headers,
      body: JSON.stringify({ name: group, location: "aws-us-east-1" }),
    })
  }

  // 3. Crear base de datos
  const name = "finowa"
  console.log(`📀 Creando base de datos '${name}'...`)
  const createRes = await fetch(`${API}/organizations/${org}/databases`, {
    method: "POST",
    headers,
    body: JSON.stringify({ name, group }),
  })
  const db = await createRes.json()
  if (!createRes.ok) {
    // Puede que ya exista
    console.log(`ℹ️  ${db.error || "Ya existe, obteniendo datos..."}`)
    const getRes = await fetch(`${API}/organizations/${org}/databases/${name}`, { headers })
    const existing = await getRes.json()
    if (!existing?.database) { console.error("❌ Error al crear", db); process.exit(1) }
    console.log(`✅ Base encontrada: ${existing.database.Name}`)
    console.log(`   URL: ${existing.database.DbId}`)
  } else {
    console.log(`✅ Base creada: ${db.database.Name}`)
    console.log(`   URL: ${db.database.DbId}`)
  }

  // 3. Obtener URL de conexion
  const infoRes = await fetch(`${API}/organizations/${org}/databases/${name}`, { headers })
  const info = await infoRes.json()
  const hostname = info.database?.Hostname
  const dbUrl = `libsql://${hostname}`

  // 4. Generar token de auth
  const tokenRes = await fetch(`${API}/organizations/${org}/databases/${name}/auth/tokens`, {
    method: "POST",
    headers,
  })
  const tokData = await tokenRes.json()
  const authToken = tokData.jwt

  console.log(`\n🔑 Variables para .env:\n`)
  console.log(`TURSO_DATABASE_URL="${dbUrl}"`)
  console.log(`TURSO_AUTH_TOKEN="${authToken}"`)
  console.log(`\n📋 Agregalas a tu .env y Vercel (Settings > Environment Variables)`)
}

main().catch(console.error)
