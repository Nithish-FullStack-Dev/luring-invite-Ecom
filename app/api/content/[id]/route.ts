import { prisma } from "@/lib/prisma";
import { sessionToken } from "@/lib/cms/auth";
import { authorize } from "@/lib/cms/sessions";
import { getContent, updateContent } from "@/lib/cms/content";
import { api, json, mutation, readJson } from "@/lib/cms/http";
import { contentDto, invalidateSavedContent } from "@/lib/cms/api-content";

type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, context: Context) {
  return api(async () => json(contentDto(await getContent(prisma, await sessionToken(), (await context.params).id))));
}
export async function PATCH(request: Request, context: Context) {
  return api(async () => {
    mutation(request);
    const token = await sessionToken();
    await authorize(prisma, token);
    const entry = await updateContent(prisma, token, (await context.params).id, await readJson(request));
    invalidateSavedContent();
    return json(contentDto(entry));
  });
}
