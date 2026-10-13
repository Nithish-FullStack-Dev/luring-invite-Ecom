import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revokeSession, revokeAllSessions } from "@/lib/cms/sessions";
import { cookieOptions, sessionToken } from "@/lib/cms/auth";
import { api, json, mutation, readJson } from "@/lib/cms/http";

export async function POST(request: Request) {
  return api(async () => {
    mutation(request);
    const { all } = z.object({ all: z.boolean().optional() }).strict().parse(await readJson(request));
    const token = await sessionToken();
    if (all) await revokeAllSessions(prisma, token);
    else await revokeSession(prisma, token);
    const options = cookieOptions();
    (await cookies()).set(options.name, "", { ...options, maxAge: 0, expires: new Date(0) });
    return json({ authenticated: false });
  });
}
