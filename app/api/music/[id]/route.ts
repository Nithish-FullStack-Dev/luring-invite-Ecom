import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { templateAdminFailure } from "@/lib/template-api-auth";

type Ctx = { params: Promise<{ id: string }> };

const fail = (message: string, status = 400) =>
  NextResponse.json({ status: "error", message }, { status });

export async function PATCH(request: NextRequest, ctx: Ctx) {
  const authFailure = await templateAdminFailure(true);
  if (authFailure) return authFailure;
  const id = (await ctx.params).id;

  if (!id || id.length > 64)
    return fail("Invalid music track ID.");
  try {
    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const path = typeof body.path === "string" ? body.path.trim() : "";
    const duration =
      body.duration == null || body.duration === ""
        ? null
        : Number(body.duration);
    if (!title) return fail("Track title is required.");
    if (!path) return fail("Track file is required.");
    if (duration !== null && (!Number.isFinite(duration) || duration < 0))
      return fail("Duration must be zero or greater.");
    const track = await prisma.musicTrack.update({
      where: { id },
      data: { title, path, duration, enabled: body.enabled !== false },
    });
    return NextResponse.json({
      status: "success",
      data: {
        id: track.id,
        title: track.title,
        path: track.path,
        duration: track.duration,
        enabled: track.enabled,
      },
    });
  } catch (e) {
    console.error("PATCH /api/music/[id] failed", e);
    return fail("Unable to update music track.", 500);
  }
}
