import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeMusic } from "@/lib/serializers";

export async function GET() {
  try {
    const tracks = await prisma.musicTrack.findMany({
      where: { enabled: true },
      orderBy: { title: "asc" },
    });
    return NextResponse.json({ status: "success", data: tracks.map(serializeMusic) });
  } catch (error) {
    console.error("GET /api/music failed:", error);
    return NextResponse.json({ status: "error", message: "Unable to load music tracks." }, { status: 500 });
  }
}
