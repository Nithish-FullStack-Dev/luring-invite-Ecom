"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Download,
  Loader2,
  ShieldCheck,
  Clock3,
  AlertCircle,
} from "lucide-react";

import Header from "@/component/layout/header";
import Footer from "@/component/layout/Footer";
import FloatingWhatsApp from "@/component/layout/FloatingWhatsApp";

type DownloadStatus = "idle" | "preparing" | "success" | "error";

function CheckoutSuccessContent() {
  const search = useSearchParams();

  const order = search.get("order");
  const videoJobId = search.get("videoJobId");
  const shouldAutoDownload = search.get("download") === "1";

  const downloadUrl = videoJobId
    ? `/api/downloads/${encodeURIComponent(videoJobId)}`
    : order
      ? `/api/orders/${encodeURIComponent(order)}/download`
      : null;

  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>("idle");

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const startedRef = useRef(false);
  const autoDownloadRef = useRef(false);

  // Download video and trigger browser download.
  const startDownload = useCallback(async () => {
    if (!downloadUrl || startedRef.current) return;

    startedRef.current = true;

    setDownloadStatus("preparing");
    setElapsedSeconds(0);
    setErrorMessage("");

    try {
      const response = await fetch(downloadUrl, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        let message = "Unable to prepare your video. Please try again.";

        try {
          const data = await response.json();

          if (typeof data.message === "string") {
            message = data.message;
          }
        } catch {
          // Response might not contain JSON.
        }

        throw new Error(message);
      }

      // Wait until the entire video is received.
      const blob = await response.blob();

      if (!blob.size) {
        throw new Error("The downloaded video file is empty.");
      }

      // Trigger browser download.
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = objectUrl;
      link.download = `luring-invitation-${videoJobId || order}.mp4`;
      link.style.display = "none";

      document.body.appendChild(link);
      link.click();
      link.remove();

      // Release temporary browser memory.
      window.setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
      }, 60_000);

      setDownloadStatus("success");
    } catch (error) {
      console.error("Video download failed:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while downloading your video.",
      );

      setDownloadStatus("error");
    } finally {
      startedRef.current = false;
    }
  }, [downloadUrl, videoJobId, order]);

  // Automatically download only once per order per session.
  useEffect(() => {
    if (!shouldAutoDownload || !downloadUrl || !order) return;
    if (autoDownloadRef.current) return;

    const key = `luring-video-download:${order}`;

    if (window.sessionStorage.getItem(key) === "completed") {
      return;
    }

    autoDownloadRef.current = true;
    window.sessionStorage.setItem(key, "started");

    void startDownload();
  }, [shouldAutoDownload, downloadUrl, order, startDownload]);

  // Timer runs only during active download preparation/transfer.
  useEffect(() => {
    if (downloadStatus !== "preparing") return;

    const timer = window.setInterval(() => {
      setElapsedSeconds((previous) => previous + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [downloadStatus]);

  // Save completed status for this browser session.
  useEffect(() => {
    if (downloadStatus !== "success" || !order) return;

    window.sessionStorage.setItem(
      `luring-video-download:${order}`,
      "completed",
    );
  }, [downloadStatus, order]);

  const formattedTime = `${Math.floor(elapsedSeconds / 60)
    .toString()
    .padStart(2, "0")}:${(elapsedSeconds % 60).toString().padStart(2, "0")}`;

  const statusMessage =
    elapsedSeconds < 10
      ? "Getting your personalized video ready..."
      : elapsedSeconds < 30
        ? "Preparing your high-quality video..."
        : elapsedSeconds < 60
          ? "Your video is being processed. Please wait..."
          : "Your video is taking a little longer. Thank you for your patience!";

  return (
    <>
      <Header />

      <main className="flex min-h-[75vh] items-center justify-center bg-[#fcf9fd] px-4 py-12">
        <section className="w-full max-w-xl rounded-3xl border border-purple-100 bg-white p-6 text-center shadow-lg sm:p-10">
          {/* Payment confirmation */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2
              className="h-12 w-12 text-emerald-500"
              strokeWidth={1.8}
            />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-gray-900 sm:text-3xl">
            Payment confirmed!
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-600">
            {order
              ? `Your order #${order} has been confirmed successfully.`
              : "Your payment has been confirmed successfully."}
          </p>

          {/* Preparing / Downloading */}
          {downloadStatus === "preparing" && (
            <div className="mt-8 rounded-2xl border border-purple-100 bg-purple-50/70 p-5 sm:p-6">
              <div className="flex flex-col items-center">
                <div className="relative flex h-16 w-16 items-center justify-center">
                  <div className="absolute inset-0 animate-spin rounded-full border-4 border-purple-200 border-t-[#985cc0]" />
                  <Loader2 className="h-7 w-7 text-[#985cc0]" />
                </div>

                <h2 className="mt-4 text-lg font-semibold text-gray-900">
                  Preparing your video
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {statusMessage}
                </p>

                <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-purple-100">
                  <div className="h-full w-1/3 animate-[loading_1.8s_ease-in-out_infinite] rounded-full bg-[#985cc0]" />
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-purple-700">
                  <Clock3 className="h-4 w-4" />
                  <span>Time elapsed: {formattedTime}</span>
                </div>
              </div>

              <p className="mt-4 text-xs leading-5 text-gray-500">
                Your personalized invitation is being prepared in high quality.
                Please keep this page open until the download completes.
              </p>
            </div>
          )}

          {/* Download completed + REDOWNLOAD BUTTON */}
          {downloadStatus === "success" && (
            <div className="mt-8 rounded-2xl border border-emerald-100 bg-emerald-50 p-5 sm:p-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              </div>

              <h2 className="mt-4 text-lg font-semibold text-emerald-800">
                Your video is ready!
              </h2>

              <p className="mt-2 text-sm leading-6 text-emerald-700">
                Your personalized invitation has been downloaded successfully.
              </p>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-emerald-700">
                <ShieldCheck className="h-4 w-4" />
                <span>Secure download completed</span>
              </div>

              {/* Download again */}
              <button
                type="button"
                onClick={() => void startDownload()}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#985cc0] px-6 py-3.5 font-semibold text-white shadow-md transition hover:bg-[#8147a8] active:scale-[0.98]"
              >
                <Download className="h-5 w-5" />
                Download again
              </button>
            </div>
          )}

          {/* Download failed */}
          {downloadStatus === "error" && (
            <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-5">
              <AlertCircle className="mx-auto h-10 w-10 text-red-500" />

              <h2 className="mt-3 font-semibold text-red-800">
                Download could not be completed
              </h2>

              <p className="mt-2 text-sm leading-6 text-red-700">
                {errorMessage}
              </p>

              <button
                type="button"
                onClick={() => void startDownload()}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-[#985cc0] px-5 py-3 font-semibold text-white transition hover:bg-[#8147a8]"
              >
                <Download className="h-4 w-4" />
                Try downloading again
              </button>
            </div>
          )}

          {/* Initial / manual download */}
          {downloadStatus === "idle" && downloadUrl && (
            <button
              type="button"
              onClick={() => void startDownload()}
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#985cc0] px-6 py-3.5 font-semibold text-white shadow-md transition hover:bg-[#8147a8] active:scale-[0.98]"
            >
              <Download className="h-5 w-5" />
              Download my video
            </button>
          )}

          {/* No download URL */}
          {!downloadUrl && (
            <div className="mt-7 rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
              Your payment is confirmed. Please visit My History to access your
              purchased video.
            </div>
          )}

          {/* Navigation */}
          <div className="mt-7 border-t border-gray-100 pt-5">
            <Link
              href="/templates"
              className="inline-flex items-center justify-center rounded-xl border border-[#d9b9eb] px-6 py-3 font-semibold text-[#9259b7] transition hover:bg-purple-50"
            >
              Browse more invitations
            </Link>
          </div>

          <p className="mt-5 text-xs text-gray-400">
            Thank you for choosing Luring Invite ❤️
          </p>
        </section>
      </main>

      <Footer />
      <FloatingWhatsApp />

      <style jsx global>{`
        @keyframes loading {
          0% {
            transform: translateX(-120%);
          }
          100% {
            transform: translateX(350%);
          }
        }
      `}</style>
    </>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#fcf9fd]">
          <Loader2 className="h-8 w-8 animate-spin text-[#985cc0]" />
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
