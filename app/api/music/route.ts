import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeMusic } from "@/lib/serializers";

export async function GET() {
  try {
    const tracks = await prisma.musicTrack.findMany({
      where: { enabled: true },
      orderBy: { title: "asc" },
    });
    return NextResponse.json({
      status: "success",
      data: tracks.map(serializeMusic),
    });
  } catch (error) {
    console.error("GET /api/music failed:", error);
    return NextResponse.json(
      { status: "error", message: "Unable to load music tracks." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const path = typeof body.path === "string" ? body.path.trim() : "";
    const duration =
      body.duration == null || body.duration === ""
        ? null
        : Number(body.duration);

    if (!title) {
      return NextResponse.json(
        { status: "error", message: "Track title is required." },
        { status: 400 },
      );
    }
    if (!path) {
      return NextResponse.json(
        { status: "error", message: "Upload an audio file first." },
        { status: 400 },
      );
    }
    if (duration !== null && (!Number.isFinite(duration) || duration < 0)) {
      return NextResponse.json(
        { status: "error", message: "Duration must be zero or greater." },
        { status: 400 },
      );
    }

    const track = await prisma.musicTrack.create({
      data: { title, path, duration, enabled: true },
    });

    return NextResponse.json(
      { status: "success", data: serializeMusic(track) },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/music failed:", error);
    return NextResponse.json(
      { status: "error", message: "Unable to create music track." },
      { status: 500 },
    );
  }
}
