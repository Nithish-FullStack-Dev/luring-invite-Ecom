import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeTemplate } from "@/lib/serializers";
import { templateAdminFailure } from "@/lib/template-api-auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const manage = searchParams.get("manage") === "true";
    if (manage) {
      const authFailure = await templateAdminFailure();
      if (authFailure) return authFailure;
    }
    const category = searchParams.get("category");
    const search = searchParams.get("search")?.trim();
    const templates = await prisma.template.findMany({
      where: {
        ...(manage ? {} : { active: true }),
        ...(category && category !== "all"
          ? { categories: { some: { category: { slug: category } } } }
          : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" as const } },
                { description: { contains: search, mode: "insensitive" as const } },
              ],
            }
          : {}),
      },
      include: {
        categories: { include: { category: true } },
        frames: { orderBy: { frameNumber: "asc" } },
        ...(manage ? { musicTracks: true } : {}),
      },
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    });
    return NextResponse.json({
      status: "success",
      data: templates.map((template) => serializeTemplate(template, manage)),
    });
  } catch (error) {
    console.error("GET /api/customize failed:", error);
    return NextResponse.json(
      { status: "error", message: "Unable to fetch templates." },
      { status: 500 },
    );
  }
}
