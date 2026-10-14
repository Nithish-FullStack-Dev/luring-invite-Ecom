// app/api/customize/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type {
  Category,
  Template,
  TemplateFrame,
  MusicTrack,
} from "@prisma/client";

export function serializeCategory(category: Category) {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    parentId: category.parentId,
  };
}

export function serializeTemplate<
  T extends Template & {
    categories?: { category: Category }[];
    frames?: TemplateFrame[];
  },
>(template: T) {
  return {
    id: template.id,
    thumbnail: template.thumbnail,
    title: template.title,
    description: template.description,
    price: Number(template.price),
    frames: template.frames?.map(serializeFrame) ?? [],
    categories:
      template.categories?.map((entry) => serializeCategory(entry.category)) ??
      [],
  };
}

export function serializeFrame(frame: TemplateFrame) {
  return {
    id: frame.id,
    templateId: frame.templateId,
    frameNumber: frame.frameNumber,
    title: frame.title,
    sourceVideo: frame.sourceVideo,
    previewImage: frame.previewImage,
    placeholderConfig: frame.placeholderConfig,
    durationSeconds: frame.durationSeconds,
  };
}

export function serializeMusic(track: MusicTrack) {
  return {
    id: track.id,
    title: track.title,
    path: track.path,
    duration: track.duration,
  };
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
    console.error("GET /api/customize failed:", error);
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
