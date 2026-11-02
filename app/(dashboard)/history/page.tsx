"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  CircleDollarSign,
  CreditCard,
  History,
  PackageCheck,
  ReceiptText,
  ShoppingBag,
} from "lucide-react";

import Header from "@/component/layout/header";
import Footer from "@/component/layout/Footer";
import FloatingWhatsApp from "@/component/layout/FloatingWhatsApp";
import EmailAuthDialog from "@/component/customize/EmailAuthDialog";
import { Badge } from "@/component/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/component/ui/card";
import { Button } from "@/component/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/component/ui/dialog";
import { Skeleton } from "@/component/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/component/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/component/ui/table";
import { useCart } from "@/component/cart/CartProvider";

type Summary = {
  totalOrders: number;
  successfulPayments: number;
  totalAmountSpent: number;
  pendingPayments: number;
};

type HistoryItem = {
  id: string;
  templateTitle: string;
  quantity: number;
  unitPrice: number;
  thumbnail: string | null;
};

type HistoryPayment = {
  id: string;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  amount: number;
  currency: string;
  status: string;
  method: string | null;
  failureReason: string | null;
  paidAt: string | null;
  createdAt: string;
  order: { id: string; orderNumber: string };
};

type HistoryOrder = {
  id: string;
  orderNumber: string;
  createdAt: string;
  total: number;
  subtotal: number;
  discount: number;
  tax: number;
  currency: string;
  status: string;
  paymentStatus: string;
  paidAt: string | null;
  items: HistoryItem[];
  payments: Omit<HistoryPayment, "order">[];
};

