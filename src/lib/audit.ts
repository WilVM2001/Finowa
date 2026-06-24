import { prisma } from "./prisma"

export async function createAuditLog(
  userId: string,
  action: string,
  entity: string,
  entityId?: string,
  metadata?: Record<string, unknown>,
  ipAddress?: string,
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        metadata: metadata ? JSON.stringify(metadata) : null,
        ipAddress,
      },
    })
  } catch {
    // Audit log failure should not break the main operation
  }
}
