import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeTemplate } from "@/lib/serializers";
import { Prisma } from "@prisma/client";
import { templateAdminFailure } from "@/lib/template-api-auth";
import { hasUniqueTextKeys } from "@/lib/template-config";
import {
  templateCategoryForSlug,
  type TemplateCategorySlug,
} from "@/lib/template-categories";
import { resolveTemplateCategoryId } from "@/lib/template-category-persistence";

type Context = { params: Promise<{ id: string }> };
const fail = (message: string, status = 400) =>
  NextResponse.json({ status: "error", message }, { status });
function slugify(value: string) {
  return value.normalize("NFKD").toLowerCase().replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "template";
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
async function readId(ctx: Context) {
  const { id } = await ctx.params;
  const n = Number(id);
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}

export async function GET(_request: Request, context: Context) {
  const { id: rawId } = await context.params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json(
      { status: "error", message: "Invalid template ID." },
      { status: 400 },
    );
  }

  const manage = new URL(_request.url).searchParams.get("manage") === "true";
  if (manage) {
    const authFailure = await templateAdminFailure();
    if (authFailure) return authFailure;
  }

  try {
    const template = await prisma.template.findUnique({
      where: { id },
      include: {
        categories: { include: { category: true } },
        frames: { orderBy: { frameNumber: "asc" } },
        musicTracks: manage ? true : { where: { enabled: true }, orderBy: { title: "asc" } },
      },
    });
    if (!template || (!manage && !template.active)) {
      return NextResponse.json(
        { status: "error", message: "Template not found." },
        { status: 404 },
      );
    }
    const musicTracks = !manage && !template.musicConfigured
      ? await prisma.musicTrack.findMany({ where: { enabled: true }, orderBy: { title: "asc" } })
      : template.musicTracks;
    return NextResponse.json({
      status: "success",
      data: serializeTemplate({ ...template, musicTracks }, manage),
    });
  } catch (error) {
    console.error(`GET /api/templates/${id} failed:`, error);
    return NextResponse.json(
      { status: "error", message: "Unable to load this template." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, ctx: Context) {
  const authFailure = await templateAdminFailure(true);
  if (authFailure) return authFailure;
  const id = await readId(ctx);
  if (!id) return fail("Invalid template ID.", 400);
  try {
    const parsed: unknown = await request.json();
    if (!isRecord(parsed)) return fail("Request body must be an object.");
    const body = parsed;
    let categorySlug: TemplateCategorySlug | null | undefined;
    const hasCategory = Object.prototype.hasOwnProperty.call(body, "categorySlug");
    if (hasCategory) {
      if (body.categorySlug === null || body.categorySlug === "") {
        categorySlug = null;
      } else {
        const category = templateCategoryForSlug(body.categorySlug);
        if (!category) return fail("Select a valid template category.");
        categorySlug = category.slug;
      }
    }
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const price = Number(body.price);
    const durationSeconds = Number(body.durationSeconds);
    const frames = Array.isArray(body.frames) ? body.frames : null;
    if (!title) return fail("Template title is required.");
    if (!Number.isFinite(price) || price < 0)
      return fail("Price must be zero or greater.");
    if (!Number.isInteger(durationSeconds) || durationSeconds < 1)
      return fail("Duration must be a positive number of seconds.");
    if (typeof body.thumbnail !== "string" || !body.thumbnail.trim())
      return fail("Thumbnail is required.");
    const thumbnail = body.thumbnail.trim();
    if (!frames || frames.length < 1) return fail("Add at least one frame.");
    const validFrames: Record<string, unknown>[] = [];
    for (const [i, value] of frames.entries()) {
      if (!isRecord(value) || typeof value.sourceVideo !== "string" || !value.sourceVideo.trim())
        return fail(`Frame ${i + 1} requires a source video.`);
      if (!isRecord(value.placeholderConfig))
        return fail(`Frame ${i + 1} has invalid text configuration.`);
      if (!hasUniqueTextKeys(value.placeholderConfig))
        return fail(`Frame ${i + 1} has duplicate editable field keys.`);
      validFrames.push(value);
    }
    const exists = await prisma.template.findUnique({
      where: { id },
      select: { id: true, slug: true, musicConfigured: true },
    });
    if (!exists) return fail("Template not found.", 404);

    const slugInput = typeof body.slug === "string" ? body.slug.trim() : "";
    const slug = body.slug === undefined ? exists.slug : slugInput ? slugify(slugInput) : slugify(title);
    const duplicateSlug = await prisma.template.findFirst({
      where: { slug, id: { not: id } },
      select: { id: true },
    });
    if (duplicateSlug) return fail("A template with this slug already exists.");
    if (Array.isArray(body.musicTrackIds) && body.musicTrackIds.some((trackId: unknown) => typeof trackId !== "string" || !trackId.trim())) {
      return fail("musicTrackIds must contain valid track IDs.");
    }
    const musicIds: string[] | null = Array.isArray(body.musicTrackIds)
      ? [...new Set((body.musicTrackIds as unknown[]).filter((trackId): trackId is string => typeof trackId === "string").map((trackId) => trackId.trim()))]
      : null;
    if (musicIds) {
      const count = musicIds.length ? await prisma.musicTrack.count({ where: { id: { in: musicIds } } }) : 0;
      if (count !== musicIds.length) return fail("One or more selected music tracks do not exist.");
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.templateFrame.deleteMany({ where: { templateId: id } });
      if (hasCategory) {
        await tx.templateCategory.deleteMany({ where: { templateId: id } });
        if (categorySlug) {
          const categoryId = await resolveTemplateCategoryId(tx, categorySlug);
          await tx.templateCategory.create({
            data: { templateId: id, categoryId },
          });
        }
      }
      const template = await tx.template.update({
        where: { id },
        data: {
          title,
          slug,
          description:
            typeof body.description === "string" && body.description.trim()
              ? body.description.trim()
              : null,
          thumbnail,
          previewVideo:
            typeof body.previewVideo === "string" && body.previewVideo.trim()
              ? body.previewVideo.trim()
              : null,
          sourceVideo:
            body.sourceVideo === undefined
              ? undefined
              : typeof body.sourceVideo === "string" && body.sourceVideo.trim()
                ? body.sourceVideo.trim()
                : null,
          price: new Prisma.Decimal(price.toFixed(2)),
          durationSeconds,
          active: body.active !== false,
          ...(musicIds
            ? {
                musicConfigured: body.musicConfigured !== false,
                musicTracks: { set: musicIds.map((trackId) => ({ id: trackId })) },
              }
            : body.musicConfigured !== undefined
              ? { musicConfigured: body.musicConfigured === true }
              : {}),
          frames: {
            create: validFrames.map((f, i) => ({
              frameNumber: i + 1,
              title:
                typeof f.title === "string" && f.title.trim()
                  ? f.title.trim()
                  : `Frame ${i + 1}`,
              sourceVideo: typeof f.sourceVideo === "string" ? f.sourceVideo.trim() : "",
              previewImage:
                typeof f.previewImage === "string" && f.previewImage.trim()
                  ? f.previewImage.trim()
                  : null,
              durationSeconds:
                Number.isInteger(Number(f.durationSeconds)) &&
                Number(f.durationSeconds) > 0
                  ? Number(f.durationSeconds)
                  : null,
              placeholderConfig: f.placeholderConfig as Prisma.InputJsonValue,
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
    return NextResponse.json({
      status: "success",
      data: serializeTemplate(updated, true),
    });
  } catch (e) {
    console.error("PATCH /api/templates/[id] failed", e);
    return fail(
      "Unable to update template. Check server logs and your Prisma schema.",
      500,
    );
  }
}

export async function DELETE(_request: Request, ctx: Context) {
  const authFailure = await templateAdminFailure(true);
  if (authFailure) return authFailure;
  const id = await readId(ctx);
  if (!id) return fail("Invalid template ID.", 400);
  try {
    const deleted = await prisma.template.delete({
      where: { id },
      include: {
        categories: { include: { category: true } },
        frames: { orderBy: { frameNumber: "asc" } },
      },
    });
    return NextResponse.json({
      status: "success",
      data: serializeTemplate(deleted, true),
    });
  } catch (e) {
    console.error("DELETE /api/templates/[id] failed", e);
    return fail("Unable to delete template.", 500);
  }
}
