import { prisma } from "@/lib/prisma";
import { sessionToken } from "@/lib/cms/auth";
import { authorize } from "@/lib/cms/sessions";
import { listContent, saveContent } from "@/lib/cms/content";
import { entrySchema } from "@/lib/cms/schema";
import { api, json, mutation, readJson } from "@/lib/cms/http";
import { contentDto, invalidateSavedContent } from "@/lib/cms/api-content";

export async function GET(request: Request) {
  return api(async () => {
    const query = new URL(request.url).searchParams;
    const result = await listContent(prisma, await sessionToken(), { q: query.get("q") ?? "", status: query.get("status") || undefined });
    return json({ ...result, entries: result.entries.map(contentDto) });
  });
}
export async function POST(request: Request) {
  return api(async () => {
    mutation(request);
    const token = await sessionToken();
    await authorize(prisma, token);
    const value = entrySchema.omit({ id: true }).parse(await readJson(request));
    const entry = await saveContent(prisma, token, value);
    invalidateSavedContent();
    return json(contentDto(entry), 201);
  });
}
