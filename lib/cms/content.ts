import "server-only";
import { z } from "zod";
import { contentKeys } from "./schema";
import { Prisma, type PrismaClient } from "@prisma/client";
import { entrySchema, parseContent, keySchema, type PublicContent } from "./schema";
import { authorize } from "./sessions";
import { CmsError } from "./errors";

export async function saveContent(db: PrismaClient, token: string | undefined, input: unknown) {
  await authorize(db, token);
  const value = entrySchema.parse(input);
  if ((JSON.stringify(value.content)?.length ?? 0) > 60000) throw new CmsError("Content must be under 60,000 characters.", 400);
  const content = parseContent(value.key, value.content);
  const data = { title: value.title, key: value.key, type: value.key.toUpperCase(), status: value.status, content: content as Prisma.InputJsonValue };
  if (!value.id) {
    try { return await db.cmsContent.create({ data }); }
    catch (e) { if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") throw new CmsError("This section already exists. Open its existing entry."); throw e; }
  }
  // Prevent stale tabs overwriting more recent edits; section keys are immutable.
  const result = await db.cmsContent.updateMany({
    where: { id: value.id, key: value.key, version: value.version },
    data: { ...data, version: { increment: 1 } },
  });
  if (result.count !== 1) throw new CmsError("This entry changed or no longer exists. Reload before editing.");
  return db.cmsContent.findUniqueOrThrow({ where: { id: value.id } });
}
export async function readPublished(db: PrismaClient): Promise<PublicContent> {
  const entries = await db.cmsContent.findMany({
    where: { status: "PUBLISHED" }, select: { key: true, content: true },
  });
  const result: PublicContent = {};
  for (const entry of entries) {
    const key = keySchema.safeParse(entry.key);
    if (!key.success) continue;
    try { Object.assign(result, { [key.data]: parseContent(key.data, entry.content) }); }
    catch { /* Invalid legacy data falls back to static copy; never render arbitrary JSON/HTML. */ }
  }
  return result;
}

const idSchema = z.string().cuid();
export async function getContent(db: PrismaClient, token: string | undefined, id: string) {
  await authorize(db, token);
  const entry = await db.cmsContent.findUnique({ where: { id: idSchema.parse(id) } });
  if (!entry) throw new CmsError("Content not found.", 404);
  return entry;
}
export async function listContent(db: PrismaClient, token: string | undefined, input: unknown) {
  await authorize(db, token);
  const { q, status } = z.object({ q: z.string().max(200).default(""), status: z.enum(["DRAFT", "PUBLISHED"]).optional() }).strict().parse(input);
  const [entries, existing] = await Promise.all([
    db.cmsContent.findMany({ where: { ...(status ? { status } : {}), ...(q ? { title: { contains: q, mode: "insensitive" } } : {}) }, orderBy: { updatedAt: "desc" }, take: 100 }),
    db.cmsContent.findMany({ select: { key: true } }),
  ]);
  return { entries, missing: contentKeys.filter(key => !existing.some(entry => entry.key === key)) };
}
export async function updateContent(db: PrismaClient, token: string | undefined, id: string, input: unknown) {
  const current = await getContent(db, token, id);
  const patch = entrySchema.omit({ id: true, key: true }).partial().extend({ version: z.number().int().nonnegative() }).strict().parse(input);
  return saveContent(db, token, { id: current.id, title: current.title, key: current.key,
    status: current.status, content: current.content, ...patch });
}
