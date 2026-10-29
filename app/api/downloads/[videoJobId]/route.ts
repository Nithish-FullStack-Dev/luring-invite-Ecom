import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/cart/auth";
import { hashAccessToken } from "@/lib/payments/razorpay";

export async function GET(request: NextRequest, { params }: { params: Promise<{ videoJobId: string }> }) {
  const { videoJobId } = await params;
  const user = await getCurrentUser();
  const token = request.cookies.get("luring_purchase_access")?.value;
  const purchase = await prisma.videoPurchase.findFirst({ where: { videoJobId, order: { paymentStatus: "PAID", status: "CONFIRMED", OR: [{ userId: user?.id || "__none__" }, ...(token ? [{ guestAccessTokenHash: hashAccessToken(token) }] : [])] } }, include: { videoJob: true } });
  if (!purchase) return NextResponse.json({ message: "You are not authorized to download this video." }, { status: 403 });
  if (!purchase.videoJob.outputPath) return NextResponse.json({ message: "The video is still processing." }, { status: 409 });
  const root = path.resolve(process.cwd(), "public", "media", "generated");
  const file = path.resolve(process.cwd(), "public", purchase.videoJob.outputPath);
  if (!file.startsWith(root + path.sep)) return NextResponse.json({ message: "Video file is unavailable." }, { status: 404 });
  try { const data = await fs.readFile(file); return new NextResponse(data, { headers: { "Content-Type": "video/mp4", "Content-Disposition": `attachment; filename="luring-invitation-${videoJobId}.mp4"`, "Cache-Control": "private, no-store" } }); } catch { return NextResponse.json({ message: "Video file is unavailable." }, { status: 404 }); }
}
