import { connection, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/cart/auth";
import { getCustomerOrderWhere } from "@/lib/cart/customer-history";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ paymentId: string }> };

export async function GET(_request: Request, context: Context) {
  await connection();
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { message: "Sign in to view your purchase history." },
        { status: 401 },
      );
    }

    const { paymentId } = await context.params;
    if (!paymentId || paymentId.length > 100) {
      return NextResponse.json(
        { message: "Invalid payment ID." },
        { status: 400 },
      );
    }

    const ownershipWhere = await getCustomerOrderWhere(user);
    const payment = await prisma.payment.findFirst({
      where: { id: paymentId, order: { is: ownershipWhere } },
      select: {
        id: true,
        razorpayOrderId: true,
        razorpayPaymentId: true,
        amount: true,
        currency: true,
        status: true,
        method: true,
        signatureVerified: true,
        failureReason: true,
        paidAt: true,
        createdAt: true,
        order: { select: { id: true, orderNumber: true, createdAt: true } },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { message: "Payment not found." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { ...payment, amount: Number(payment.amount) },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } },
    );
  } catch (error) {
    console.error("GET /api/customer/history/payments/[paymentId] failed:", error);
    return NextResponse.json(
      { message: "Unable to load this payment." },
      { status: 500 },
    );
  }
}
