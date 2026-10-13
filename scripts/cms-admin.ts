import { loadEnvConfig } from "@next/env";
import type { PrismaClient } from "@prisma/client";
import {
  AdminSetupError,
  formatAdminSetupError,
  parseAdminSetupArgs,
  validateAdminCredentials,
  type AdminSetupStage,
} from "../lib/cms/admin-setup";

async function main() {
  let stage: AdminSetupStage = "arguments";
  let db: PrismaClient | undefined;
  try {
    // Recovery confirmation is checked before loading credentials or touching the database.
    const mode = parseAdminSetupArgs(process.argv.slice(2));
    stage = "environment loading";
    let environmentFailed = false;
    loadEnvConfig(process.cwd(), undefined, {
      info: () => {},
      error: () => { environmentFailed = true; },
    });
    if (environmentFailed) throw new AdminSetupError("ENVIRONMENT_LOAD");

    stage = "credential validation";
    const credentials = validateAdminCredentials(process.env.CMS_ADMIN_EMAIL, process.env.CMS_ADMIN_PASSWORD);
    console.log("[cms:admin][CONFIGURATION] Email format and password length (15–128 characters) are valid. Values are not logged.");

    stage = "client initialization";
    const { PrismaClient } = await import("@prisma/client");
    const { setupAdmin, recoverAdmin } = await import("../lib/cms/administrators");
    // A short-lived CLI client uses the existing generated schema and DATABASE_URL.
    // Suppress Prisma's own raw error output before it can bypass our safe formatter.
    db = new PrismaClient({ log: [], errorFormat: "minimal" });

    stage = "database connection";
    await db.$connect();
    stage = "database tables";
    const [adminCount] = await db.$transaction([db.cmsAdmin.count(), db.cmsSession.count()]);
    console.log("[cms:admin][DATABASE] Connected; administrator and session tables are readable. Existing administrators: " + adminCount + ".");

    let created = false;
    if (mode === "recover") {
      stage = "administrator recovery";
      await recoverAdmin(db, credentials.email, credentials.password);
    } else {
      stage = "administrator creation";
      ({ created } = await setupAdmin(db, credentials.email, credentials.password));
    }

    stage = "verification";
    const account = await db.cmsAdmin.findUnique({
      where: { email: credentials.email },
      select: { id: true, createdAt: true },
    });
    if (!account) throw new AdminSetupError("VERIFICATION");
    if (mode === "recover") console.log("[cms:admin][RECOVERED] Administrator password changed; all sessions revoked.");
    else console.log(created
      ? "[cms:admin][CREATED] Initial administrator created."
      : "[cms:admin][EXISTS] Administrator already exists; password unchanged. To change access, use the documented owner-verified recovery command.");
    console.log("[cms:admin][VERIFIED] " + JSON.stringify({ id: account.id, createdAt: account.createdAt }));
  } catch (error) {
    console.error(formatAdminSetupError(error, stage));
    process.exitCode = 1;
  } finally {
    if (db) {
      try { await db.$disconnect(); }
      catch (error) {
        console.error(formatAdminSetupError(error, "disconnect"));
        process.exitCode = 1;
      }
    }
  }
}

void main();
