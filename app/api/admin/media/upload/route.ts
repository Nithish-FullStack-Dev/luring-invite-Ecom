import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { templateAdminFailure } from "@/lib/template-api-auth";

export const maxDuration = 60;

const MAX_FILE_SIZE = 500 * 1024 * 1024;
const ALLOWED: Record<string, Set<string>> = {
  templates: new Set(["mp4", "mov", "webm", "m4v"]),
  uploads: new Set(["jpg", "jpeg", "png", "webp", "gif", "avif"]),
  music: new Set(["mp3", "wav", "m4a", "aac", "ogg", "flac"]),
  fonts: new Set(["ttf", "otf"]),
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ status: "error", message }, { status });
}

export async function POST(request: NextRequest) {
  const authFailure = await templateAdminFailure(true);
  if (authFailure) return authFailure;
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const kind = String(formData.get("kind") ?? "");

    if (!(file instanceof File))
      return jsonError("Choose a file to upload.", 400);
    if (!Object.hasOwn(ALLOWED, kind)) return jsonError("Invalid upload category.", 400);
    if (file.size <= 0) return jsonError("The selected file is empty.", 400);
    if (file.size > MAX_FILE_SIZE)
      return jsonError("Maximum upload size is 500 MB.", 413);

    const originalName = file.name || "upload";
    const ext = path.extname(originalName).toLowerCase().replace(".", "");
    if (!ALLOWED[kind].has(ext)) {
      return jsonError(
        kind === "templates"
          ? "Upload a supported video file (MP4, MOV, WEBM, M4V)."
          : kind === "uploads"
            ? "Upload a supported image file (JPG, PNG, WEBP, GIF, AVIF)."
          : kind === "music"
            ? "Upload a supported audio file (MP3, WAV, M4A, AAC, OGG, FLAC)."
            : "Upload a supported font file (TTF or OTF).",
        400,
      );
    }

    const safeName = `${Date.now()}-${randomUUID()}.${ext}`;
    const relativePath = `${kind}/${safeName}`;
    const targetDir = path.join(process.cwd(), "public", "media", kind);
    const targetPath = path.resolve(targetDir, safeName);

    await fs.mkdir(targetDir, { recursive: true });
    const bytes = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(targetPath, bytes, { flag: "wx" });

    return NextResponse.json({
      status: "success",
      data: {
        path: relativePath,
        url: `/media/${relativePath}`,
        originalName,
        size: file.size,
        contentType: file.type || null,
      },
    });
  } catch (error) {
    console.error("POST /api/admin/media/upload failed:", error);
    return jsonError("Unable to save uploaded file.", 500);
  }
}
