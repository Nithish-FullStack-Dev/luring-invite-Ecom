DROP INDEX "Payment_razorpayOrderId_key";

CREATE INDEX "Payment_razorpayOrderId_idx" ON "Payment"("razorpayOrderId");
