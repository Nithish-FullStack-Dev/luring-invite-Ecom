import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { readSession } from "./sessions";
import { assertOrigin, sessionCookie } from "./security";
export const cookieOptions = () => sessionCookie(process.env.NODE_ENV === "production");
export async function sessionToken() { return (await cookies()).get(cookieOptions().name)?.value; }
export async function requireAdmin() {
  const admin = await readSession(prisma, await sessionToken());
  if (!admin) redirect("/admin/login");
  return admin;
}
export async function checkMutationOrigin() {
  assertOrigin((await headers()).get("origin"), process.env.CMS_ORIGIN, process.env.NODE_ENV === "production");
}
