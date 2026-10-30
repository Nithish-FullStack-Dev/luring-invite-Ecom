import { NextRequest, NextResponse } from "next/server";
import { createReadStream } from "node:fs";
import path from "node:path";
import fs from "node:fs/promises";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/cart/auth";
import { hashAccessToken } from "@/lib/payments/razorpay";
import { renderPaidVideo } from "@/lib/video-purchase";

export const maxDuration = 300;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ videoJobId: string }> },
) {
  const { videoJobId } = await params;
  const user = await getCurrentUser();
  const token = request.cookies.get("luring_purchase_access")?.value;
  const purchase = await prisma.videoPurchase.findFirst({
    where: {
      videoJobId,
      order: {
        paymentStatus: "PAID",
        status: "CONFIRMED",
        OR: [
          { userId: user?.id || "__none__" },
          ...(token
            ? [{ guestAccessTokenHash: hashAccessToken(token) }]
            : []),
        ],
      },
    },
  });
  if (!purchase) {
    return NextResponse.json(
      { message: "You are not authorized to download this video." },
      { status: 403 },
    );
  }

  try {
    const finalPath = await renderPaidVideo(videoJobId);
    const root = path.resolve(process.cwd(), "storage", "generated");
    const file = path.resolve(process.cwd(), finalPath);
    const relativeToRoot = path.relative(root, file);
    if (
      !relativeToRoot ||
      relativeToRoot === ".." ||
      relativeToRoot.startsWith(`..${path.sep}`) ||
      path.isAbsolute(relativeToRoot)
    ) {
      console.error("Paid video was not stored in private generated-video storage.");
      return NextResponse.json(
        { message: "The clean video could not be prepared securely." },
        { status: 500 },
      );
    }

    const fileInfo = await fs.stat(file);
    if (!fileInfo.isFile()) {
      return NextResponse.json(
        { message: "The clean video file is unavailable." },
        { status: 404 },
      );
    }

    const videoStream = createReadStream(file);
    const iterator = videoStream[Symbol.asyncIterator]();
    const body = new ReadableStream<Uint8Array>({
      async pull(controller) {
        try {
          const { value, done } = await iterator.next();
          if (done) controller.close();
          else controller.enqueue(value);
        } catch (error) {
          controller.error(error);
        }
      },
      cancel() {
        videoStream.destroy();
      },
    });

    return new NextResponse(body, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="luring-invitation-${videoJobId}.mp4"`,
        "Content-Length": String(fileInfo.size),
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Paid video download failed:", error);
    return NextResponse.json(
      { message: "Your clean video could not be prepared. Please try again shortly." },
      { status: 500 },
    );
  }
}
