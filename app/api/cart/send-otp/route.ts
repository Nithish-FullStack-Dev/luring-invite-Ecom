// app\api\cart\send-otp\route.ts

import { hashOtp } from "@/lib/cart/email-otp";
import { prisma } from "@/lib/prisma";
import { randomInt } from "node:crypto";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const OTP_EXPIRY_MINUTES = 5;
const MAX_REQUESTS = 5;
const RATE_WINDOW_MINUTES = 15;
const RESEND_COOLDOWN_SECONDS = 30;

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: Number(process.env.SMTP_PORT || 587) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    const email =
      typeof body === "object" && body !== null && typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { message: "Enter a valid email address." },
        { status: 400 },
      );
    }

    const now = new Date();

    const windowStart = new Date(
      now.getTime() - RATE_WINDOW_MINUTES * 60 * 1000,
    );

    const recentRequests = await prisma.emailOtp.count({
      where: {
        email,
        createdAt: {
          gte: windowStart,
        },
      },
    });

    if (recentRequests >= MAX_REQUESTS) {
      return NextResponse.json(
        { message: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }

    const mostRecent = await prisma.emailOtp.findFirst({
      where: { email },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });

    if (
      mostRecent &&
      now.getTime() - mostRecent.createdAt.getTime() <
        RESEND_COOLDOWN_SECONDS * 1000
    ) {
      return NextResponse.json(
        { message: "Please wait before requesting another verification code." },
        { status: 429 },
      );
    }

    const otp = randomInt(100000, 1000000).toString();
    const otpHash = hashOtp(email, otp);
    const record = await prisma.$transaction(async (tx) => {
      await tx.emailOtp.updateMany({
        where: {
          email,
          consumedAt: null,
        },
        data: { consumedAt: now },
      });

      return tx.emailOtp.create({
        data: {
          email,
          otpHash,
          expiresAt: new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000),
        },
      });
    });

    try {
      await transport.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: "Your Luring Invite verification code",
        text: `Your verification code is ${otp}. It expires in 5 minutes. If you did not request this code, ignore this email.`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
            <h2>Luring Invite</h2>
            <p>Use this code to verify your email address:</p>
            <div style="font-size:32px;font-weight:bold;letter-spacing:8px">
              ${otp}
            </div>
            <p>This code expires in 5 minutes.</p>
            <p>If you did not request this code, you can ignore this email.</p>
          </div>
        `,
      });
    } catch (error) {
      await prisma.emailOtp.updateMany({
        where: {
          id: record.id,
          consumedAt: null,
        },
        data: {
          consumedAt: now,
        },
      });

      throw error;
    }

    return NextResponse.json(
      {
        message:
          "If the request can be processed, a verification code will be sent.",
      },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } },
    );
  } catch (error) {
    console.error("Send OTP error:", error);

    return NextResponse.json(
      { message: "Unable to send the verification code. Please try again." },
      { status: 500 },
    );
  }
}
