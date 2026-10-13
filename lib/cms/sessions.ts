import "server-only";
import type { PrismaClient } from "@prisma/client";
import { digestToken, dummyHash, newToken, verifyPassword } from "./password";
import { emailSchema } from "./schema";
import { SESSION_SECONDS } from "./security";
import { CmsError } from "./errors";

async function consumeLimit(db: PrismaClient, key: string, maximum: number) {
  return db.$transaction(async (tx) => {
    const now = new Date();
    // The upsert takes a row lock until commit, serializing concurrent attempts.
    const row = await tx.cmsLoginLimit.upsert({
      where: { key }, create: { key, attempts: 1, expiresAt: new Date(now.getTime() + 900000) },
      update: { attempts: { increment: 1 } },
    });
    if (row.expiresAt <= now) {
      await tx.cmsLoginLimit.update({ where: { key }, data: { attempts: 1, expiresAt: new Date(now.getTime() + 900000) } });
      return true;
    }
    return row.attempts <= maximum;
  });
}
export async function authenticate(db: PrismaClient, email: unknown, password: unknown) {
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success || typeof password !== "string" || password.length > 128 || !password.length) return null;
  const globalAllowed = await consumeLimit(db, "cms:global", 40);
  if (!globalAllowed) return null;
  const accountAllowed = await consumeLimit(db, "cms:email:" + digestToken(parsed.data), 8);
  if (!accountAllowed) return null;
  const admin = await db.cmsAdmin.findUnique({ where: { email: parsed.data } });
  const valid = await verifyPassword(password, admin?.passwordHash ?? dummyHash);
  if (!admin || !valid) return null;
  const token = newToken();
  const expiresAt = new Date(Date.now() + SESSION_SECONDS * 1000);
  // Conditional lock prevents a login racing with password recovery from issuing a stale session.
  return db.$transaction(async (tx) => {
    const current = await tx.cmsAdmin.updateMany({ where: { id: admin.id, passwordHash: admin.passwordHash }, data: { updatedAt: new Date() } });
    if (current.count !== 1) return null;
    await tx.cmsSession.create({ data: { adminId: admin.id, tokenHash: digestToken(token), expiresAt } });
    return { token, expiresAt };
  });
}
export async function readSession(db: PrismaClient, token: string | undefined) {
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const session = await db.cmsSession.findUnique({
    where: { tokenHash: digestToken(token) },
    select: { expiresAt: true, admin: { select: { id: true, email: true } } },
  });
  return session && session.expiresAt > new Date() ? session.admin : null;
}
export async function authorize(db: PrismaClient, token: string | undefined) {
  const admin = await readSession(db, token);
  if (!admin) throw new CmsError("Your session expired. Please sign in again.", 401);
  return admin;
}
export async function revokeSession(db: PrismaClient, token: string | undefined) {
  if (token) await db.cmsSession.deleteMany({ where: { tokenHash: digestToken(token) } });
}
export async function revokeAllSessions(db: PrismaClient, token: string | undefined) {
  const admin = await authorize(db, token);
  await db.cmsSession.deleteMany({ where: { adminId: admin.id } });
}
