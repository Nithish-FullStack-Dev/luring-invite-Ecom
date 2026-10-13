import { emailSchema, passwordSchema } from "./schema";

export type AdminSetupErrorCode =
  | "ARGUMENTS"
  | "RECOVERY_CONFIRMATION"
  | "ENVIRONMENT_LOAD"
  | "EMAIL_MISSING"
  | "EMAIL_INVALID"
  | "PASSWORD_MISSING"
  | "PASSWORD_LENGTH"
  | "ADMIN_ALREADY_EXISTS"
  | "ADMIN_NOT_FOUND"
  | "VERIFICATION";

const messages: Record<AdminSetupErrorCode, string> = {
  ARGUMENTS: "Use npm run cms:admin, or npm run cms:admin -- --recover --confirm-owner-verified. Unknown or conflicting options are not accepted.",
  RECOVERY_CONFIRMATION: "Recovery requires --recover --confirm-owner-verified after verifying the existing account owner. No password was changed.",
  ENVIRONMENT_LOAD: "Unable to load an environment file. Check its permissions and syntax. Environment values and loader error details are suppressed.",
  EMAIL_MISSING: "CMS_ADMIN_EMAIL is missing or empty. Set it in the process environment or a local .env file.",
  EMAIL_INVALID: "CMS_ADMIN_EMAIL must be a valid email address of at most 254 characters.",
  PASSWORD_MISSING: "CMS_ADMIN_PASSWORD is missing or empty. Set a unique password of 15–128 characters securely.",
  PASSWORD_LENGTH: "CMS_ADMIN_PASSWORD must contain 15–128 characters. Update it securely and rerun npm run cms:admin. The password is never trimmed, padded, or replaced automatically.",
  ADMIN_ALREADY_EXISTS: "A CMS administrator already exists under a different email. Initialization cannot add a duplicate account. Verify the owner, configure the existing account's email and a new compliant password, then run npm run cms:admin -- --recover --confirm-owner-verified.",
  ADMIN_NOT_FOUND: "Recovery found no administrator matching the configured email. Verify the existing account's email; recovery cannot create or promote an account.",
  VERIFICATION: "The administrator record could not be verified after setup. Do not assume success; check the configured database and retry the idempotent setup command.",
};

export class AdminSetupError extends Error {
  constructor(public readonly code: AdminSetupErrorCode) {
    super(messages[code]);
    this.name = "AdminSetupError";
  }
}

export function parseAdminSetupArgs(args: string[]): "initialize" | "recover" {
  const allowed = new Set(["--recover", "--confirm-owner-verified"]);
  if (args.some(arg => !allowed.has(arg)) || new Set(args).size !== args.length) {
    throw new AdminSetupError("ARGUMENTS");
  }
  if (args.includes("--recover")) {
    if (!args.includes("--confirm-owner-verified")) throw new AdminSetupError("RECOVERY_CONFIRMATION");
    return "recover";
  }
  if (args.includes("--confirm-owner-verified")) throw new AdminSetupError("ARGUMENTS");
  return "initialize";
}

export function validateAdminCredentials(email: unknown, password: unknown) {
  if (email === undefined || email === null || (typeof email === "string" && !email.trim())) {
    throw new AdminSetupError("EMAIL_MISSING");
  }
  const parsedEmail = emailSchema.safeParse(email);
  if (!parsedEmail.success) throw new AdminSetupError("EMAIL_INVALID");
  if (password === undefined || password === null || password === "") throw new AdminSetupError("PASSWORD_MISSING");
  const parsedPassword = passwordSchema.safeParse(password);
  if (!parsedPassword.success) throw new AdminSetupError("PASSWORD_LENGTH");
  return { email: parsedEmail.data, password: parsedPassword.data };
}

export type AdminSetupStage =
  | "arguments" | "environment loading" | "credential validation"
  | "client initialization" | "database connection" | "database tables"
  | "administrator creation" | "administrator recovery" | "verification" | "disconnect";

export type AdminSetupDiagnostic = {
  category: string;
  message: string;
  prismaCode?: string;
};

