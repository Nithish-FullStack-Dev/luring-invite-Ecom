import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

type RazorpayOrder = { id: string; amount: number; currency: string; status: string };

function credentials() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !secret) throw new Error("Payment service is not configured.");
  return { keyId, secret };
}

export function newGuestAccessToken() { return randomBytes(32).toString("base64url"); }
export function hashAccessToken(value: string) {
  return createHmac("sha256", credentials().secret).update(value).digest("hex");
}
export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string) {
  const { secret } = credentials();
  const expected = createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  const supplied = Buffer.from(signature, "utf8");
  const expectedValue = Buffer.from(expected, "utf8");
  return supplied.length === expectedValue.length && timingSafeEqual(supplied, expectedValue);
}
export function verifyWebhookSignature(rawBody: string, signature: string) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const supplied = Buffer.from(signature, "utf8");
  const expectedValue = Buffer.from(expected, "utf8");
  return supplied.length === expectedValue.length && timingSafeEqual(supplied, expectedValue);
}
export async function createRazorpayOrder(receipt: string, amountPaise: number): Promise<RazorpayOrder> {
  const { keyId, secret } = credentials();
  const authorization = Buffer.from(`${keyId}:${secret}`).toString("base64");
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { Authorization: `Basic ${authorization}`, "Content-Type": "application/json" },
    body: JSON.stringify({ amount: amountPaise, currency: "INR", receipt, payment_capture: 1 }),
    cache: "no-store",
  });
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok || !data || typeof data !== "object" || typeof (data as { id?: unknown }).id !== "string") {
    throw new Error("Unable to create a Razorpay order.");
  }
  return data as RazorpayOrder;
}
