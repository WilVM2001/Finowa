import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import { createClient } from "@libsql/client"
import { hash, compare } from "bcryptjs"

const libsql = createClient({
  url: process.env.DATABASE_URL || "file:./dev.db",
})

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL || "file:./dev.db" })
const prisma = new PrismaClient({ adapter })

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "admin@wdev.com" },
  })

  if (!user) {
    console.log("❌ Usuario no encontrado en la DB")
    return
  }

  console.log("✅ Usuario encontrado:", user.email)
  console.log("   Password hash:", user.password?.substring(0, 30) + "...")

  const testPassword = "Wdev2024!"
  const isValid = await compare(testPassword, user.password!)
  console.log(`   ¿"${testPassword}" coincide?`, isValid ? "✅ SI" : "❌ NO")

  const newHash = await hash(testPassword, 12)
  console.log("   Nuevo hash generado:", newHash.substring(0, 30) + "...")

  const isValidNew = await compare(testPassword, newHash)
  console.log("   ¿Nuevo hash funciona?", isValidNew ? "✅ SI" : "❌ NO")

  if (!isValid) {
    console.log("\n⚠️  Actualizando contraseña...")
    await prisma.user.update({
      where: { id: user.id },
      data: { password: newHash },
    })
    console.log("✅ Contraseña actualizada")
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
