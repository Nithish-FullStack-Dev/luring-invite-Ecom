import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyOtpHash } from "@/lib/cart/email-otp";
import {
  hashSessionToken,
  SESSION_COOKIE,
  SESSION_DURATION_SECONDS,
} from "@/lib/cart/auth";

const GUEST_CART_COOKIE = "luring_guest_cart_id";

function normalizeGuestId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const guestId = value.trim();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    guestId,
  )
    ? guestId
    : null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    const email =
      typeof body?.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const otp = typeof body?.otp === "string" ? body.otp.trim() : "";

    if (
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !/^\d{6}$/.test(otp)
    ) {
      return NextResponse.json(
        { message: "Invalid email or verification code." },
        { status: 400 },
      );
    }

    const now = new Date();

    const record = await prisma.emailOtp.findFirst({
      where: {
        email,
        consumedAt: null,
        expiresAt: { gt: now },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!record || record.attempts >= 5) {
      return NextResponse.json(
        { message: "Invalid or expired verification code." },
        { status: 400 },
      );
    }

    if (!verifyOtpHash(email, otp, record.otpHash)) {
      await prisma.emailOtp.updateMany({
        where: {
          id: record.id,
          consumedAt: null,
          attempts: { lt: 5 },
        },
        data: {
          attempts: { increment: 1 },
        },
      });

      return NextResponse.json(
        { message: "Invalid or expired verification code." },
        { status: 400 },
      );
    }

    const sessionToken = randomBytes(32).toString("hex");
    const tokenHash = hashSessionToken(sessionToken);
    const expiresAt = new Date(now.getTime() + SESSION_DURATION_SECONDS * 1000);
    const guestCartId = normalizeGuestId(
      (await cookies()).get(GUEST_CART_COOKIE)?.value,
    );

    const user = await prisma.$transaction(async (tx) => {
      const consumed = await tx.emailOtp.updateMany({
        where: {
          id: record.id,
          consumedAt: null,
          expiresAt: { gt: now },
          attempts: { lt: 5 },
        },
        data: {
          consumedAt: now,
        },
      });

      if (consumed.count !== 1) {
        throw new Error("OTP_INVALID_OR_EXPIRED");
      }

      const verifiedUser = await tx.cartUser.upsert({
        where: { email },
        update: {},
        create: { email },
      });

      await tx.userSession.create({
        data: {
          userId: verifiedUser.id,
          tokenHash,
          expiresAt,
        },
      });

      let userCart = await tx.cart.findFirst({
        where: { userId: verifiedUser.id },
        include: { items: true },
        orderBy: { updatedAt: "desc" },
      });

      if (!userCart) {
        userCart = await tx.cart.create({
          data: { userId: verifiedUser.id },
          include: { items: true },
        });
      }

      if (guestCartId) {
        const guestCart = await tx.cart.findUnique({
          where: { guestId: guestCartId },
          include: { items: true },
        });

        if (guestCart) {
          for (const guestItem of guestCart.items) {
            await tx.cartItem.upsert({
              where: {
                cartId_templateId: {
                  cartId: userCart.id,
                  templateId: guestItem.templateId,
                },
              },
              update: {
                quantity: 1,
                unitPrice: guestItem.unitPrice,
              },
              create: {
                cartId: userCart.id,
                templateId: guestItem.templateId,
                quantity: 1,
                unitPrice: guestItem.unitPrice,
              },
            });
          }

        }
      }

      return verifiedUser;
    });

    const response = NextResponse.json(
      {
        message: "Email verified successfully.",
        user: {
          id: user.id,
          email: user.email,
        },
      },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } },
    );

    response.cookies.set(SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DURATION_SECONDS,
      expires: expiresAt,
    });

    return response;
  } catch (error) {
    if (error instanceof Error && error.message === "OTP_INVALID_OR_EXPIRED") {
      return NextResponse.json(
        { message: "Invalid or expired verification code." },
        { status: 400 },
      );
    }

    console.error("Verify OTP error:", error);

    return NextResponse.json(
      { message: "Unable to verify the code. Please try again." },
      { status: 500 },
    );
  }
}
