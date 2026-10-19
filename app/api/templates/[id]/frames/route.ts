import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeFrame } from "@/lib/serializers";
import { serializeCustomerTextConfig } from "@/lib/serializers";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  const { id: rawId } = await context.params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ status: "error", message: "Invalid template ID." }, { status: 400 });
  }

  try {
    const template = await prisma.template.findUnique({
      where: { id },
      include: { frames: { orderBy: { frameNumber: "asc" } } },
    });
    if (!template || !template.active) {
      return NextResponse.json({ status: "error", message: "Template not found." }, { status: 404 });
    }

    let frames = template.frames.map((frame) => serializeFrame(frame));

    // Compatibility fallback for legacy templates that only have placeholderConfig on Template.
    if (frames.length === 0 && template.legacyPlaceholderConfig) {
      frames = [{
        id: -template.id,
        templateId: template.id,
        frameNumber: 1,
        title: "Customize invitation",
        sourceVideo: template.sourceVideo,
        previewImage: template.thumbnail,
        placeholderConfig: serializeCustomerTextConfig(template.legacyPlaceholderConfig),
        durationSeconds: template.durationSeconds || null,
      }];
    }

    return NextResponse.json({ status: "success", frames });
  } catch (error) {
    console.error(`GET /api/templates/${id}/frames failed:`, error);
    return NextResponse.json({ status: "error", message: "Unable to load template frames." }, { status: 500 });
  }
}
