import { prisma } from "@/lib/prisma";
import { sessionToken } from "@/lib/cms/auth";
import { authorize } from "@/lib/cms/sessions";
import { api, json } from "@/lib/cms/http";

export async function GET() {
  return api(async () => json(await authorize(prisma, await sessionToken())));
}
