-- Backward-compatible commerce and payment extension. Review before applying.
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'PROCESSING';
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "customerId" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "guestAccessTokenHash" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'INR';
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "subtotal" DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "discount" DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "tax" DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "razorpayOrderId" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "razorpayPaymentId" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "failureReason" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paidAt" TIMESTAMP(3);
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "videoJobId" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "customization" JSONB;

CREATE TABLE IF NOT EXISTS "Customer" (
  "id" TEXT PRIMARY KEY, "userId" TEXT UNIQUE, "fullName" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE, "primaryPhone" TEXT NOT NULL,
  "alternatePhone" TEXT, "address" TEXT NOT NULL, "city" TEXT NOT NULL,
  "state" TEXT NOT NULL, "country" TEXT NOT NULL, "postalCode" TEXT NOT NULL,
  "companyName" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS "Payment" (
  "id" TEXT PRIMARY KEY, "orderId" TEXT NOT NULL, "razorpayOrderId" TEXT NOT NULL UNIQUE,
  "razorpayPaymentId" TEXT UNIQUE, "amount" DECIMAL(10,2) NOT NULL, "currency" TEXT NOT NULL DEFAULT 'INR',
  "status" "OrderPaymentStatus" NOT NULL DEFAULT 'PENDING', "method" TEXT,
  "signatureVerified" BOOLEAN NOT NULL DEFAULT false, "failureReason" TEXT, "providerPayload" JSONB,
  "paidAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS "PaymentWebhook" (
  "id" TEXT PRIMARY KEY, "eventId" TEXT NOT NULL UNIQUE, "eventType" TEXT NOT NULL,
  "orderId" TEXT, "payload" JSONB NOT NULL, "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS "VideoPurchase" (
  "id" TEXT PRIMARY KEY, "orderId" TEXT NOT NULL, "videoJobId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("orderId", "videoJobId")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Order_razorpayOrderId_key" ON "Order"("razorpayOrderId");
CREATE UNIQUE INDEX IF NOT EXISTS "Order_razorpayPaymentId_key" ON "Order"("razorpayPaymentId");
CREATE INDEX IF NOT EXISTS "Order_customerId_createdAt_idx" ON "Order"("customerId", "createdAt");
CREATE INDEX IF NOT EXISTS "VideoPurchase_videoJobId_idx" ON "VideoPurchase"("videoJobId");
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "CartUser"("id") ON DELETE SET NULL;
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE;
ALTER TABLE "PaymentWebhook" ADD CONSTRAINT "PaymentWebhook_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL;
ALTER TABLE "VideoPurchase" ADD CONSTRAINT "VideoPurchase_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE;
ALTER TABLE "VideoPurchase" ADD CONSTRAINT "VideoPurchase_videoJobId_fkey" FOREIGN KEY ("videoJobId") REFERENCES "VideoJob"("id") ON DELETE RESTRICT;
