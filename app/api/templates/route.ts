import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { serializeTemplate } from "@/lib/serializers";
import { templateAdminFailure } from "@/lib/template-api-auth";
import { hasUniqueTextKeys } from "@/lib/template-config";

function slugify(value: string) {
  return (
    value
      .normalize("NFKD")
      .toLowerCase()
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "template"
  );
}

function error(message: string, status = 400) {
  return NextResponse.json({ status: "error", message }, { status });
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search")?.trim();

    const templates = await prisma.template.findMany({
      where: {
        active: true,
        ...(category && category !== "all"
          ? { categories: { some: { category: { slug: category } } } }
          : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        categories: { include: { category: true } },
        frames: { orderBy: { frameNumber: "asc" } },
      },
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    });

    return NextResponse.json({
      status: "success",
      data: templates.map((template) => serializeTemplate(template)),
    });
  } catch (error) {
    console.error("GET /api/templates failed:", error);
    return NextResponse.json(
      {
        status: "error",
        message:
          "Unable to fetch templates. Ensure the database is migrated and seeded.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const authFailure = await templateAdminFailure(true);
  if (authFailure) return authFailure;
  try {
    const parsed: unknown = await request.json();
    if (!isRecord(parsed)) return error("Request body must be an object.");
    const body = parsed;

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : "";
    const price = Number(body.price);
    const durationSeconds = Number(body.durationSeconds);
    const thumbnail =
      typeof body.thumbnail === "string" ? body.thumbnail.trim() : "";
    const sourceVideo =
      typeof body.sourceVideo === "string" ? body.sourceVideo.trim() : "";
    const requestedSlug = typeof body.slug === "string" ? body.slug.trim() : "";
    const previewVideo =
      typeof body.previewVideo === "string" && body.previewVideo.trim()
        ? body.previewVideo.trim()
        : null;
    const active = body.active !== false;
    const frames = Array.isArray(body.frames) ? body.frames : [];

    if (!title) return error("Template title is required.");
    if (!Number.isFinite(price) || price < 0)
      return error("Price must be zero or greater.");
    if (!Number.isInteger(durationSeconds) || durationSeconds <= 0) {
      return error("Template duration must be a positive number of seconds.");
    }
    if (!thumbnail) return error("A thumbnail path is required.");
    if (frames.length === 0) return error("Add at least one frame.");

    const validFrames: Record<string, unknown>[] = [];
    for (const [index, value] of frames.entries()) {
      if (
        !isRecord(value) ||
        typeof value.sourceVideo !== "string" ||
        !value.sourceVideo.trim()
      ) {
        return error(`Frame ${index + 1} requires a source video.`);
      }
      if (!isRecord(value.placeholderConfig)) {
        return error(
          `Frame ${index + 1} has invalid placeholder configuration.`,
        );
      }
      if (!hasUniqueTextKeys(value.placeholderConfig)) {
        return error(`Frame ${index + 1} has duplicate editable field keys.`);
      }
      validFrames.push(value);
    }

    const baseSlug = slugify(requestedSlug || title);
    const slug = requestedSlug ? baseSlug : `${baseSlug}-${Date.now().toString(36)}`;
    if (Array.isArray(body.musicTrackIds) && body.musicTrackIds.some((id: unknown) => typeof id !== "string" || !id.trim())) {
      return error("musicTrackIds must contain valid track IDs.");
    }
    const requestedMusicIds: string[] = Array.isArray(body.musicTrackIds)
      ? [...new Set((body.musicTrackIds as unknown[]).filter((id): id is string => typeof id === "string").map((id) => id.trim()))]
      : [];
    const configuredMusic = body.musicConfigured === true || Array.isArray(body.musicTrackIds) || Boolean(body.music);
    const requestedMusic = isRecord(body.music) ? body.music : null;
    if (requestedMusicIds.length) {
      const count = await prisma.musicTrack.count({ where: { id: { in: requestedMusicIds } } });
      if (count !== requestedMusicIds.length) return error("One or more selected music tracks do not exist.");
    }

    const created = await prisma.$transaction(async (tx) => {
      const musicTrackIds = [...requestedMusicIds];
      if (
        requestedMusic &&
        typeof requestedMusic.title === "string" &&
        typeof requestedMusic.path === "string"
      ) {
        const track = await tx.musicTrack.create({
          data: {
            title: requestedMusic.title.trim(),
            path: requestedMusic.path.trim(),
            duration:
              Number.isFinite(Number(requestedMusic.duration)) &&
              Number(requestedMusic.duration) > 0
                ? Number(requestedMusic.duration)
                : null,
            enabled: true,
          },
        });
        musicTrackIds.push(track.id);
      }
      const template = await tx.template.create({
        data: {
          title,
          slug,
          description: description || null,
          thumbnail,
          previewVideo,
          sourceVideo: sourceVideo || null,
          price: new Prisma.Decimal(price.toFixed(2)),
          durationSeconds,
          active,
          musicConfigured: configuredMusic,
          ...(configuredMusic
            ? { musicTracks: { connect: musicTrackIds.map((id) => ({ id })) } }
            : {}),
          frames: {
            create: validFrames.map((frame, index) => ({
              frameNumber: index + 1,
              title:
                typeof frame.title === "string" && frame.title.trim()
                  ? frame.title.trim()
                  : `Frame ${index + 1}`,
              sourceVideo: typeof frame.sourceVideo === "string" ? frame.sourceVideo.trim() : "",
              previewImage:
                typeof frame.previewImage === "string" &&
                frame.previewImage.trim()
                  ? frame.previewImage.trim()
                  : null,
              durationSeconds:
                Number.isInteger(Number(frame.durationSeconds)) &&
                Number(frame.durationSeconds) > 0
                  ? Number(frame.durationSeconds)
                  : null,
              placeholderConfig:
                frame.placeholderConfig as Prisma.InputJsonValue,
            })),
          },
        },
        include: {
          categories: { include: { category: true } },
          frames: { orderBy: { frameNumber: "asc" } },
          musicTracks: true,
        },
      });

      return template;
    });

    return NextResponse.json(
      { status: "success", data: serializeTemplate(created, true) },
      { status: 201 },
    );
  } catch (err) {
    console.error("POST /api/templates failed:", err);
    return NextResponse.json(
      {
        status: "error",
        message:
          err instanceof Error && err.message.includes("Unique constraint")
            ? "A template with this slug already exists. Try a different title."
            : "Unable to create template. Check your Prisma schema and database connection.",
      },
      { status: 500 },
    );
  }
}