const prismaDiagnostics: Record<string, { category: string; message: string }> = {
  P1000: { category: "DATABASE_AUTHENTICATION", message: "PostgreSQL rejected database authentication. Check DATABASE_URL credentials securely; do not print the connection string." },
  P1001: { category: "DATABASE_CONNECTIVITY", message: "Cannot reach PostgreSQL. Check database availability, network access and DATABASE_URL." },
  P1002: { category: "DATABASE_TIMEOUT", message: "PostgreSQL connection timed out. Check database availability and network access, then retry." },
  P1003: { category: "DATABASE_CONFIGURATION", message: "The configured database does not exist. Check the database name in DATABASE_URL." },
  P1008: { category: "DATABASE_TIMEOUT", message: "A database operation timed out. Check PostgreSQL availability and retry." },
  P1010: { category: "DATABASE_PERMISSIONS", message: "The database account lacks access. Check PostgreSQL grants for the configured database/schema." },
  P1011: { category: "DATABASE_TLS", message: "PostgreSQL TLS negotiation failed. Check the required TLS settings and certificate trust." },
  P1012: { category: "DATABASE_CONFIGURATION", message: "Prisma configuration is invalid. Check required database environment variables and run npx prisma validate." },
  P1013: { category: "DATABASE_CONFIGURATION", message: "The database connection string is invalid. Check DATABASE_URL formatting securely." },
  P1017: { category: "DATABASE_CONNECTIVITY", message: "PostgreSQL closed the connection. Check the database or connection pool and retry." },
  P2002: { category: "DATABASE_CONFLICT", message: "A unique account constraint prevented insertion. Rerun the idempotent setup; if another account exists, use verified recovery instead of creating a duplicate." },
  P2010: { category: "DATABASE_STATEMENT", message: "PostgreSQL rejected a setup statement. Check database permissions and transaction support, including pg_advisory_xact_lock; no raw SQL error details are logged." },
  P2021: { category: "DATABASE_SCHEMA", message: "A required CMS table is missing from the application database/schema. Verify DATABASE_URL and DIRECT_URL target the intended database, then run npx prisma migrate status and apply the documented migrations." },
  P2022: { category: "DATABASE_SCHEMA", message: "A required database column is missing. Verify migrations for the application database/schema and regenerate Prisma Client." },
  P2024: { category: "DATABASE_POOL", message: "Timed out obtaining a database connection. Check connection pool capacity and retry." },
  P2028: { category: "DATABASE_TRANSACTION", message: "The setup transaction failed or expired. Check database latency or lock contention, then retry the idempotent command." },
  P2034: { category: "DATABASE_CONFLICT", message: "A concurrent transaction conflicted with setup. Retry the idempotent command after the other operation completes." },
};

// Only fixed messages and a validated Prisma code leave this boundary.
// Never stringify errors, messages, stacks, causes, validation input, or Prisma metadata.
export function diagnoseAdminSetupError(error: unknown): AdminSetupDiagnostic {
  if (error instanceof AdminSetupError) return { category: error.code, message: messages[error.code] };
  const record = typeof error === "object" && error !== null ? error as Record<string, unknown> : {};
  const candidate = record.code ?? record.errorCode;
  const code = typeof candidate === "string" && /^P[0-9]{4}$/.test(candidate) ? candidate : undefined;
  if (code) {
    const diagnostic = prismaDiagnostics[code] ?? {
      category: "DATABASE_ERROR",
      message: "Prisma rejected the operation. Check the reported Prisma code, database configuration and applied migrations; sensitive error details are suppressed.",
    };
    return { ...diagnostic, prismaCode: code };
  }
  if (record.code === "ERR_CRYPTO_INVALID_SCRYPT_PARAMS" || record.code === "ENOMEM") {
    return { category: "PASSWORD_HASHING", message: "Password hashing could not allocate its required resources. Check available memory and the Node.js runtime; do not lower the password hashing parameters." };
  }
  return { category: "UNEXPECTED", message: "Setup failed at the reported stage. Check installed dependencies, Prisma Client generation and the Node.js runtime. Raw error details are suppressed to protect secrets." };
}

export function formatAdminSetupError(error: unknown, stage: AdminSetupStage): string {
  const diagnostic = diagnoseAdminSetupError(error);
  const code = diagnostic.prismaCode ? " / " + diagnostic.prismaCode : "";
  return "[cms:admin][" + diagnostic.category + code + "][" + stage + "] " + diagnostic.message;
}
