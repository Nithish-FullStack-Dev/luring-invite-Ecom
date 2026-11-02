// app\api\payments\webhook\route.ts
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/payments/razorpay";

type RazorpayPaymentEntity = {
  id?: string;
  order_id?: string;
  amount?: number;
  currency?: string;
  status?: string;
  method?: string;
  error_description?: string;
  error_reason?: string;
};

type RazorpayRefundEntity = {
  id?: string;
  payment_id?: string;
  status?: string;
};

type RazorpayWebhookBody = {
  event?: string;
  payload?: {
    payment?: { entity?: RazorpayPaymentEntity };
    refund?: { entity?: RazorpayRefundEntity };
  };
};

async function findAttempt(
  transaction: Prisma.TransactionClient,
  orderId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
) {
  return (
    (await transaction.payment.findFirst({
      where: { orderId, razorpayOrderId, razorpayPaymentId },
    })) ??
    (await transaction.payment.findFirst({
      where: {
        orderId,
        razorpayOrderId,
        razorpayPaymentId: null,
        status: "PENDING",
      },
      orderBy: { createdAt: "asc" },
    }))
  );
}

export async function POST(request: NextRequest) {
  const raw = await request.text();
  const signature = request.headers.get("x-razorpay-signature") || "";
  if (!verifyWebhookSignature(raw, signature))
    return NextResponse.json(
      { message: "Invalid webhook signature." },
      { status: 400 },
    );

  try {
    const body = JSON.parse(raw) as RazorpayWebhookBody;
    const entity = body.payload?.payment?.entity;
    const refund = body.payload?.refund?.entity;
    const eventId =
      request.headers.get("x-razorpay-event-id") ||
      `${body.event}:${entity?.id || refund?.id || "unknown"}`;
    const refundedPayment = refund?.payment_id
      ? await prisma.payment.findUnique({
          where: { razorpayPaymentId: refund.payment_id },
          select: { orderId: true },
        })
      : null;
    const order = refundedPayment
      ? await prisma.order.findUnique({
          where: { id: refundedPayment.orderId },
          include: { items: true },
        })
      : entity?.order_id
        ? await prisma.order.findUnique({
            where: { razorpayOrderId: entity.order_id },
            include: { items: true },
          })
        : null;

    await prisma.$transaction(async (tx) => {
      const existing = await tx.paymentWebhook.findUnique({
        where: { eventId },
      });
      if (existing) return;
      await tx.paymentWebhook.create({
        data: {
          eventId,
          eventType: body.event || "unknown",
          orderId: order?.id,
          payload: body as Prisma.InputJsonValue,
        },
      });
      if (
        !order ||
        body.event !== "payment.captured" ||
        entity?.status !== "captured" ||
        entity.amount !== Math.round(Number(order.total) * 100) ||
        entity.currency !== order.currency ||
        !entity.id
      )
        return;
      const now = new Date();
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: "CONFIRMED",
          paymentStatus: "PAID",
          razorpayPaymentId: entity.id,
          paidAt: now,
        },
      });
      await tx.payment.update({
        where: { razorpayOrderId: order.razorpayOrderId! },
        data: {
          status: "PAID",
          razorpayPaymentId: entity.id,
          signatureVerified: true,
          method: entity.method || null,
          providerPayload: body as Prisma.InputJsonValue,
          paidAt: now,
        },
      });
      await tx.checkoutSession.updateMany({
        where: {
          orderId: order.id,
          status: {
            in: ["STARTED", "PENDING"],
          },
        },
        data: {
          status: "COMPLETED",
          lastActivityAt: now,
        },
      });
      for (const item of order.items)
        if (item.videoJobId)
          await tx.videoPurchase.upsert({
            where: {
              orderId_videoJobId: {
                orderId: order.id,
                videoJobId: item.videoJobId,
              },
            },
            update: {},
            create: { orderId: order.id, videoJobId: item.videoJobId },
          });
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Razorpay webhook failed:", error);
    return NextResponse.json(
      { message: "Webhook processing failed." },
      { status: 500 },
    );
  }
}
