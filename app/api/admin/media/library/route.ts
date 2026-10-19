import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { templateAdminFailure } from "@/lib/template-api-auth";

const allowed: Record<string, Set<string>> = {
  templates: new Set(["mp4", "mov", "webm", "m4v"]),
  uploads: new Set(["jpg", "jpeg", "png", "webp", "gif", "avif"]),
  fonts: new Set(["ttf", "otf"]),
};

export async function GET(request: NextRequest) {
  const authFailure = await templateAdminFailure();
  if (authFailure) return authFailure;

  const kind = new URL(request.url).searchParams.get("kind") ?? "";
  if (!Object.hasOwn(allowed, kind)) {
    return NextResponse.json(
      { status: "error", message: "Choose a supported asset category." },
      { status: 400 },
    );
  }

  try {
    const root = path.join(process.cwd(), "public", "media", kind);
    const items: Array<{ path: string; name: string; size: number; modifiedAt: number }> = [];
    async function visit(directory: string) {
      if (items.length >= 1000) return;
      let entries;
      try {
        entries = await fs.readdir(directory, { withFileTypes: true });
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") return;
        throw error;
      }
      for (const entry of entries) {
        if (items.length >= 1000) break;
        const absolute = path.join(directory, entry.name);
        if (entry.isDirectory()) {
          await visit(absolute);
        } else if (entry.isFile() && allowed[kind].has(path.extname(entry.name).slice(1).toLowerCase())) {
          const stat = await fs.stat(absolute);
          const relative = path.relative(root, absolute).split(path.sep).join("/");
          items.push({ path: `${kind}/${relative}`, name: entry.name, size: stat.size, modifiedAt: stat.mtimeMs });
        }
      }
    }
    await visit(root);
    items.sort((a, b) => b.modifiedAt - a.modifiedAt);
    return NextResponse.json({ status: "success", data: items });
  } catch (error) {
    console.error("GET /api/admin/media/library failed:", error);
    return NextResponse.json(
      { status: "error", message: "Unable to load saved media assets." },
      { status: 500 },
    );
  }
}
