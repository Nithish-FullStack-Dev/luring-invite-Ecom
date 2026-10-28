import { createHmac, timingSafeEqual } from "crypto";

function getOtpSecret() {
  const secret = process.env.OTP_SECRET;

  if (!secret || Buffer.byteLength(secret) < 32) {
    throw new Error("OTP_SECRET must contain at least 32 bytes.");
  }

  return secret;
}

export function hashOtp(email: string, otp: string) {
  return createHmac("sha256", getOtpSecret())
    .update(`${email}:${otp}`)
    .digest("hex");
}

export function verifyOtpHash(email: string, otp: string, storedHash: string) {
  const suppliedHash = Buffer.from(hashOtp(email, otp), "hex");
  const expectedHash = Buffer.from(storedHash, "hex");

  return (
    suppliedHash.length === expectedHash.length &&
    timingSafeEqual(suppliedHash, expectedHash)
  );
}
