import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { normalizeConfigForEditor } from "@/lib/template-config";
import { renderInvitation } from "@/lib/video-renderer";

const PRIVATE_VIDEO_ROOT = path.resolve(process.cwd(), "storage", "generated");

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function resolvePrivateVideo(relativePath: string): string | null {
  const absolutePath = path.resolve(process.cwd(), relativePath);
  const relativeToRoot = path.relative(PRIVATE_VIDEO_ROOT, absolutePath);
  if (
    !relativeToRoot ||
    relativeToRoot === ".." ||
    relativeToRoot.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativeToRoot)
  ) {
    return null;
  }
  return absolutePath;
}

async function getExistingPrivateVideo(relativePath: string) {
  const absolutePath = resolvePrivateVideo(relativePath);
  if (!absolutePath) return null;

  try {
    const file = await fs.stat(absolutePath);
    return file.isFile() ? absolutePath : null;
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return null;
    }
    throw error;
  }
}

/** Renders a clean copy only after a verified server-side payment. */
export async function renderPaidVideo(videoJobId: string) {
  const purchase = await prisma.videoPurchase.findFirst({
    where: {
      videoJobId,
      order: { paymentStatus: "PAID", status: "CONFIRMED" },
    },
    select: { id: true },
  });
  if (!purchase) throw new Error("A confirmed payment is required to render this video.");

  const job = await prisma.videoJob.findUnique({
    where: { id: videoJobId },
    include: {
      template: {
        include: { frames: { orderBy: { frameNumber: "asc" } } },
      },
    },
  });
  if (!job || job.status !== "COMPLETED") {
    throw new Error("The preview video is not ready.");
  }

  if (job.finalPath) {
    const existingVideo = await getExistingPrivateVideo(job.finalPath);
    if (existingVideo) return job.finalPath;
  }

  const input = record(job.input);
  const framesData = record(input.framesData) as Record<
    string,
    Record<string, unknown>
  >;
  const selectedMusicId =
    typeof input.musicTrackId === "string" ? input.musicTrackId : "";
  const track = selectedMusicId
    ? await prisma.musicTrack.findUnique({
        where: { id: selectedMusicId },
        select: { path: true },
      })
    : null;
  if (selectedMusicId && !track) {
    throw new Error("The background music for this video is unavailable.");
  }

  let frames = job.template.frames.map((frame) => ({
    id: frame.id,
    frameNumber: frame.frameNumber,
    title: frame.title,
    sourceVideo: frame.sourceVideo,
    previewImage: frame.previewImage,
    placeholderConfig: normalizeConfigForEditor(frame.placeholderConfig),
    durationSeconds: frame.durationSeconds,
  }));
  if (frames.length === 0 && job.template.legacyPlaceholderConfig) {
    frames = [
      {
        id: -job.template.id,
        frameNumber: 1,
        title: "Customize invitation",
        sourceVideo: job.template.sourceVideo,
        previewImage: job.template.thumbnail,
        placeholderConfig: normalizeConfigForEditor(
          job.template.legacyPlaceholderConfig,
        ),
        durationSeconds: job.template.durationSeconds,
      },
    ];
  }

  const rendered = await renderInvitation({
    templateId: job.templateId,
    templateTitle: job.template.title,
    frames,
    framesData,
    musicPath: track?.path ?? null,
    watermark: false,
  });
  const privateVideo = resolvePrivateVideo(rendered.outputPath);
  if (rendered.publicUrl || !privateVideo) {
    throw new Error("The clean video was not written to private storage.");
  }

  await prisma.videoJob.update({
    where: { id: job.id },
    data: { finalPath: rendered.outputPath },
  });
  return rendered.outputPath;
}
