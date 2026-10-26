"use client";

import {
  X,
  LockKeyhole,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Film,
} from "lucide-react";

type CheckoutDialogProps = {
  open: boolean;
  title: string;
  price: number;
  onClose: () => void;
  onPaymentSuccess: () => void;
};

export default function CheckoutDialog({
  open,
  title,
  price,
  onClose,
  onPaymentSuccess,
}: CheckoutDialogProps) {
  if (!open) return null;

  const formattedPrice = Number(price).toLocaleString("en-IN");

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-heading"
        className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
      >
        <div className="bg-gradient-to-r from-[#a86dcd] to-[#8147a8] p-6 text-white sm:p-8">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close checkout"
            className="absolute right-4 top-4 rounded-full p-2 text-white/80 hover:bg-white/15 hover:text-white"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
              <LockKeyhole size={24} />
            </div>

            <div>
              <h2 id="checkout-heading" className="text-2xl font-bold">
                Secure Checkout
              </h2>
              <p className="mt-1 text-sm text-white/80">
                Your invitation is ready to download.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 p-5 sm:p-8">
          <div>
            <h3 className="font-semibold text-gray-900">Order summary</h3>

            <div className="mt-3 flex items-center gap-4 rounded-2xl border border-gray-200 p-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-[#985cc0]">
                <Film size={27} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900">{title}</p>
                <p className="mt-1 text-sm text-gray-500">
                  Personalized MP4 invitation
                </p>
                <p className="mt-2 flex items-center gap-1 text-xs text-green-700">
                  <CheckCircle2 size={14} />
                  Video generated
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 border-t border-gray-100 pt-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Invitation video</span>
              <span>₹{formattedPrice}</span>
            </div>

            <div className="flex justify-between text-sm text-gray-600">
              <span>Personalization</span>
              <span className="text-green-700">Included</span>
            </div>

            <div className="flex justify-between border-t border-dashed border-gray-200 pt-4 text-lg font-bold text-gray-900">
              <span>Total</span>
              <span className="text-[#985cc0]">₹{formattedPrice}</span>
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-semibold text-gray-900">Payment method</h3>

            <div className="flex items-center gap-3 rounded-2xl border-2 border-[#a86dcd] bg-purple-50/50 p-4">
              <CreditCard size={24} className="text-[#985cc0]" />

              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  Online payment
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  UPI, debit/credit cards and net banking
                </p>
              </div>

              <CheckCircle2 size={20} className="text-[#985cc0]" />
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
            Demo mode: no real payment is collected. The button below simulates
            a successful payment for UI testing.
          </div>

          <button
            type="button"
            onClick={onPaymentSuccess}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#985cc0] px-5 py-4 font-semibold text-white shadow-lg shadow-purple-200 transition hover:bg-[#8147a8]"
          >
            <LockKeyhole size={18} />
            Pay ₹{formattedPrice}
          </button>

          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <ShieldCheck size={16} className="text-green-600" />
            Secure checkout experience
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl px-4 py-2 text-sm text-gray-500 hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
