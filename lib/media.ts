import path from "node:path";
import fs from "node:fs/promises";

const PUBLIC_DIR = path.join(process.cwd(), "public");

export function normalizePublicPath(value: unknown): string {
  let clean = String(value ?? "").trim().replace(/\\/g, "/");
  clean = clean.replace(/^https?:\/\/[^/]+/i, "");
  clean = clean.replace(/^\/+/, "");
  if (clean.startsWith("luringwebsite/")) clean = clean.slice("luringwebsite/".length);
  if (clean.startsWith("api/")) clean = clean.slice(4);
  if (clean.startsWith("uploads/")) clean = `media/${clean}`;
  if (clean.startsWith("templates/")) clean = `media/${clean}`;
  if (clean.startsWith("fonts/")) clean = `media/${clean}`;
  if (clean.startsWith("music/")) clean = `media/${clean}`;
  return clean;
}

export function resolvePublicFile(value: unknown): string {
  const normalized = normalizePublicPath(value);
  const resolved = path.resolve(PUBLIC_DIR, normalized);
  if (resolved !== PUBLIC_DIR && !resolved.startsWith(PUBLIC_DIR + path.sep)) {
    throw new Error("Invalid media path.");
  }
  return resolved;
}

export async function publicFileExists(value: unknown): Promise<boolean> {
  try {
    const candidate = resolvePublicFile(value);
    const stat = await fs.stat(candidate);
    return stat.isFile();
  } catch {
    return false;
  }
}

export function publicUrl(value: unknown): string {
  const clean = normalizePublicPath(value)
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  return `/${clean}`;
}
