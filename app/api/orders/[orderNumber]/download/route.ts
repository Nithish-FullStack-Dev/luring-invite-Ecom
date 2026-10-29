import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/cart/auth";
import { hashAccessToken } from "@/lib/payments/razorpay";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  const { orderNumber } = await params;
  const user = await getCurrentUser();
  const token = request.cookies.get("luring_purchase_access")?.value;
  const order = await prisma.order.findFirst({
    where: {
      orderNumber,
      paymentStatus: "PAID",
      status: "CONFIRMED",
      OR: [
        { userId: user?.id || "__none__" },
        ...(token ? [{ guestAccessTokenHash: hashAccessToken(token) }] : []),
      ],
    },
    include: { items: { where: { videoJobId: { not: null } }, take: 1 } },
  });
  const videoJobId = order?.items[0]?.videoJobId;
  if (!videoJobId) return NextResponse.json({ message: "No authorized video was found for this order." }, { status: 404 });
  return NextResponse.redirect(new URL(`/api/downloads/${encodeURIComponent(videoJobId)}`, request.url));
}
