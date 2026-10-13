import "server-only";
import type { PrismaClient } from "@prisma/client";
import { hashPassword } from "./password";
import { AdminSetupError, validateAdminCredentials } from "./admin-setup";

export async function setupAdmin(db: PrismaClient, email: unknown, password: unknown) {
  const { email: normalized, password: secret } = validateAdminCredentials(email, password);
  const hash = await hashPassword(secret);
  return db.$transaction(async (tx) => {
    // Serializes bootstrap attempts across processes without touching existing accounts.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(7201261012)`;
    const existing = await tx.cmsAdmin.findUnique({ where: { email: normalized }, select: { id: true } });
    if (existing) return { created: false };
    if (await tx.cmsAdmin.count()) throw new AdminSetupError("ADMIN_ALREADY_EXISTS");
    await tx.cmsAdmin.create({ data: { email: normalized, passwordHash: hash } });
    return { created: true };
  }, { timeout: 10000 });
}
export async function recoverAdmin(db: PrismaClient, email: unknown, password: unknown) {
  const { email: normalized, password: secret } = validateAdminCredentials(email, password);
  const hash = await hashPassword(secret);
  await db.$transaction(async (tx) => {
    const admin = await tx.cmsAdmin.findUnique({ where: { email: normalized } });
    if (!admin) throw new AdminSetupError("ADMIN_NOT_FOUND");
    await tx.cmsAdmin.update({ where: { id: admin.id }, data: { passwordHash: hash } });
    await tx.cmsSession.deleteMany({ where: { adminId: admin.id } });
  });
}
