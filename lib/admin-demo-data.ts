export type PaymentStatus = "PAID" | "PENDING" | "NOT_PAID";
export type VideoStatus = "COMPLETED" | "PROCESSING" | "PENDING" | "FAILED";
export type ActivityStatus =
  | "PURCHASED"
  | "ABANDONED_CART"
  | "CHECKOUT_STARTED"
  | "CHECKOUT_PENDING";

export interface CommerceRecord {
  id: string;
  email: string;
  template: string;
  createdAt: string;
  lastActivityAt: string;
  amount: number;
  itemCount: number;
  status: ActivityStatus;
  paymentStatus: PaymentStatus;
  videoStatus: VideoStatus;
  videoUrl?: string;
}

export const commerceDemoRecords: CommerceRecord[] = [
  {
    id: "ORD-1033",
    email: "ananya@example.com",
    template: "Engagement Invitation",
    createdAt: "2026-10-28T10:30:00+05:30",
    lastActivityAt: "2026-10-28T10:35:00+05:30",
    amount: 399,
    itemCount: 1,
    status: "PURCHASED",
    paymentStatus: "PAID",
    videoStatus: "COMPLETED",
    videoUrl: undefined,
  },
  {
    id: "ORD-1030",
    email: "vikram@example.com",
    template: "Housewarming Invitation",
    createdAt: "2026-10-27T14:10:00+05:30",
    lastActivityAt: "2026-10-27T14:20:00+05:30",
    amount: 349,
    itemCount: 1,
    status: "PURCHASED",
    paymentStatus: "PAID",
    videoStatus: "PROCESSING",
  },
  {
    id: "ORD-1029",
    email: "arjun@example.com",
    template: "Wedding Invitation",
    createdAt: "2026-10-26T15:00:00+05:30",
    lastActivityAt: "2026-10-26T15:15:00+05:30",
    amount: 299,
    itemCount: 1,
    status: "PURCHASED",
    paymentStatus: "PAID",
    videoStatus: "FAILED",
  },
  {
    id: "CRT-3012",
    email: "priya@example.com",
    template: "Wedding Invitation",
    createdAt: "2026-10-28T09:15:00+05:30",
    lastActivityAt: "2026-10-28T09:45:00+05:30",
    amount: 299,
    itemCount: 1,
    status: "ABANDONED_CART",
    paymentStatus: "NOT_PAID",
    videoStatus: "PENDING",
  },
  {
    id: "CRT-3011",
    email: "kavya@example.com",
    template: "Birthday Celebration",
    createdAt: "2026-10-27T10:30:00+05:30",
    lastActivityAt: "2026-10-27T11:00:00+05:30",
    amount: 199,
    itemCount: 1,
    status: "ABANDONED_CART",
    paymentStatus: "NOT_PAID",
    videoStatus: "PENDING",
  },
  {
    id: "CHK-2048",
    email: "rahul@example.com",
    template: "Birthday Celebration",
    createdAt: "2026-10-28T10:15:00+05:30",
    lastActivityAt: "2026-10-28T10:20:00+05:30",
    amount: 199,
    itemCount: 1,
    status: "CHECKOUT_STARTED",
    paymentStatus: "PENDING",
    videoStatus: "PENDING",
  },
  {
    id: "CHK-2047",
    email: "sneha@example.com",
    template: "Anniversary Wishes",
    createdAt: "2026-10-27T16:30:00+05:30",
    lastActivityAt: "2026-10-27T16:35:00+05:30",
    amount: 249,
    itemCount: 1,
    status: "CHECKOUT_PENDING",
    paymentStatus: "PENDING",
    videoStatus: "PENDING",
  },
  {
    id: "CHK-2046",
    email: "meera@example.com",
    template: "Engagement Invitation",
    createdAt: "2026-10-26T12:30:00+05:30",
    lastActivityAt: "2026-10-26T12:35:00+05:30",
    amount: 399,
    itemCount: 1,
    status: "CHECKOUT_STARTED",
    paymentStatus: "PENDING",
    videoStatus: "PENDING",
  },
];

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
