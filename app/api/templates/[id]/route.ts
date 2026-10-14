import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeTemplate } from "@/lib/serializers";
import { Prisma } from "@prisma/client";

type Context = { params: Promise<{ id: string }> };
const fail = (message: string, status = 400) =>
  NextResponse.json({ status: "error", message }, { status });
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

  try {
    const template = await prisma.template.findUnique({
      where: { id },
      include: {
        categories: { include: { category: true } },
        frames: { orderBy: { frameNumber: "asc" } },
      },
    });
    if (!template || !template.active) {
      return NextResponse.json(
        { status: "error", message: "Template not found." },
        { status: 404 },
      );
    }
    return NextResponse.json({
      status: "success",
      data: serializeTemplate(template),
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
  const id = await readId(ctx);
  if (!id) return fail("Invalid template ID.", 400);
  try {
    const body = await request.json();
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
    if (typeof body.sourceVideo !== "string" || !body.sourceVideo.trim())
      return fail("Main source video is required.");
    if (!frames || frames.length < 1) return fail("Add at least one frame.");
    for (const [i, f] of frames.entries()) {
      if (!f || typeof f.sourceVideo !== "string" || !f.sourceVideo.trim())
        return fail(`Frame ${i + 1} requires a source video.`);
      if (!f.placeholderConfig || typeof f.placeholderConfig !== "object")
        return fail(`Frame ${i + 1} has invalid text configuration.`);
    }
    const exists = await prisma.template.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!exists) return fail("Template not found.", 404);

    const updated = await prisma.$transaction(async (tx) => {
      await tx.templateFrame.deleteMany({ where: { templateId: id } });
      const template = await tx.template.update({
        where: { id },
        data: {
          title,
          description:
            typeof body.description === "string" && body.description.trim()
              ? body.description.trim()
              : null,
          thumbnail: body.thumbnail.trim(),
          previewVideo:
            typeof body.previewVideo === "string" && body.previewVideo.trim()
              ? body.previewVideo.trim()
              : null,
          sourceVideo: body.sourceVideo.trim(),
          price: new Prisma.Decimal(price.toFixed(2)),
          durationSeconds,
          active: body.active !== false,
          frames: {
            create: frames.map((f: any, i: number) => ({
              frameNumber: i + 1,
              title:
                typeof f.title === "string" && f.title.trim()
                  ? f.title.trim()
                  : `Frame ${i + 1}`,
              sourceVideo: f.sourceVideo.trim(),
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
        },
      });
      return template;
    });
    return NextResponse.json({
      status: "success",
      data: serializeTemplate(updated),
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
      data: serializeTemplate(deleted),
    });
  } catch (e) {
    console.error("DELETE /api/templates/[id] failed", e);
    return fail("Unable to delete template.", 500);
  }
}
