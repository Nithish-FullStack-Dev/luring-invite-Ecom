import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { serializeTemplate } from "@/lib/serializers";

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
      data: templates.map(serializeTemplate),
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
  try {
    const body = await request.json();

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : "";
    const price = Number(body.price);
    const durationSeconds = Number(body.durationSeconds);
    const thumbnail =
      typeof body.thumbnail === "string" ? body.thumbnail.trim() : "";
    const sourceVideo =
      typeof body.sourceVideo === "string" ? body.sourceVideo.trim() : "";
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
    if (!sourceVideo) return error("A source video path is required.");
    if (frames.length === 0) return error("Add at least one frame.");

    for (const [index, frame] of frames.entries()) {
      if (
        !frame ||
        typeof frame.sourceVideo !== "string" ||
        !frame.sourceVideo.trim()
      ) {
        return error(`Frame ${index + 1} requires a source video.`);
      }
      if (
        !frame.placeholderConfig ||
        typeof frame.placeholderConfig !== "object"
      ) {
        return error(
          `Frame ${index + 1} has invalid placeholder configuration.`,
        );
      }
    }

    const baseSlug = slugify(
      typeof body.slug === "string" && body.slug.trim() ? body.slug : title,
    );
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    const created = await prisma.$transaction(async (tx) => {
      const template = await tx.template.create({
        data: {
          title,
          slug,
          description: description || null,
          thumbnail,
          previewVideo,
          sourceVideo,
          price: new Prisma.Decimal(price.toFixed(2)),
          durationSeconds,
          active,
          frames: {
            create: frames.map((frame: any, index: number) => ({
              frameNumber: Number.isInteger(Number(frame.frameNumber))
                ? Number(frame.frameNumber)
                : index + 1,
              title:
                typeof frame.title === "string" && frame.title.trim()
                  ? frame.title.trim()
                  : `Frame ${index + 1}`,
              sourceVideo: frame.sourceVideo.trim(),
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
        },
      });

      if (
        body.music &&
        typeof body.music.title === "string" &&
        typeof body.music.path === "string"
      ) {
        await tx.musicTrack.create({
          data: {
            title: body.music.title.trim(),
            path: body.music.path.trim(),
            duration:
              Number.isFinite(Number(body.music.duration)) &&
              Number(body.music.duration) > 0
                ? Number(body.music.duration)
                : null,
            enabled: true,
          },
        });
      }

      return template;
    });

    return NextResponse.json(
      { status: "success", data: serializeTemplate(created) },
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
