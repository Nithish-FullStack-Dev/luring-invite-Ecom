import { connection, NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/cart/auth";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 10;

function readPage(value: string | null) {
  if (value === null) return 1;
  if (!/^[1-9]\d*$/.test(value)) return null;
  const page = Number(value);
  return Number.isSafeInteger(page) ? page : null;
}

export async function GET(request: NextRequest) {
  await connection();
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { message: "Sign in to view your purchase history." },
        {
          status: 401,
          headers: { "Cache-Control": "private, no-store, max-age=0" },
        },
      );
    }

    const { searchParams } = new URL(request.url);
    const ordersPage = readPage(searchParams.get("ordersPage"));
    const paymentsPage = readPage(searchParams.get("paymentsPage"));
    if (ordersPage === null || paymentsPage === null) {
      return NextResponse.json(
        { message: "Invalid history page." },
        { status: 400 },
      );
    }

    const orderWhere = { userId: user.id };
    const paymentWhere = {
      order: { userId: user.id },
    };

    const [
      customer,
      successfulPayments,
      spentPayments,
      totalOrders,
      pendingPayments,
      ordersCount,
      orders,
      paymentsCount,
      payments,
    ] = await Promise.all([
      prisma.customer.findUnique({
        where: { userId: user.id },
        select: { fullName: true },
      }),
      prisma.payment.count({
        where: { ...paymentWhere, status: "PAID" },
      }),
      prisma.payment.aggregate({
        where: { ...paymentWhere, status: "PAID" },
        _sum: { amount: true },
      }),
      prisma.order.count({ where: orderWhere }),
      prisma.payment.count({
        where: { ...paymentWhere, status: "PENDING" },
      }),
      prisma.order.count({ where: orderWhere }),
      prisma.order.findMany({
        where: orderWhere,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (ordersPage - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
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
              failureReason: true,
              paidAt: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.payment.count({ where: paymentWhere }),
      prisma.payment.findMany({
        where: paymentWhere,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (paymentsPage - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        select: {
          id: true,
          razorpayOrderId: true,
          razorpayPaymentId: true,
          amount: true,
          currency: true,
          status: true,
          method: true,
          failureReason: true,
          paidAt: true,
          createdAt: true,
          order: { select: { id: true, orderNumber: true } },
        },
      }),
    ]);

    return NextResponse.json(
      {
        user: { name: customer?.fullName ?? user.name, email: user.email },
        summary: {
          totalOrders,
          successfulPayments,
          totalAmountSpent: Number(spentPayments._sum.amount ?? 0),
          pendingPayments,
        },
        orders: {
          items: orders.map((order) => ({
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
          })),
          page: ordersPage,
          pageSize: PAGE_SIZE,
          total: ordersCount,
          totalPages: Math.ceil(ordersCount / PAGE_SIZE),
        },
        payments: {
          items: payments.map((payment) => ({
            ...payment,
            amount: Number(payment.amount),
          })),
          page: paymentsPage,
          pageSize: PAGE_SIZE,
          total: paymentsCount,
          totalPages: Math.ceil(paymentsCount / PAGE_SIZE),
        },
      },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } },
    );
  } catch (error) {
    console.error("GET /api/customer/history failed:", error);
    return NextResponse.json(
      { message: "Unable to load your purchase history." },
      { status: 500 },
    );
  }
}
