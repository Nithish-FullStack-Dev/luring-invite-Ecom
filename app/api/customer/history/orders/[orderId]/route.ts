import { connection, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/cart/auth";
import { getCustomerOrderWhere } from "@/lib/cart/customer-history";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ orderId: string }> };

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

    const { orderId } = await context.params;
    if (!orderId || orderId.length > 100) {
      return NextResponse.json({ message: "Invalid order ID." }, { status: 400 });
    }

    const ownershipWhere = await getCustomerOrderWhere(user);
    const order = await prisma.order.findFirst({
      where: { id: orderId, ...ownershipWhere },
      select: {
        id: true,
        orderNumber: true,
        createdAt: true,
        total: true,
        subtotal: true,
        discount: true,
        tax: true,
        currency: true,
        status: true,
        paymentStatus: true,
        paidAt: true,
        items: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            templateTitle: true,
            quantity: true,
            unitPrice: true,
            template: { select: { thumbnail: true } },
          },
        },
        payments: {
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
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
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found." }, { status: 404 });
    }

    return NextResponse.json(
      {
        ...order,
        total: Number(order.total),
        subtotal: Number(order.subtotal),
        discount: Number(order.discount),
        tax: Number(order.tax),
        items: order.items.map((item) => ({
          ...item,
          unitPrice: Number(item.unitPrice),
          thumbnail: item.template?.thumbnail ?? null,
          template: undefined,
        })),
        payments: order.payments.map((payment) => ({
          ...payment,
          amount: Number(payment.amount),
        })),
      },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } },
    );
  } catch (error) {
    console.error("GET /api/customer/history/orders/[orderId] failed:", error);
    return NextResponse.json(
      { message: "Unable to load this order." },
      { status: 500 },
    );
  }
}
