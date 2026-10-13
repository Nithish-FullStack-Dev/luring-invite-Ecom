import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { readPublished } from "./content";
import type { PublicContent } from "./schema";
export async function getPublishedContent(): Promise<PublicContent> {
  "use cache";
  cacheTag("cms:published");
  cacheLife({ stale: 0, revalidate: 30, expire: 60 });
  try {
    return await readPublished(prisma);
  } catch {
    console.warn(
      "CMS published content unavailable; using existing static copy.",
    );
    return {};
  }
}
