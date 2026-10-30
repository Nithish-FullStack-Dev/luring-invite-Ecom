import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { renderInvitation } from "@/lib/video-renderer";
import { normalizeConfigForEditor } from "@/lib/template-config";
import { countGraphemes } from "@/lib/text-reveal";

// export const runtime = "nodejs";
export const maxDuration = 300;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export async function POST(request: NextRequest) {
  let parsed: unknown;
  try {
    parsed = await request.json();
  } catch {
    return NextResponse.json(
      { status: "error", message: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  if (!isRecord(parsed)) {
    return NextResponse.json(
      { status: "error", message: "Request body must be an object." },
      { status: 400 },
    );
  }
  const payload = parsed;

  const templateId = Number(payload?.templateId);
  const framesData = payload?.framesData;
  const musicTrackId = String(payload?.musicTrackId || "").trim();

  if (
    !Number.isInteger(templateId) ||
    templateId <= 0 ||
    !framesData ||
    typeof framesData !== "object" ||
    Array.isArray(framesData)
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
      include: {
        frames: { orderBy: { frameNumber: "asc" } },
        musicTracks: true,
      },
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

    const submitted = framesData as Record<string, unknown>;
    const frameAliases = new Map<string, string>();
    frames.forEach((frame, index) => {
      frameAliases.set(String(frame.id), String(frame.id));
      frameAliases.set(String(index), String(frame.id));
    });
    const payloadIds = Object.keys(submitted);
    if (payloadIds.some((key) => !frameAliases.has(key))) {
      return NextResponse.json(
        {
          status: "error",
          message: "Submitted frame data does not match this template.",
        },
        { status: 400 },
      );
    }

    const safeFramesData: Record<string, Record<string, string>> = {};
    for (const [frameIndex, frame] of frames.entries()) {
      const config = normalizeConfigForEditor(frame.placeholderConfig);
      const texts = Array.isArray(config.texts) ? config.texts : [];
      const rawValue = submitted[String(frame.id)] ?? submitted[String(frameIndex)] ?? {};
      if (!rawValue || typeof rawValue !== "object" || Array.isArray(rawValue)) {
        return NextResponse.json(
          { status: "error", message: `Text values for frame ${frame.frameNumber} are invalid.` },
          { status: 400 },
        );
      }
      const rawFrame = rawValue as Record<string, unknown>;
      const allowedKeys = new Set<string>();
      const normalized: Record<string, string> = {};
      for (const [textIndex, field] of texts.entries()) {
        if (field.customerEditable === false || field.visible === false) continue;
        const fieldKey = String(field.key ?? `text_${textIndex}`);
        const legacyKey = `text_${textIndex}`;
        allowedKeys.add(fieldKey);
        allowedKeys.add(legacyKey);
        const valueKey = Object.prototype.hasOwnProperty.call(rawFrame, fieldKey)
          ? fieldKey
          : legacyKey;
        const rawText = Object.prototype.hasOwnProperty.call(rawFrame, valueKey)
          ? rawFrame[valueKey]
          : field.text;
        if (typeof rawText !== "string") {
          return NextResponse.json(
            { status: "error", message: `Text field ${field.label || field.key || textIndex + 1} must be plain text.` },
            { status: 400 },
          );
        }
        const value = rawText.replace(/\r\n?/g, "\n");
        const maxLength = Math.max(1, Math.min(2000, Math.floor(Number(field.maxLength) || 500)));
        if (countGraphemes(value) > maxLength) {
          return NextResponse.json(
            { status: "error", message: `${field.label || field.key || `Text field ${textIndex + 1}`} is limited to ${maxLength} characters.` },
            { status: 400 },
          );
        }
        if (field.required === true && !value.trim()) {
          return NextResponse.json(
            { status: "error", message: `${field.label || field.key || `Text field ${textIndex + 1}`} is required.` },
            { status: 400 },
          );
        }
        normalized[fieldKey] = value;
      }
      if (Object.keys(rawFrame).some((key) => !allowedKeys.has(key))) {
        return NextResponse.json(
          { status: "error", message: `This request contains fields that are not editable in frame ${frame.frameNumber}.` },
          { status: 400 },
        );
      }
      safeFramesData[String(frame.id)] = normalized;
    }

    let musicPath: string | null = null;
    if (musicTrackId) {
      const track = await prisma.musicTrack.findFirst({
        where: {
          id: musicTrackId,
          enabled: true,
          ...(template.musicConfigured
            ? { templates: { some: { id: template.id } } }
            : {}),
        },
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
      framesData: safeFramesData as Prisma.InputJsonValue,
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
      framesData: safeFramesData,
      musicPath,
      watermark: true,
    });

    if (!rendered.publicUrl) {
      throw new Error("Unable to create the protected preview video.");
    }

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
