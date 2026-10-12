import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { renderInvitation } from "@/lib/video-renderer";
import { normalizeConfigForEditor } from "@/lib/template-config";

// export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  let payload: any;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { status: "error", message: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const templateId = Number(payload?.templateId);
  const framesData = payload?.framesData;
  const musicTrackId = String(payload?.musicTrackId || "").trim();

  if (
    !Number.isInteger(templateId) ||
    templateId <= 0 ||
    !framesData ||
    typeof framesData !== "object"
  ) {
    return NextResponse.json(
      { status: "error", message: "templateId and framesData are required." },
      { status: 400 },
    );
  }

  let jobId: string | undefined;

  try {
    const template = await prisma.template.findUnique({
      where: { id: templateId },
      include: { frames: { orderBy: { frameNumber: "asc" } } },
    });
    if (!template || !template.active) {
      return NextResponse.json(
        { status: "error", message: "Template not found." },
        { status: 404 },
      );
    }

    let frames = template.frames.map((frame) => ({
      id: frame.id,
      frameNumber: frame.frameNumber,
      title: frame.title,
      sourceVideo: frame.sourceVideo,
      previewImage: frame.previewImage,
      placeholderConfig: normalizeConfigForEditor(frame.placeholderConfig),
      durationSeconds: frame.durationSeconds,
    }));

    if (frames.length === 0 && template.legacyPlaceholderConfig) {
      frames = [
        {
          id: -template.id,
          frameNumber: 1,
          title: "Customize invitation",
          sourceVideo: template.sourceVideo,
          previewImage: template.thumbnail,
          placeholderConfig: normalizeConfigForEditor(
            template.legacyPlaceholderConfig,
          ),
          durationSeconds: template.durationSeconds || null,
        },
      ];
    }

    const knownIds = new Set(frames.map((frame) => String(frame.id)));
    const payloadIds = Object.keys(framesData as Record<string, unknown>);
    if (!payloadIds.some((key) => knownIds.has(key))) {
      return NextResponse.json(
        {
          status: "error",
          message:
            "No submitted text data matches the template frames. Reload the editor and retry.",
        },
        { status: 400 },
      );
    }

    let musicPath: string | null = null;
    if (musicTrackId) {
      const track = await prisma.musicTrack.findFirst({
        where: { id: musicTrackId, enabled: true },
      });
      if (!track) {
        return NextResponse.json(
          {
            status: "error",
            message: "Selected background music was not found.",
          },
          { status: 400 },
        );
      }
      musicPath = track.path;
    }

    const safeInput = {
      framesData: framesData as Prisma.InputJsonValue,
      musicTrackId: musicTrackId || null,
    };

    const job = await prisma.videoJob.create({
      data: {
        templateId,
        status: "PROCESSING",
        input: safeInput,
      },
    });
    jobId = job.id;

    const rendered = await renderInvitation({
      templateId,
      templateTitle: template.title,
      frames,
      framesData: framesData as Record<string, Record<string, unknown>>,
      musicPath,
    });

    await prisma.videoJob.update({
      where: { id: job.id },
      data: { status: "COMPLETED", outputPath: rendered.outputPath },
    });

    return NextResponse.json({
      status: "success",
      jobId: job.id,
      video: rendered.publicUrl,
    });
  } catch (error) {
    console.error("Video generation failed:", error);
    const message =
      error instanceof Error ? error.message : "Video generation failed.";
    if (jobId) {
      await prisma.videoJob
        .update({
          where: { id: jobId },
          data: { status: "FAILED", error: message.slice(0, 8000) },
        })
        .catch(() => undefined);
    }
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}