type HistoryResponse = {
  user: { name: string | null; email: string };
  summary: Summary;
  orders: {
    items: HistoryOrder[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  payments: {
    items: HistoryPayment[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

type OrderDetails = HistoryOrder;
type PaymentDetails = HistoryPayment & {
  order: { id: string; orderNumber: string; createdAt: string };
};

class HistoryAuthRequired extends Error {}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  const body: unknown = await response.json().catch(() => null);
  if (response.status === 401) {
    throw new HistoryAuthRequired("Your session has expired. Please sign in again.");
  }
  if (!response.ok) {
    const message =
      body && typeof body === "object" && "message" in body &&
      typeof body.message === "string"
        ? body.message
        : "Unable to load your purchase history.";
    throw new Error(message);
  }
  return body as T;
}

function formatCurrency(value: number, currency = "INR") {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `₹${Number(value).toLocaleString("en-IN")}`;
  }
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

function PaymentStatusBadge({ status }: { status: string }) {
  const classes =
    status === "PAID"
      ? "border-green-200 bg-green-50 text-green-700"
      : status === "PENDING"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : status === "FAILED"
          ? "border-red-200 bg-red-50 text-red-700"
          : status === "REFUNDED"
            ? "border-slate-200 bg-slate-100 text-slate-700"
            : "border-purple-200 bg-purple-50 text-purple-700";
  return (
    <Badge variant="outline" className={classes}>
      {status}
    </Badge>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const classes =
    status === "CONFIRMED"
      ? "border-green-200 bg-green-50 text-green-700"
      : status === "CANCELLED"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-slate-200 bg-slate-100 text-slate-700";
  return (
    <Badge variant="outline" className={classes}>
      {status}
    </Badge>
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between gap-3 border-t px-4 py-3">
      <span className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          <ArrowLeft />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
        >
          Next
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
}

function EmptyHistory() {
  return (
    <div className="flex flex-col items-center px-5 py-12 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-50 text-[#9259b7]">
        <ShoppingBag className="h-7 w-7" />
      </span>
      <h3 className="mt-4 font-semibold text-slate-900">
        No purchase history yet.
      </h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Your orders and payment transactions will appear here after you make a purchase.
      </p>
      <Button asChild className="mt-5 bg-[#985cc0] hover:bg-[#824ba6]">
        <Link href="/templates">Browse templates</Link>
      </Button>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b py-3 last:border-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="break-all text-sm font-medium text-slate-900 sm:max-w-[65%] sm:text-right">
        {value || "—"}
      </dd>
    </div>
  );
}

export default function HistoryPage() {
  const { user, initialized, refreshSessionAndCart } = useCart();
  const queryClient = useQueryClient();
  const [ordersPage, setOrdersPage] = useState(1);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [loginOpen, setLoginOpen] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);

  const historyQuery = useQuery({
    queryKey: ["customer-history", user?.id, ordersPage, paymentsPage],
    enabled: initialized && Boolean(user),
    retry: false,
    queryFn: () =>
      getJson<HistoryResponse>(
        `/api/customer/history?ordersPage=${ordersPage}&paymentsPage=${paymentsPage}`,
      ),
  });

  const orderDetailsQuery = useQuery({
    queryKey: ["customer-history-order", user?.id, selectedOrderId],
    enabled: Boolean(user && selectedOrderId),
    retry: false,
    queryFn: () =>
      getJson<OrderDetails>(
        `/api/customer/history/orders/${encodeURIComponent(selectedOrderId!)}`,
      ),
  });

  const paymentDetailsQuery = useQuery({
    queryKey: ["customer-history-payment", user?.id, selectedPaymentId],
    enabled: Boolean(user && selectedPaymentId),
    retry: false,
    queryFn: () =>
      getJson<PaymentDetails>(
        `/api/customer/history/payments/${encodeURIComponent(selectedPaymentId!)}`,
      ),
  });

  const authExpired =
    historyQuery.error instanceof HistoryAuthRequired ||
    orderDetailsQuery.error instanceof HistoryAuthRequired ||
    paymentDetailsQuery.error instanceof HistoryAuthRequired;

  useEffect(() => {
    if (!authExpired || !user) return;
    void refreshSessionAndCart().catch((error: unknown) => {
      console.error("Unable to refresh customer history session:", error);
    });
  }, [authExpired, refreshSessionAndCart, user]);

  const handleAuthenticated = async () => {
    const authenticatedUser = await refreshSessionAndCart();
    if (!authenticatedUser) {
      throw new Error("Unable to validate your sign-in session. Please try again.");
    }
    await queryClient.invalidateQueries({ queryKey: ["customer-history"] });
  };

  const data = historyQuery.data;
  const showLogin = initialized && !user;

  return (
    <div className="min-h-screen bg-[#fcf9fd] text-slate-900">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-100 text-[#9259b7]">
              <History className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                My History
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                View your previous orders and payment transactions.
              </p>
            </div>
          </div>
          {user && (
            <p className="mt-4 text-sm text-slate-600">
              Signed in as{" "}
              <span className="font-semibold text-slate-900">
                {data?.user.name || user.email}
              </span>
              {data?.user.name && (
                <span className="ml-1 text-muted-foreground">
                  ({user.email})
                </span>
              )}
            </p>
          )}
        </div>

        {!initialized ? (
          <div className="space-y-5" aria-busy="true">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-28 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-80 rounded-xl" />
          </div>
        ) : showLogin ? (
          <Card className="mx-auto max-w-xl">
            <CardHeader className="items-center text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-[#9259b7]">
                <CreditCard className="h-6 w-6" />
              </span>
              <CardTitle className="text-xl">Sign in to view your history</CardTitle>
              <CardDescription>
                Verify your email to see your personal orders and payment transactions.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button
                onClick={() => setLoginOpen(true)}
                className="bg-[#985cc0] hover:bg-[#824ba6]"
              >
                Continue with email
              </Button>
            </CardContent>
          </Card>
        ) : historyQuery.isLoading ? (
          <div className="space-y-5" aria-busy="true">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-28 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-80 rounded-xl" />
          </div>
        ) : historyQuery.error ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
              <p role="alert" className="text-sm text-red-700">
                {historyQuery.error.message}
              </p>
              <Button variant="outline" onClick={() => void historyQuery.refetch()}>
                Try again
              </Button>
            </CardContent>
          </Card>
        ) : data ? (
          <>
            <section
              aria-label="Purchase summary"
              className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
            >
              <SummaryCard
                label="Total Orders"
                value={data.summary.totalOrders.toLocaleString("en-IN")}
                icon={<ShoppingBag className="h-5 w-5" />}
                tone="purple"
              />
              <SummaryCard
                label="Successful Payments"
                value={data.summary.successfulPayments.toLocaleString("en-IN")}
                icon={<PackageCheck className="h-5 w-5" />}
                tone="green"
              />
              <SummaryCard
                label="Total Amount Spent"
                value={formatCurrency(data.summary.totalAmountSpent)}
                icon={<CircleDollarSign className="h-5 w-5" />}
                tone="blue"
              />
              <SummaryCard
                label="Pending Payments"
                value={data.summary.pendingPayments.toLocaleString("en-IN")}
                icon={<ReceiptText className="h-5 w-5" />}
                tone="amber"
              />
            </section>

            <Tabs defaultValue="orders" className="space-y-4">
              <TabsList className="grid h-auto w-full max-w-md grid-cols-2 rounded-xl bg-purple-50 p-1">
                <TabsTrigger value="orders" className="rounded-lg py-2.5">
                  Order History
                </TabsTrigger>
                <TabsTrigger value="payments" className="rounded-lg py-2.5">
                  Payment History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="orders">
                <Card className="overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-lg">Your orders</CardTitle>
                    <CardDescription>
                      Orders are shown with their current database payment status.
                    </CardDescription>
                  </CardHeader>
                  {data.orders.items.length === 0 ? (
                    <CardContent className="pt-0">
                      <EmptyHistory />
                    </CardContent>
                  ) : (
                    <>
                      <div className="px-2 sm:px-6">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Order</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Templates</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Total</TableHead>
                              <TableHead />
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {data.orders.items.map((order) => (
                              <TableRow key={order.id}>
                                <TableCell className="font-medium">
                                  <span className="block max-w-36 truncate">
                                    {order.orderNumber}
                                  </span>
                                </TableCell>
                                <TableCell className="min-w-36 text-muted-foreground">
                                  {formatDate(order.createdAt)}
                                </TableCell>
                                <TableCell className="min-w-56">
                                  <div className="space-y-2">
                                    {order.items.map((item) => (
                                      <div key={item.id} className="flex items-center gap-2">
                                        {item.thumbnail ? (
                                          <img
                                            src={item.thumbnail}
                                            alt=""
                                            className="h-10 w-9 rounded object-cover"
                                          />
                                        ) : (
                                          <span className="flex h-10 w-9 items-center justify-center rounded bg-purple-50 text-[#9259b7]">
                                            <ShoppingBag className="h-4 w-4" />
                                          </span>
                                        )}
                                        <span className="min-w-0">
                                          <span className="block max-w-48 truncate text-sm font-medium">
                                            {item.templateTitle}
                                          </span>
                                          <span className="block text-xs text-muted-foreground">
                                            Qty {item.quantity} · {formatCurrency(item.unitPrice, order.currency)} each
                                          </span>
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col items-start gap-1.5">
                                    <OrderStatusBadge status={order.status} />
                                    <PaymentStatusBadge status={order.paymentStatus} />
                                    {order.paidAt && (
                                      <span className="text-xs text-muted-foreground">
                                        Paid {formatDate(order.paidAt)}
                                      </span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right font-semibold">
                                  {formatCurrency(order.total, order.currency)}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedOrderId(order.id)}
                                  >
                                    View
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      <Pagination
                        page={data.orders.page}
                        totalPages={data.orders.totalPages}
                        onChange={setOrdersPage}
                      />
                    </>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="payments">
                <Card className="overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-lg">Payment transactions</CardTitle>
                    <CardDescription>
                      Each recorded payment attempt appears separately.
                    </CardDescription>
                  </CardHeader>
                  {data.payments.items.length === 0 ? (
                    <CardContent className="pt-0">
                      <EmptyHistory />
                    </CardContent>
                  ) : (
                    <>
                      <div className="px-2 sm:px-6">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Transaction</TableHead>
                              <TableHead>Order</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Method</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Amount</TableHead>
                              <TableHead />
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {data.payments.items.map((payment) => (
                              <TableRow key={payment.id}>
                                <TableCell>
                                  <span className="block max-w-40 truncate font-medium">
                                    {payment.razorpayPaymentId || payment.id}
                                  </span>
                                </TableCell>
                                <TableCell className="font-medium">
                                  <span className="block max-w-36 truncate">
                                    {payment.order.orderNumber}
                                  </span>
                                </TableCell>
                                <TableCell className="min-w-36 text-muted-foreground">
                                  {formatDate(payment.createdAt)}
                                </TableCell>
                                <TableCell className="capitalize">
                                  {payment.method || "—"}
                                </TableCell>
                                <TableCell>
                                  <PaymentStatusBadge status={payment.status} />
                                </TableCell>
                                <TableCell className="text-right font-semibold">
                                  {formatCurrency(payment.amount, payment.currency)}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedPaymentId(payment.id)}
                                  >
                                    View
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      <Pagination
                        page={data.payments.page}
                        totalPages={data.payments.totalPages}
                        onChange={setPaymentsPage}
                      />
                    </>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : null}
      </main>
      <Footer />
      <FloatingWhatsApp />

      <EmailAuthDialog
        open={showLogin && loginOpen}
        templateTitle="your order history"
        purpose="history"
        onClose={() => setLoginOpen(false)}
        onAuthenticated={handleAuthenticated}
      />

      <Dialog
        open={Boolean(selectedOrderId)}
        onOpenChange={(open) => {
          if (!open) setSelectedOrderId(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order details</DialogTitle>
            <DialogDescription>
              Items and verified payment attempts associated with this order.
            </DialogDescription>
          </DialogHeader>
          {orderDetailsQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : orderDetailsQuery.error ? (
            <p role="alert" className="text-sm text-red-700">
              {orderDetailsQuery.error.message}
            </p>
          ) : orderDetailsQuery.data ? (
            <OrderDetailsContent order={orderDetailsQuery.data} />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(selectedPaymentId)}
        onOpenChange={(open) => {
          if (!open) setSelectedPaymentId(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Payment details</DialogTitle>
            <DialogDescription>
              Transaction details recorded for your account.
            </DialogDescription>
          </DialogHeader>
          {paymentDetailsQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : paymentDetailsQuery.error ? (
            <p role="alert" className="text-sm text-red-700">
              {paymentDetailsQuery.error.message}
            </p>
          ) : paymentDetailsQuery.data ? (
            <PaymentDetailsContent payment={paymentDetailsQuery.data} />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  tone: "purple" | "green" | "blue" | "amber";
}) {
  const iconClasses = {
    purple: "bg-purple-50 text-purple-700",
    green: "bg-green-50 text-green-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
  };
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3 p-5">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 truncate text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClasses[tone]}`}>
          {icon}
        </span>
      </CardContent>
    </Card>
  );
}

function OrderDetailsContent({ order }: { order: OrderDetails }) {
  return (
    <div className="space-y-5">
      <dl className="grid gap-x-6 sm:grid-cols-2">
        <DetailRow label="Order number" value={order.orderNumber} />
        <DetailRow label="Order date" value={formatDate(order.createdAt)} />
        <DetailRow label="Order status" value={<OrderStatusBadge status={order.status} />} />
        <DetailRow label="Payment status" value={<PaymentStatusBadge status={order.paymentStatus} />} />
        <DetailRow label="Order total" value={formatCurrency(order.total, order.currency)} />
        <DetailRow label="Payment date" value={formatDate(order.paidAt)} />
      </dl>
      <section>
        <h3 className="mb-2 font-semibold">Purchased templates</h3>
        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
              <div className="flex min-w-0 items-center gap-3">
                {item.thumbnail ? (
                  <img src={item.thumbnail} alt="" className="h-12 w-10 rounded object-cover" />
                ) : (
                  <span className="flex h-12 w-10 items-center justify-center rounded bg-purple-50 text-[#9259b7]">
                    <ShoppingBag className="h-4 w-4" />
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{item.templateTitle}</p>
                  <p className="text-xs text-muted-foreground">
                    Quantity {item.quantity} · {formatCurrency(item.unitPrice, order.currency)} each
                  </p>
                </div>
              </div>
              <p className="shrink-0 text-sm font-semibold">
                {formatCurrency(item.quantity * item.unitPrice, order.currency)}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h3 className="mb-2 font-semibold">Payment attempts</h3>
        {order.payments.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            No payment attempts recorded for this order.
          </p>
        ) : (
          <div className="space-y-2">
            {order.payments.map((payment) => (
              <div key={payment.id} className="rounded-lg border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium">
                    {payment.razorpayPaymentId || payment.id}
                  </span>
                  <PaymentStatusBadge status={payment.status} />
                </div>
                <div className="mt-2 grid gap-x-4 sm:grid-cols-2">
                  <DetailRow label="Amount" value={formatCurrency(payment.amount, payment.currency)} />
                  <DetailRow label="Method" value={payment.method} />
                  <DetailRow label="Razorpay order" value={payment.razorpayOrderId} />
                  <DetailRow label="Transaction date" value={formatDate(payment.createdAt)} />
                  <DetailRow label="Paid at" value={formatDate(payment.paidAt)} />
                  {payment.failureReason && (
                    <DetailRow label="Failure reason" value={payment.failureReason} />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function PaymentDetailsContent({ payment }: { payment: PaymentDetails }) {
  return (
    <dl>
      <DetailRow label="Payment record" value={payment.id} />
      <DetailRow label="Status" value={<PaymentStatusBadge status={payment.status} />} />
      <DetailRow label="Amount" value={formatCurrency(payment.amount, payment.currency)} />
      <DetailRow label="Currency" value={payment.currency} />
      <DetailRow label="Associated order" value={payment.order.orderNumber} />
      <DetailRow label="Transaction date" value={formatDate(payment.createdAt)} />
      <DetailRow label="Payment date" value={formatDate(payment.paidAt)} />
      <DetailRow label="Payment method" value={payment.method} />
      <DetailRow label="Razorpay Payment ID" value={payment.razorpayPaymentId} />
      <DetailRow label="Razorpay Order ID" value={payment.razorpayOrderId} />
      {payment.failureReason && (
        <DetailRow label="Failure reason" value={payment.failureReason} />
      )}
    </dl>
  );
}
