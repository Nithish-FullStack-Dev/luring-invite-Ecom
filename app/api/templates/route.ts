import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeTemplate } from "@/lib/serializers";

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
          ? { OR: [
              { title: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ] }
          : {}),
      },
      include: {
        categories: { include: { category: true } },
        frames: { orderBy: { frameNumber: "asc" } },
      },
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    });

    return NextResponse.json({ status: "success", data: templates.map(serializeTemplate) });
  } catch (error) {
    console.error("GET /api/templates failed:", error);
    return NextResponse.json({ status: "error", message: "Unable to fetch templates. Ensure the database is migrated and seeded." }, { status: 500 });
  }
}
