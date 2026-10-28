"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/component/ui/dialog";

const OTP_COOLDOWN_SECONDS = 30;

type EmailAuthDialogProps = {
  open: boolean;
  templateTitle: string;
  purpose?: "add" | "save";
  onClose: () => void;
  onContinueWithoutLogin?: () => void | Promise<void>;
  onAuthenticated: () => void | Promise<void>;
};

export default function EmailAuthDialog({
  open,
  templateTitle,
  purpose = "add",
  onClose,
  onContinueWithoutLogin,
  onAuthenticated,
}: EmailAuthDialogProps) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);

  const reset = () => {
    setEmail("");
    setOtp("");
    setOtpSent(false);
    setError("");
    setMessage("");
    setShowEmailForm(false);
    setCooldown(0);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = window.setTimeout(() => {
      setCooldown((value) => Math.max(0, value - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const handleSendOtp = async (resend = false) => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    setIsSending(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/cart/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || "Unable to send verification code.");
      }

      setOtpSent(true);
      setShowEmailForm(true);
      setMessage(
        resend
          ? "A new verification code has been sent."
          : "A verification code has been sent to your email.",
      );
      setCooldown(OTP_COOLDOWN_SECONDS);
      setOtp("");
    } catch (sendError) {
      setError(
        sendError instanceof Error
          ? sendError.message
          : "Unable to send verification code.",
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit verification code.");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const response = await fetch("/api/cart/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, otp }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || "Unable to verify the code.");
      }

      try {
        await onAuthenticated();
      } catch (syncError) {
        setError(
          syncError instanceof Error
            ? `Email verified, but cart refresh failed: ${syncError.message}`
            : "Email verified, but your cart could not be refreshed.",
        );
        return;
      }

      handleClose();
    } catch (verifyError) {
      setError(
        verifyError instanceof Error
          ? verifyError.message
          : "Unable to verify the code.",
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleContinueWithoutLogin = async () => {
    setError("");
    setMessage("");
    setIsContinuing(true);
    try {
      await onContinueWithoutLogin?.();
      handleClose();
    } catch (continueError) {
      setError(
        continueError instanceof Error
          ? continueError.message
          : "Unable to continue without signing in.",
      );
    } finally {
      setIsContinuing(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-[#9259b7]">
            <Sparkles className="h-6 w-6" />
          </div>
          <DialogTitle className="text-2xl font-semibold text-[#302438]">
            {purpose === "add" ? `Add ${templateTitle} to your cart` : "Save your cart"}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            {purpose === "add"
              ? "Save this template to your cart and continue with your preferred flow."
              : "Verify your email to keep this cart associated with your account."}
          </DialogDescription>
        </DialogHeader>

        {!showEmailForm ? (
          <div className="space-y-4 pt-2">
            <button
              type="button"
              onClick={() => setShowEmailForm(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#a86dcd] px-4 py-3 font-semibold text-white transition hover:bg-[#9259b7]"
            >
              <Mail className="h-4 w-4" />
              Continue with email
            </button>

            {purpose === "add" ? (
              <button
                type="button"
                onClick={() => void handleContinueWithoutLogin()}
                disabled={isContinuing}
                className="flex w-full items-center justify-center rounded-xl border border-[#dcc4ee] bg-white px-4 py-3 font-semibold text-[#5f4376] transition hover:bg-[#faf5ff] disabled:opacity-60"
              >
                Continue without login
              </button>
            ) : (
              <button
                type="button"
                onClick={handleClose}
                className="w-full rounded-xl border border-[#dcc4ee] bg-white px-4 py-3 font-semibold text-[#5f4376] transition hover:bg-[#faf5ff]"
              >
                Cancel
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="rounded-2xl border border-purple-100 bg-purple-50/60 p-3 text-sm text-[#593c6a]">
              <div className="flex items-center gap-2 font-medium">
                <ShieldCheck className="h-4 w-4 text-[#9259b7]" />
                Secure email verification
              </div>
            </div>

            <label className="block space-y-2 text-sm font-medium text-[#3f2c4d]">
              <span>Email address</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#a86dcd] focus:ring-2 focus:ring-purple-100"
              />
            </label>

            {!otpSent ? (
              <button
                type="button"
                onClick={() => void handleSendOtp(false)}
                disabled={isSending}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#a86dcd] px-4 py-3 font-semibold text-white transition hover:bg-[#9259b7] disabled:cursor-not-allowed disabled:opacity-80"
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send OTP"
                )}
              </button>
            ) : (
              <>
                <label className="block space-y-2 text-sm font-medium text-[#3f2c4d]">
                  <span>Verification code</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={otp}
                    onChange={(event) =>
                      setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="123456"
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#a86dcd] focus:ring-2 focus:ring-purple-100"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => void handleVerifyOtp()}
                  disabled={isVerifying}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#a86dcd] px-4 py-3 font-semibold text-white transition hover:bg-[#9259b7] disabled:cursor-not-allowed disabled:opacity-80"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Email"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => void handleSendOtp(true)}
                  disabled={cooldown > 0 || isSending}
                  className="w-full rounded-xl border border-[#d9bfec] bg-white px-4 py-2.5 text-sm font-medium text-[#5f4376] transition hover:bg-[#faf5ff] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
                </button>
              </>
            )}

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {message ? (
              <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                <CheckCircle2 className="h-4 w-4" />
                {message}
              </div>
            ) : null}

            <button
              type="button"
              onClick={
                purpose === "add"
                  ? () => void handleContinueWithoutLogin()
                  : handleClose
              }
              disabled={isContinuing}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
            >
              {purpose === "add" ? "Continue without login" : "Cancel"}
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
