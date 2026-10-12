import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeTemplate } from "@/lib/serializers";

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
      include: {
        categories: { include: { category: true } },
        frames: { orderBy: { frameNumber: "asc" } },
      },
    });
    if (!template || !template.active) {
      return NextResponse.json({ status: "error", message: "Template not found." }, { status: 404 });
    }
    return NextResponse.json({ status: "success", data: serializeTemplate(template) });
  } catch (error) {
    console.error(`GET /api/templates/${id} failed:`, error);
    return NextResponse.json({ status: "error", message: "Unable to load this template." }, { status: 500 });
  }
}
