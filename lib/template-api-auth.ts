import "server-only";
import { NextResponse } from "next/server";
import { sessionToken, checkMutationOrigin } from "@/lib/cms/auth";
import { CmsError } from "@/lib/cms/errors";
import { authorize } from "@/lib/cms/sessions";
import { prisma } from "@/lib/prisma";

export async function templateAdminFailure(mutation = false) {
  try {
    if (mutation) await checkMutationOrigin();
    await authorize(prisma, await sessionToken());
    return null;
  } catch (error) {
    const status = error instanceof CmsError ? error.status : mutation ? 403 : 401;
    const message = error instanceof CmsError
      ? error.message
      : mutation
        ? "Request origin rejected."
        : "Sign in to manage templates.";
    return NextResponse.json({ status: "error", message }, { status });
  }
}
