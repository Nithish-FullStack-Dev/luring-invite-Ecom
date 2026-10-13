import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authenticate, revokeSession } from "@/lib/cms/sessions";
import { cookieOptions, sessionToken } from "@/lib/cms/auth";
import { api, HttpError, json, mutation, readJson } from "@/lib/cms/http";

export async function POST(request: Request) {
  return api(async () => {
    mutation(request);
    const input = z.object({ email: z.string().max(254), password: z.string().max(128) }).strict().safeParse(await readJson(request));
    const session = input.success ? await authenticate(prisma, input.data.email, input.data.password) : null;
    if (!session) throw new HttpError(401, "Invalid credentials or too many attempts. Please try again later.");
    await revokeSession(prisma, await sessionToken());
    const options = cookieOptions();
    (await cookies()).set(options.name, session.token, { ...options, expires: session.expiresAt });
    return json({ authenticated: true });
  });
}
