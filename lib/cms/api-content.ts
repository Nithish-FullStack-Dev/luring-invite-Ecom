import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";
import { invalidateContent } from "./revalidation";
import type { CmsContent } from "@prisma/client";
import type { ContentEntry } from "./contracts";
import { keySchema } from "./schema";

export function contentDto(entry: CmsContent): ContentEntry {
  return { id: entry.id, title: entry.title, key: keySchema.parse(entry.key), type: entry.type,
    status: entry.status, version: entry.version, content: entry.content,
    createdAt: entry.createdAt.toISOString(), updatedAt: entry.updatedAt.toISOString() };
}
export function invalidateSavedContent() {
  // updateTag is Server-Action-only. expire:0 preserves immediate public freshness.
  invalidateContent(tag => revalidateTag(tag, { expire: 0 }), revalidatePath);
}
