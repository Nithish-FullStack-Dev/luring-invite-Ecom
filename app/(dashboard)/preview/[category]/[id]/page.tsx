"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Film,
  Heart,
  LoaderCircle,
  PencilLine,
  Play,
  ShieldCheck,
  Sparkles,
  Star,
  X,
} from "lucide-react";

import { mediaUrl } from "@/lib/client-api";
import Header from "@/component/layout/header";
import Footer from "@/component/layout/Footer";
import FloatingWhatsApp from "@/component/layout/FloatingWhatsApp";
import { AnimatePresence, useReducedMotion, motion } from "framer-motion";

type Template = {
  id: number;
  title: string;
  description?: string | null;
  thumbnail?: string | null;
  previewVideo?: string | null;
  sourceVideo?: string | null;
  price: number;
  durationSeconds: number;
  categories: { name: string; slug: string }[];
  frames: {
    id: number;
    title?: string | null;
    previewImage?: string | null;
  }[];
};

export default function TemplatePreviewPage() {
  const params = useParams<{ category: string; id: string }>();
  const id = params?.id;
  const category = params?.category || "birthday";
  const shouldReduceMotion = useReducedMotion();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showVideo, setShowVideo] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    async function loadTemplate() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/templates/${id}`, {
          signal: controller.signal,
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || result.status !== "success") {
          throw new Error(result.message || "Template not found.");
        }

        setTemplate(result.data);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load this invitation.",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadTemplate();

    return () => controller.abort();
  }, [id]);

  // Close the video modal with the Escape key.
  useEffect(() => {
    if (!showVideo) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setShowVideo(false);
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showVideo]);

  const sampleVideo = template?.previewVideo || template?.sourceVideo;
  const videoUrl = sampleVideo ? mediaUrl(sampleVideo) : "";

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-[70vh] bg-[#fdfbfe] px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-6xl animate-pulse">
            <div className="mb-10 h-4 w-32 rounded bg-purple-100" />

            <div className="grid gap-10 md:grid-cols-2 md:gap-16">
              <div className="mx-auto aspect-[3/4] w-full max-w-[420px] rounded-[28px] bg-purple-100/70" />

              <div className="space-y-5 pt-5">
                <div className="h-6 w-28 rounded-full bg-purple-100" />
                <div className="h-10 w-4/5 rounded-lg bg-purple-100" />
                <div className="h-4 w-full rounded bg-purple-50" />
                <div className="h-4 w-3/4 rounded bg-purple-50" />
                <div className="mt-10 h-36 rounded-2xl bg-purple-100/70" />
              </div>
            </div>

            <p className="mt-8 text-center text-sm text-[#8b7897]">
              Preparing your invitation preview...
            </p>
          </div>
        </main>
        <Footer />
        <FloatingWhatsApp />
      </>
    );
  }

  if (error || !template) {
    return (
      <>
        <Header />
        <main className="flex min-h-[65vh] items-center justify-center bg-[#fdfbfe] px-4 py-16">
          <div className="w-full max-w-lg rounded-3xl border border-purple-100 bg-white p-8 text-center shadow-[0_20px_70px_rgba(75,36,95,0.08)] sm:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50 text-[#a86dcd]">
              <Sparkles size={30} />
            </div>

            <h1 className="mt-6 text-2xl font-semibold text-[#302438]">
              Invitation unavailable
            </h1>

            <p className="mt-3 break-words text-sm leading-6 text-gray-500">
              {error ||
                "We couldn't find this invitation. Please try another design."}
            </p>

            <Link
              href="/"
              className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#a86dcd] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#9259b7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a86dcd] focus-visible:ring-offset-2"
            >
              <ArrowLeft size={16} />
              Browse invitations
            </Link>
          </div>
        </main>
        <Footer />
        <FloatingWhatsApp />
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="preview-page relative min-h-screen overflow-hidden bg-[#fdfbfe] text-[#302438]">
        <div className="pointer-events-none absolute -left-40 top-40 h-96 w-96 rounded-full bg-[#f0e0fa]/50 blur-[110px]" />
        <div className="pointer-events-none absolute -right-40 top-80 h-96 w-96 rounded-full bg-[#f7eafb]/70 blur-[110px]" />

        <div className="relative mx-auto max-w-[1320px] px-4 py-10">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="preview-enter mb-3 flex items-center justify-between gap-4 "
          >
            <Link
              href="/"
              className="group inline-flex min-h-10 items-center gap-2 rounded-lg text-sm text-[#8b8093] transition hover:text-[#9259b7]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#eadff1] bg-white transition group-hover:border-[#d6b4e9] group-hover:bg-purple-50">
                <ArrowLeft size={15} />
              </span>
              <span>Back to templates</span>
            </Link>

            <div className="hidden items-center gap-2 text-xs text-[#9a8ba4] sm:flex">
              <ShieldCheck size={15} className="text-[#a86dcd]" />
              <span>Personalize your invitation</span>
            </div>
          </nav>

          {/* Main product section */}
          <div className="grid items-start gap-9 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-12 lg:gap-20">
            {/* Invitation image */}
            <section className="preview-enter preview-enter-delay-1 mx-auto w-full max-w-[440px] md:sticky md:top-28">
              <div className="preview-image-shell group relative rounded-[26px] border border-white bg-white p-2.5 shadow-[0_22px_65px_rgba(61,35,76,0.13)] sm:rounded-[30px] sm:p-3">
                <div className="relative overflow-hidden rounded-[19px] bg-[#f5edf9] sm:rounded-[22px]">
                  {template.thumbnail ? (
                    <img
                      src={mediaUrl(template.thumbnail)}
                      alt={`${template.title} invitation preview`}
                      className="preview-artwork block max-h-[760px] min-h-[320px] w-full object-contain sm:min-h-[420px]"
                      fetchPriority="high"
                    />
                  ) : (
                    <div className="flex aspect-[9/14] flex-col items-center justify-center gap-3 text-[#9c7eb0]">
                      <Sparkles size={36} strokeWidth={1.2} />
                      <p className="text-sm">Preview image unavailable</p>
                    </div>
                  )}

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-black/[0.03]" />

                  {sampleVideo && (
                    <button
                      type="button"
                      onClick={() => {
                        setVideoFailed(false);
                        setShowVideo(true);
                      }}
                      aria-label={`Play ${template.title} video preview`}
                      className="preview-play absolute left-1/2 top-1/2 flex h-[66px] w-[66px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/95 text-[#9259b7] shadow-[0_8px_35px_rgba(38,15,50,0.22)] transition duration-300 hover:scale-110 hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#a86dcd]/40 sm:h-[76px] sm:w-[76px]"
                    >
                      <Play size={27} fill="currentColor" className="ml-1" />
                    </button>
                  )}

                  <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full border border-white/50 bg-white/90 px-3 py-2 text-[11px] font-medium text-[#674a78] shadow-sm backdrop-blur-md">
                    <Sparkles size={13} className="text-[#a86dcd]" />
                    Invitation preview
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-start justify-center gap-2 px-3 text-center text-xs leading-5 text-[#9a8ba4]">
                <ShieldCheck
                  size={14}
                  className="mt-0.5 shrink-0 text-[#a86dcd]"
                />
                <p>
                  Preview artwork is for reference. Personalize your invitation
                  with your own event details.
                </p>
              </div>
            </section>

            {/* Product information */}
            <section className="preview-enter preview-enter-delay-2 min-w-0 pt-1 sm:pt-4 md:pt-8">
              <div className="flex flex-wrap items-center gap-2">
                {template.categories.length > 0 ? (
                  template.categories.map((item) => (
                    <span
                      key={item.slug}
                      className="inline-flex items-center rounded-full border border-[#ead9f5] bg-[#f5eafa] px-3.5 py-1.5 text-[11px] font-semibold tracking-wide text-[#82509d]"
                    >
                      {item.name}
                    </span>
                  ))
                ) : (
                  <span className="rounded-full bg-[#f5eafa] px-3.5 py-1.5 text-[11px] font-semibold text-[#82509d]">
                    Digital Invitation
                  </span>
                )}

                {sampleVideo && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e8e2ec] bg-white px-3 py-1.5 text-[11px] text-[#817187]">
                    <Film size={13} />
                    Video preview
                  </span>
                )}
              </div>

              <h1 className="page-title mt-5 text-3xl font-semibold leading-[1.18] tracking-tight text-[#302438] sm:mt-6 sm:text-4xl lg:text-[46px]">
                {template.title}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#93859b]">
                <span className="inline-flex items-center gap-1.5">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  Made for your special day
                </span>
                <span className="h-1 w-1 rounded-full bg-[#d8c9e0]" />
                <span>
                  {template.frames.length} editable{" "}
                  {template.frames.length === 1 ? "frame" : "frames"}
                </span>
              </div>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-[#82768b] sm:text-[15px] sm:leading-8">
                {template.description ||
                  "Make this beautiful invitation uniquely yours. Personalize names, event dates, family details and other special information to create a memorable invitation."}
              </p>

              {/* Purchase / customize card */}
              <div className="mt-3 overflow-hidden rounded-[22px] border border-[#ebdff3] bg-white shadow-[0_12px_40px_rgba(69,39,86,0.055)]">
                <div className="p-5 sm:p-7">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium tracking-wide text-[#92829c]">
                        Make it yours
                      </p>
                      <div className="mt-1.5 flex items-baseline gap-2">
                        <span className="text-3xl font-bold tracking-tight text-[#9259b7] sm:text-4xl">
                          ₹{Number(template.price).toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs text-[#a294ac]">
                          / invitation
                        </span>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f6f0fa] px-3 py-2 text-xs font-medium text-[#83549d]">
                      <Heart size={14} className="fill-[#d8b9e9]" />
                      Personalizable
                    </span>
                  </div>
                  <Link
                    href={`/customize/${category}/${template.id}`}
                    className="customize-button group relative isolate mt-6 flex min-h-[54px] w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-[#a86dcd] via-[#9e60c4] to-[#9254b7] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(168,109,205,0.23)] transition-all duration-500 ease-out hover:-translate-y-1 hover:scale-[1.015] hover:shadow-[0_16px_38px_rgba(146,84,183,0.4)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#a86dcd]/30 active:translate-y-0 active:scale-[0.99]"
                  >
                    {/* Premium shine sweep */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-y-0 -left-1/2 z-[-1] w-1/2 -skew-x-[25deg] bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-[350%]"
                    />

                    {/* Soft inner glow */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10 transition-all duration-500 group-hover:ring-white/35"
                    />

                    <PencilLine
                      size={18}
                      className="shrink-0 transition-all duration-500 ease-out group-hover:-rotate-12 group-hover:scale-110 group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.65)]"
                    />

                    <span className="relative">
                      Customize This Template
                      <span className="absolute -bottom-1 left-0 h-px w-0 bg-white/90 transition-all duration-500 ease-out group-hover:w-full" />
                    </span>

                    <ArrowUpRight
                      size={18}
                      className="ml-auto shrink-0 transition-all duration-500 ease-out group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:scale-110"
                    />
                  </Link>

                  <div className="mt-5 grid grid-cols-1 gap-3 border-t border-[#f0e9f4] pt-5 sm:grid-cols-2">
                    <div className="flex items-start gap-2.5">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f5eafa] text-[#9259b7]">
                        <Check size={15} />
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-[#51415d]">
                          Your details
                        </p>
                        <p className="mt-1 text-[11px] leading-5 text-[#9a8ba4]">
                          Add your names and event information.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f5eafa] text-[#9259b7]">
                        <Film size={15} />
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-[#51415d]">
                          Personalized video
                        </p>
                        <p className="mt-1 text-[11px] leading-5 text-[#9a8ba4]">
                          Preview and download your finished invitation.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customization Support Card */}
              <div className="mt-5 overflow-hidden rounded-[22px] border border-[#ead9f5] bg-gradient-to-br from-white via-[#fdf9ff] to-[#f5eafa] p-4 shadow-[0_12px_35px_rgba(69,39,86,0.06)] sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-4">
                  {/* Icon and heading */}
                  <div className="flex min-w-0 items-center gap-3 sm:contents">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f0e0fa] text-[#9259b7]">
                      <Sparkles size={23} />
                    </div>

                    <h3 className="min-w-0 flex-1 font-semibold text-xl  tracking-tight text-[#302438] sm:hidden">
                      Need More Customization?
                    </h3>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="hidden font-semibold tracking-tight text-xl md:text-2xl text-[#302438] sm:block sm:text-lg">
                      Need More Customization?
                    </h3>

                    <p className="text-sm leading-6 text-[#82768b] sm:mt-2">
                      Want a unique design, extra details, custom animations, or
                      something special for your occasion? We’re here to help
                      you create the perfect invitation.
                    </p>

                    <a
                      href={`https://wa.me/919121080131?text=${encodeURIComponent(
                        `Hi, I would like more customization for the invitation "${template.title}". Please help me with the available options.`,
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Contact us on WhatsApp for custom invitation design"
                      className="group mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(37,211,102,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#20bd5a] hover:shadow-[0_10px_25px_rgba(37,211,102,0.25)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/30 active:translate-y-0 sm:mt-5 sm:w-auto sm:px-5"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-5 w-5 shrink-0"
                        aria-hidden="true"
                      >
                        <path d="M20.52 3.48A11.86 11.86 0 0 0 12.08 0C5.5 0 .15 5.35.15 11.93c0 2.1.55 4.16 1.6 5.97L.05 24l6.26-1.64a11.92 11.92 0 0 0 5.76 1.47h.01c6.57 0 11.92-5.35 11.92-11.93 0-3.18-1.24-6.17-3.48-8.42ZM12.08 21.8a9.88 9.88 0 0 1-5.03-1.37l-.36-.21-3.72.98.99-3.63-.24-.37a9.86 9.86 0 0 1-1.52-5.27c0-5.45 4.44-9.89 9.9-9.89a9.82 9.82 0 0 1 7 2.9 9.83 9.83 0 0 1 2.89 7c0 5.46-4.44 9.9-9.9 9.9Zm5.43-7.41c-.3-.15-1.76-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.8-1.49-1.78-1.66-2.08-.18-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.08 4.48.71.31 1.27.5 1.7.64.72.23 1.37.2 1.88.12.58-.09 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
                      </svg>

                      <span className="text-center">
                        Chat with Us on WhatsApp
                      </span>

                      <ArrowUpRight
                        size={17}
                        className="shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </a>

                    <p className="mt-3 text-xs leading-5 text-[#9a8ba4]">
                      Tell us your ideas, and we’ll help you bring them to life.
                    </p>
                  </div>
                </div>
              </div>

              {/* How it works */}
              <div className="mt-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#a477bf]">
                    Simple and personal
                  </p>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#302438] sm:text-3xl">
                    Create your invitation
                  </h2>
                </div>

                <ul className="mt-3 space-y-3 text-sm leading-6 text-gray-600">
                  <li>
                    1. Edit each frame's text, names, dates and invitation
                    details.
                  </li>
                  <li>
                    2. Select a background music track or choose no music.
                  </li>
                  <li>
                    3. Generate your personalized MP4 and preview or download
                    it.
                  </li>
                </ul>
              </div>

              <Link
                href="/"
                className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-[#9259b7] transition hover:gap-3"
              >
                <ArrowLeft size={15} />
                Explore more invitation designs
              </Link>
            </section>
          </div>
        </div>
      </main>
      {/* Smooth left-side video preview animation */}
      <AnimatePresence>
        {showVideo && sampleVideo && (
          <motion.div
            key="video-preview-backdrop"
            className="preview-modal fixed inset-0 z-[100] flex items-center justify-center bg-[#462958]/90 p-4 sm:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setShowVideo(false);
              }
            }}
            role="dialog"
            aria-modal="true"
            aria-label={`${template.title} video preview`}
          >
            <motion.div
              className="relative w-full max-w-[480px]"
              initial={{
                opacity: 0,
                scale: shouldReduceMotion ? 1 : 0.85,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: shouldReduceMotion ? 1 : 0.7,
              }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.4,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {/* Modal header */}
              <div className="mb-4 flex items-center justify-between gap-4 text-white">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-purple-200">
                    Video preview
                  </p>

                  <h2 className="mt-1 truncate text-base font-semibold sm:text-lg">
                    {template.title}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setShowVideo(false)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors duration-200 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  aria-label="Close video preview"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Video */}
              <div className="w-full">
                {!videoFailed ? (
                  <video
                    key={videoUrl}
                    controls
                    autoPlay
                    playsInline
                    className="mx-auto block max-h-[75dvh] w-auto max-w-full rounded-xl object-contain sm:max-h-[80dvh] sm:rounded-2xl"
                    onError={() => setVideoFailed(true)}
                  >
                    <source src={videoUrl} type="video/mp4" />
                    Your browser does not support this video.
                  </video>
                ) : (
                  <div className="flex min-h-[260px] flex-col items-center justify-center px-6 py-12 text-center text-white sm:min-h-[360px]">
                    <Film size={38} className="text-purple-300" />

                    <h3 className="mt-4 text-lg font-semibold">
                      Preview unavailable
                    </h3>

                    <p className="mt-2 max-w-xs text-sm leading-6 text-white/70">
                      The video could not be loaded. Please check the source MP4
                      configured for this template.
                    </p>

                    <button
                      type="button"
                      onClick={() => setShowVideo(false)}
                      className="mt-6 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#614071] transition-colors hover:bg-purple-100"
                    >
                      Back to invitation
                    </button>
                  </div>
                )}
              </div>

              <p className="mt-4 text-center text-xs text-white/55">
                Make this design your own with personalized details.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
      <FloatingWhatsApp />

      <style jsx global>{`
        @keyframes previewEnter {
          from {
            opacity: 0;
            transform: translate3d(0, 18px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes previewModalIn {
          from {
            opacity: 0;
            transform: translate3d(0, 12px, 0) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        .preview-enter {
          animation: previewEnter 650ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .preview-enter-delay-1 {
          animation-delay: 80ms;
        }

        .preview-enter-delay-2 {
          animation-delay: 160ms;
        }

        .preview-image-shell {
          transition:
            box-shadow 350ms ease,
            border-color 350ms ease;
        }

        .preview-image-shell:hover {
          box-shadow: 0 28px 75px rgba(61, 35, 76, 0.17);
        }

        .preview-artwork {
          transition: transform 650ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .preview-image-shell:hover .preview-artwork {
          transform: scale(1.015);
        }

        @media (prefers-reduced-motion: reduce) {
          .preview-enter,
          .preview-modal {
            animation: none !important;
          }

          .preview-artwork,
          .preview-image-shell,
          .preview-play,
          .customize-button {
            transition: none !important;
          }

          .preview-image-shell:hover .preview-artwork {
            transform: none;
          }
        }
      `}</style>
    </>
  );
}
