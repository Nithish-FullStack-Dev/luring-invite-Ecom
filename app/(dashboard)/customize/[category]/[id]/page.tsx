// app/(dashboard)/customize/[category]/[id]/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  LoaderCircle,
  Music2,
  Play,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";
import { mediaUrl } from "@/lib/client-api";
import { normalizeNewlines } from "@/lib/template-config";
import Header from "@/component/layout/header";
import Footer from "@/component/layout/Footer";
import FloatingWhatsApp from "@/component/layout/FloatingWhatsApp";

type Category = { id: string; name: string; slug: string };
type TextConfig = {
  key?: string;
  name?: string;
  text?: string;
  maxLength?: number;
  fontSize?: number;
  [key: string]: unknown;
};
type Frame = {
  id: number | string;
  templateId: number;
  frameNumber: number;
  title?: string | null;
  sourceVideo?: string | null;
  previewImage?: string | null;
  placeholderConfig: { texts?: TextConfig[]; [key: string]: unknown };
  durationSeconds?: number | null;
};
type Template = {
  id: number;
  title: string;
  description?: string | null;
  thumbnail?: string | null;
  price: number;
  categories: Category[];
};
type MusicTrack = {
  id: string;
  title: string;
  path: string;
  duration?: number | null;
};

type FramesData = Record<string, Record<string, string>>;

type ApiResult<T> = {
  status?: string;
  message?: string;
  data?: T;
  frames?: Frame[];
  video?: string;
  jobId?: string;
};

const panelClass =
  "min-w-0 rounded-2xl border border-[#eadff3] bg-white shadow-[0_8px_30px_rgba(69,39,86,0.055)]";
const buttonSecondary =
  "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-[#e8deef] bg-white px-3 py-2 text-sm font-medium text-[#51415d] transition hover:border-[#d2b4e4] hover:bg-[#fcf8ff] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#a86dcd]/15 disabled:cursor-not-allowed disabled:opacity-40";
const buttonPrimary =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#a86dcd] to-[#9254b7] px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(168,109,205,0.22)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(146,84,183,0.28)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#a86dcd]/25 disabled:cursor-not-allowed disabled:opacity-60";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function CustomizePage() {
  const params = useParams<{ category: string; id: string }>();
  const id = params?.id;
  const category = params?.category || "birthday";

  const [template, setTemplate] = useState<Template | null>(null);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>([]);
  const [framesData, setFramesData] = useState<FramesData>({});
  const [selectedMusicTrackId, setSelectedMusicTrackId] = useState("");
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMusic, setLoadingMusic] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [musicError, setMusicError] = useState("");
  const [showReview, setShowReview] = useState(false);
  const [showFinalPreview, setShowFinalPreview] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState("");
  const [generationError, setGenerationError] = useState("");
  const [jobId, setJobId] = useState("");

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();

    async function loadEditor() {
      setLoading(true);
      setError("");
      try {
        const [templateResponse, frameResponse] = await Promise.all([
          fetch(`/api/templates/${id}`, {
            signal: controller.signal,
            cache: "no-store",
          }),
          fetch(`/api/templates/${id}/frames`, {
            signal: controller.signal,
            cache: "no-store",
          }),
        ]);
        const [templateResult, frameResult] = await Promise.all([
          templateResponse.json(),
          frameResponse.json(),
        ]);
        if (!templateResponse.ok || templateResult.status !== "success") {
        ]);

        const [templateResult, frameResult] = (await Promise.all([
          templateResponse.json(),
          frameResponse.json(),
        ])) as [ApiResult<Template>, ApiResult<Frame[]>];

        if (
          !templateResponse.ok ||
          templateResult.status !== "success" ||
          !templateResult.data
        ) {
          throw new Error(
            templateResult.message || "Template could not be loaded.",
          );
        }
        if (!frameResponse.ok || frameResult.status !== "success") {
          throw new Error(
            frameResult.message || "Template frames could not be loaded.",
          );
        }
        const loadedFrames: Frame[] = frameResult.frames || [];
        if (loadedFrames.length === 0)
          throw new Error("This template has no editable frames.");

        const loadedFrames = Array.isArray(frameResult.frames)
          ? frameResult.frames
          : [];
        if (loadedFrames.length === 0)
          throw new Error("This template has no editable frames.");

        setTemplate(templateResult.data);
        setFrames(loadedFrames);
        setCurrentFrameIndex(0);

        const initial: FramesData = {};
        loadedFrames.forEach((frame) => {
          const texts = Array.isArray(frame.placeholderConfig?.texts)
            ? frame.placeholderConfig.texts
            : [];
          initial[String(frame.id)] = {};
          texts.forEach((field, index) => {
            initial[String(frame.id)][`text_${index}`] = normalizeNewlines(
              field.text,
            );
          });
        });
        setFramesData(initial);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(
          err instanceof Error ? err.message : "Unable to load the editor.",
        );
        setError(getErrorMessage(err, "Unable to load the editor."));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadEditor();
    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadMusic() {
      setLoadingMusic(true);
      setMusicError("");
      try {
        const response = await fetch("/api/music", {
          signal: controller.signal,
          cache: "no-store",
        });
        const result = await response.json();
        if (!response.ok || result.status !== "success")
          throw new Error(result.message || "Music list unavailable.");
        setMusicTracks(result.data || []);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setMusicError(
          err instanceof Error ? err.message : "Music list unavailable.",
        );
        const result = (await response.json()) as ApiResult<MusicTrack[]>;
        if (!response.ok || result.status !== "success") {
          throw new Error(result.message || "Music list unavailable.");
        }
        setMusicTracks(Array.isArray(result.data) ? result.data : []);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setMusicError(getErrorMessage(err, "Music list unavailable."));
      } finally {
        if (!controller.signal.aborted) setLoadingMusic(false);
      }
    }

    void loadMusic();
    return () => controller.abort();
  }, []);

  const currentFrame = frames[currentFrameIndex];
  const currentFrameKey = currentFrame ? String(currentFrame.id) : "";
  const currentFields = currentFrame?.placeholderConfig?.texts || [];
  const currentValues = currentFrame ? framesData[currentFrameKey] || {} : {};
  const selectedMusic = useMemo(
    () => musicTracks.find((track) => track.id === selectedMusicTrackId),
    [musicTracks, selectedMusicTrackId],
  );

  const updateText = (
    frameId: string | number,
    textKey: string,
    value: string,
  ) => {
  const updateText = useCallback(
    (frameId: string | number, textKey: string, value: string) => {
      setFramesData((previous) => ({
        ...previous,
        [String(frameId)]: {
          ...previous[String(frameId)],
          [textKey]: normalizeNewlines(value),
        },
      }));
      setGeneratedVideo("");
      setGenerationError("");
    },
    [],
  );

  const moveFrame = useCallback(
    (direction: -1 | 1) => {
      setCurrentFrameIndex((current) =>
        Math.max(0, Math.min(frames.length - 1, current + direction)),
      );
    },
    [frames.length],
  );

  const resetCurrentFrame = useCallback(() => {
    if (!currentFrame) return;
    const defaults: Record<string, string> = {};
    currentFields.forEach((field, index) => {
      defaults[`text_${index}`] = normalizeNewlines(field.text);
    });
    setFramesData((previous) => ({
      ...previous,
      [currentFrameKey]: defaults,
    }));
    setGeneratedVideo("");
    setGenerationError("");
  };

  const moveFrame = (direction: -1 | 1) => {
    setCurrentFrameIndex((current) =>
      Math.max(0, Math.min(frames.length - 1, current + direction)),
    );
  };
  }, [currentFields, currentFrame, currentFrameKey]);

  const generateVideo = useCallback(async () => {
    if (!template || generating) return;
    setGenerating(true);
    setGenerationError("");
    setGeneratedVideo("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: template.id,
          framesData,
          musicTrackId: selectedMusicTrackId || null,
        }),
      });
      const result = (await response.json()) as ApiResult<unknown>;
      if (!response.ok || result.status !== "success" || !result.video) {
        throw new Error(result.message || "Video generation failed.");
      }
      setGeneratedVideo(result.video);
      setJobId(result.jobId || "");
      setShowReview(false);
    } catch (err) {
      setGenerationError(
        err instanceof Error ? err.message : "Video generation failed.",
      );
      setGenerationError(getErrorMessage(err, "Video generation failed."));
    } finally {
      setGenerating(false);
    }
  }, [template, generating, framesData, selectedMusicTrackId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 text-gray-500">
        <LoaderCircle className="animate-spin" /> Loading template editor...
      </div>
      <>
        <Header />
        <main className="flex min-h-[60vh] items-center justify-center gap-3 px-4 text-sm text-[#7d6e88]">
          <LoaderCircle className="animate-spin text-[#a86dcd]" size={22} />
          Loading your invitation editor...
        </main>
        <Footer />
        <FloatingWhatsApp />
      </>
    );
  }

  if (error || !template || frames.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-semibold">Unable to open editor</h1>
        <p className="mt-3 text-sm text-red-600">
          {error || "No frames available."}
        </p>
        <Link
          href={`/preview/${category}/${id}`}
          className="mt-6 rounded-lg bg-[#a86dcd] px-5 py-3 font-semibold text-white"
        >
          Back to preview
        </Link>
      </div>
      <>
        <Header />
        <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f5eafa] text-[#a86dcd]">
            <Sparkles size={25} />
          </div>
          <h1 className="mt-5 text-2xl font-semibold text-[#302438]">
            Unable to open editor
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-red-600">
            {error || "No frames available."}
          </p>
          <Link
            href={`/preview/${category}/${id}`}
            className={`${buttonPrimary} mt-6`}
          >
            <ArrowLeft size={17} /> Back to preview
          </Link>
        </main>
        <Footer />
        <FloatingWhatsApp />
      </>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] px-3 py-5 sm:px-5 lg:px-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href={`/preview/${category}/${template.id}`}
            className="mb-2 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#9050b7]"
          >
            <ArrowLeft size={16} /> Back to template
          </Link>
          <h1 className="page-title text-2xl font-semibold sm:text-3xl">
            Customize: {template.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Edit the fields on the right. The frame preview shows artwork only.
          </p>
        </div>
        <div className="rounded-lg border border-purple-100 bg-white px-4 py-3 text-right">
          <p className="text-xs text-gray-500">Template price</p>
          <p className="text-xl font-bold text-[#985cc0]">
            ₹{template.price.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[225px_minmax(260px,440px)_minmax(360px,1fr)]">
        {/* Frame selector */}
        <aside className="rounded-xl border border-gray-200 bg-white p-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Frames</h2>
            <span className="text-xs text-gray-500">
              {currentFrameIndex + 1}/{frames.length}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-1">
            {frames.map((frame, index) => (
              <button
                key={frame.id}
                type="button"
                onClick={() => setCurrentFrameIndex(index)}
                className={`rounded-lg border-2 p-1 text-left transition ${index === currentFrameIndex ? "border-[#a86dcd] bg-purple-50" : "border-gray-100 hover:border-gray-300"}`}
              >
                <div className="relative aspect-[9/16] overflow-hidden rounded-md bg-gray-100">
                  {frame.previewImage ? (
                    <img
                      src={mediaUrl(frame.previewImage)}
                      alt={frame.title || `Frame ${index + 1}`}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
                      No image
                    </div>
                  )}
                </div>
                <p className="px-1 py-1.5 text-center text-sm">
                  {frame.title || `Frame ${index + 1}`}
                </p>
              </button>
            ))}
          </div>
        </aside>

        {/* Artwork preview */}
        <section className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-semibold text-gray-800">Frame preview</h2>
            <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-800">
              Artwork only
            </span>
          </div>
          <div className="relative mx-auto aspect-[9/16] w-full max-w-[360px] overflow-hidden rounded-lg bg-black shadow-sm">
            {currentFrame.previewImage ? (
              <img
                src={mediaUrl(currentFrame.previewImage)}
                alt={currentFrame.title || "Invitation frame artwork"}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                No preview image
              </div>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => moveFrame(-1)}
              disabled={currentFrameIndex === 0}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <span className="text-xs text-gray-500">
              Frame {currentFrameIndex + 1} of {frames.length}
            </span>
            <button
              type="button"
              onClick={() => moveFrame(1)}
              disabled={currentFrameIndex >= frames.length - 1}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </section>

        {/* Editor form */}
        <section className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">
                Customize:{" "}
                {currentFrame.title || `Frame ${currentFrameIndex + 1}`}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Line breaks are preserved in your generated video.
              </p>
            </div>
            <button
              type="button"
              title="Reset current frame text"
              onClick={() => {
                const defaults: Record<string, string> = {};
                currentFields.forEach((field, index) => {
                  defaults[`text_${index}`] = normalizeNewlines(field.text);
                });
                setFramesData((previous) => ({
                  ...previous,
                  [currentFrameKey]: defaults,
                }));
                setGeneratedVideo("");
              }}
              className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          {currentFields.length === 0 ? (
            <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
              No editable text fields are configured for this frame.
            </p>
          ) : (
            <div className="space-y-4">
              {currentFields.map((field, index) => {
                const value = normalizeNewlines(
                  currentValues[`text_${index}`] ?? field.text,
                );
                const maxLength = Number(field.maxLength) || 500;
                return (
                  <div key={`${currentFrame.id}-${index}`}>
                    <label
                      htmlFor={`text-${currentFrame.id}-${index}`}
                      className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                      {field.key || field.name || `Text field ${index + 1}`}
                    </label>
                    <textarea
                      id={`text-${currentFrame.id}-${index}`}
                      value={value}
                      onChange={(event) =>
                        updateText(
                          currentFrame.id,
                          `text_${index}`,
                          event.target.value,
                        )
                      }
                      rows={Math.min(7, Math.max(2, value.split("\n").length))}
                      maxLength={maxLength}
                      className="w-full resize-y rounded-lg border border-gray-200 px-3 py-3 text-sm leading-6 outline-none transition focus:border-[#a86dcd] focus:ring-2 focus:ring-purple-100"
                      placeholder="Enter invitation text..."
                    />
                    <div className="mt-1 text-right text-xs text-gray-400">
                      {value.length} / {maxLength}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 border-t border-gray-100 pt-5">
            <label
              htmlFor="music"
              className="mb-2 flex items-center gap-2 font-medium text-gray-800"
            >
              <Music2 size={17} /> Select Background Music
            </label>
            <select
              id="music"
              value={selectedMusicTrackId}
              onChange={(event) => setSelectedMusicTrackId(event.target.value)}
              disabled={loadingMusic}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#a86dcd]"
            >
              <option value="">
                {loadingMusic ? "Loading music..." : "No background music"}
              </option>
              {musicTracks.map((track) => (
                <option key={track.id} value={track.id}>
                  {track.title}
                </option>
              ))}
            </select>
            {musicError && (
              <p className="mt-2 text-xs text-red-600">{musicError}</p>
            )}
            {selectedMusic && (
              <p className="mt-2 truncate text-xs text-gray-500">
                Selected: {selectedMusic.title}
              </p>
            )}
          </div>

          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={() => setShowReview(true)}
              disabled={generating}
              className="w-full rounded-lg bg-[#a86dcd] px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-[#914bb8] disabled:opacity-60"
            >
              Review & Generate Video
            </button>
            {generationError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <p className="font-semibold">Video generation failed</p>
                <p className="mt-1 whitespace-pre-wrap break-words">
                  {generationError}
                </p>
                <p className="mt-2 text-xs">
                  Confirm the original MP4 files are under
                  public/media/templates and FFmpeg is installed.
                </p>
              </div>
            )}
          </div>

          {generatedVideo && (
            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 text-green-700" size={20} />
                <div>
                  <h3 className="font-semibold text-green-900">
                    Video generated successfully
                  </h3>
                  <p className="mt-1 text-sm text-green-800">
                    {jobId
                      ? `Job ID: ${jobId}`
                      : "Your customized invitation is ready."}
                  </p>
                </div>
              </div>
              <video
                key={generatedVideo}
                controls
                playsInline
                className="mt-4 max-h-[520px] w-full rounded-lg bg-black"
                src={generatedVideo}
              />
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setShowFinalPreview(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-green-300 bg-white px-4 py-2 text-sm font-semibold text-green-800 hover:bg-green-100"
                >
                  <Play size={16} /> Open preview
                </button>
                <a
                  href={generatedVideo}
                  download
                  className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800"
                >
                  <Download size={16} /> Download MP4
                </a>
    <>
      <Header />
      <main className="relative isolate min-h-screen overflow-hidden bg-[linear-gradient(180deg,#fcf9fe_0%,#ffffff_340px)]">
        <div className="pointer-events-none absolute -left-36 top-24 -z-10 h-80 w-80 rounded-full bg-[#f0e0fa]/45 blur-[100px]" />
        <div className="pointer-events-none absolute -right-36 top-[520px] -z-10 h-80 w-80 rounded-full bg-[#f6eafb]/55 blur-[100px]" />

        <div className="mx-auto w-full max-w-[1600px] px-3 py-5 sm:px-5 sm:py-8 lg:px-7 xl:px-8">
          <div className="mb-6 flex flex-col gap-4 border-b border-[#eee5f3] pb-5 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Link
                href={`/preview/${category}/${template.id}`}
                className="mb-2 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#9050b7]"
              >
                <ArrowLeft size={16} /> Back to template
              </Link>
              <h1 className="page-title text-2xl font-semibold sm:text-3xl">
                Customize: {template.title}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Edit the fields on the right. The frame preview shows artwork
                only.
              </p>
            </div>
            <div className="rounded-lg border border-purple-100 bg-white px-4 py-3 text-right">
              <p className="text-xs text-gray-500">Template price</p>
              <p className="text-xl font-bold text-[#985cc0]">
                ₹{template.price.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          <div className="grid min-w-0 grid-cols-1 items-start gap-5 sm:gap-6 xl:grid-cols-[210px_minmax(260px,370px)_minmax(0,1fr)] xl:gap-6 2xl:grid-cols-[230px_minmax(300px,410px)_minmax(400px,1fr)]">
            {/* Frame selector */}
            <aside className={`${panelClass} p-3 sm:p-4 xl:sticky xl:top-24`}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-[#302438]">Your frames</h2>
                  <p className="mt-1 text-xs text-[#9687a0]">
                    Choose a scene to edit
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-[#f5eafa] px-2.5 py-1 text-xs font-semibold text-[#9259b7]">
                  {currentFrameIndex + 1}/{frames.length}
                </span>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-color:#d9c4e8_transparent] [scrollbar-width:thin] xl:grid xl:grid-cols-1 xl:overflow-visible xl:pb-0">
                {frames.map((frame, index) => (
                  <button
                    key={frame.id}
                    type="button"
                    onClick={() => setCurrentFrameIndex(index)}
                    aria-pressed={index === currentFrameIndex}
                    className={`group w-[92px] shrink-0 rounded-xl border-2 p-1 text-left transition-all duration-200 sm:w-[108px] xl:w-full ${
                      index === currentFrameIndex
                        ? "border-[#a86dcd] bg-[#f8f0fc] shadow-[0_4px_16px_rgba(168,109,205,0.14)]"
                        : "border-transparent bg-[#faf8fc] hover:border-[#e5d2f0]"
                    }`}
                  >
                    <div className="relative aspect-[9/16] overflow-hidden rounded-lg bg-[#f3edf7]">
                      {frame.previewImage ? (
                        <img
                          src={mediaUrl(frame.previewImage)}
                          alt={frame.title || `Frame ${index + 1}`}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-[#9a8ba4]">
                          No image
                        </div>
                      )}
                      {index === currentFrameIndex && (
                        <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#a86dcd] text-white shadow">
                          <CheckCircle2 size={15} />
                        </span>
                      )}
                    </div>
                    <p className="truncate px-1 py-2 text-center text-xs font-medium text-[#51415d]">
                      {frame.title || `Frame ${index + 1}`}
                    </p>
                  </button>
                ))}
              </div>
              <p className="mt-2 hidden text-xs leading-5 text-[#a095aa] xl:block">
                Select any frame to edit its text and details.
              </p>
            </aside>

            {/* Artwork preview */}
            <section className={`${panelClass} p-3 sm:p-5 xl:sticky xl:top-24`}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-[#302438]">
                    Artwork preview
                  </h2>
                  <p className="mt-1 text-xs text-[#9687a0]">
                    Frame {currentFrameIndex + 1} of {frames.length}
                  </p>
                </div>
                <span className="rounded-full bg-[#f5eafa] px-3 py-1.5 text-[11px] font-medium text-[#82509d]">
                  Artwork only
                </span>
              </div>
              <div className="relative mx-auto aspect-[9/16] w-full max-w-[320px] overflow-hidden rounded-2xl border-[5px] border-white bg-[#f5edf9] shadow-[0_15px_40px_rgba(61,35,76,0.15)] ring-1 ring-[#eadff3] sm:max-w-[350px]">
                {currentFrame.previewImage ? (
                  <img
                    key={String(currentFrame.id)}
                    src={mediaUrl(currentFrame.previewImage)}
                    alt={currentFrame.title || "Invitation frame artwork"}
                    className="h-full w-full animate-[frameFadeIn_300ms_ease-out] object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-[#8b8093]">
                    No preview image available
                  </div>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => moveFrame(-1)}
                  disabled={currentFrameIndex === 0}
                  className={buttonSecondary}
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <span className="hidden text-xs text-[#9687a0] sm:inline">
                  {currentFrameIndex + 1} of {frames.length}
                </span>
                <button
                  type="button"
                  onClick={() => moveFrame(1)}
                  disabled={currentFrameIndex >= frames.length - 1}
                  className={buttonSecondary}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
              <p className="mt-3 text-center text-xs leading-5 text-[#a095aa]">
                The preview shows the original artwork. Your text edits are
                applied when the video is generated.
              </p>
            </section>

            {/* Editor */}
            <section className={`${panelClass} p-4 sm:p-6`}>
              <div className="mb-5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a86dcd]">
                    Personalize
                  </p>
                  <h2 className="mt-1 break-words text-xl font-semibold tracking-tight text-[#302438] sm:text-2xl">
                    {currentFrame.title || `Frame ${currentFrameIndex + 1}`}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#8b8093]">
                    Edit the text for this frame. Line breaks are preserved in
                    the generated video.
                  </p>
                </div>
                <button
                  type="button"
                  title="Reset current frame text"
                  aria-label="Reset current frame text"
                  onClick={resetCurrentFrame}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#e8deef] text-[#887596] transition hover:border-[#d2b4e4] hover:bg-[#faf5fd] hover:text-[#9259b7] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#a86dcd]/15"
                >
                  <RefreshCw
                    size={20}
                    className="transition-all duration-500 ease-out hover:rotate-180 hover:scale-110 active:scale-90"
                  />
                </button>
              </div>

              {currentFields.length === 0 ? (
                <p className="rounded-xl border border-dashed border-[#e5d8ee] bg-[#fcf9fe] p-4 text-sm leading-6 text-[#8b8093]">
                  No editable text fields are configured for this frame.
                </p>
              ) : (
                <div className="space-y-5">
                  {currentFields.map((field, index) => {
                    const value = normalizeNewlines(
                      currentValues[`text_${index}`] ?? field.text,
                    );
                    const maxLength = Number(field.maxLength) || 500;
                    const label =
                      field.key || field.name || `Text field ${index + 1}`;
                    const inputId = `text-${currentFrame.id}-${index}`;

                    return (
                      <div key={`${currentFrame.id}-${index}`}>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <label
                            htmlFor={inputId}
                            className="block text-sm font-semibold text-[#51415d]"
                          >
                            {label}
                          </label>
                          <span className="shrink-0 text-xs text-[#a095aa]">
                            {value.length}/{maxLength}
                          </span>
                        </div>
                        <textarea
                          id={inputId}
                          value={value}
                          onChange={(event) =>
                            updateText(
                              currentFrame.id,
                              `text_${index}`,
                              event.target.value,
                            )
                          }
                          rows={Math.min(
                            7,
                            Math.max(2, value.split("\n").length),
                          )}
                          maxLength={maxLength}
                          className="w-full resize-y rounded-xl border border-[#e8deef] bg-[#fdfbfe] px-4 py-3 text-sm leading-6 text-[#302438] outline-none transition placeholder:text-[#b3a6bc] focus:border-[#a86dcd] focus:bg-white focus:ring-4 focus:ring-[#a86dcd]/10"
                          placeholder="Enter invitation text..."
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-7 border-t border-[#f0e8f5] pt-6">
                <label
                  htmlFor="music"
                  className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#51415d]"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f5eafa] text-[#9259b7]">
                    <Music2 size={17} />
                  </span>
                  Background music
                </label>
                <select
                  id="music"
                  value={selectedMusicTrackId}
                  onChange={(event) => {
                    setSelectedMusicTrackId(event.target.value);
                    setGeneratedVideo("");
                    setGenerationError("");
                  }}
                  disabled={loadingMusic}
                  className="min-h-12 w-full rounded-xl border border-[#e8deef] bg-[#fdfbfe] px-4 py-3 text-sm text-[#51415d] outline-none transition focus:border-[#a86dcd] focus:ring-4 focus:ring-[#a86dcd]/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">
                    {loadingMusic ? "Loading music..." : "No background music"}
                  </option>
                  {musicTracks.map((track) => (
                    <option key={track.id} value={track.id}>
                      {track.title}
                    </option>
                  ))}
                </select>
                {musicError && (
                  <p className="mt-2 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                    {musicError} You can continue without background music.
                  </p>
                )}
                {selectedMusic && (
                  <p className="mt-2 truncate text-xs text-[#8b8093]">
                    Selected: {selectedMusic.title}
                  </p>
                )}
              </div>

              <div className="mt-7 space-y-3">
                <button
                  type="button"
                  onClick={() => setShowReview(true)}
                  disabled={generating}
                  className={`${buttonPrimary} w-full`}
                >
                  <Sparkles size={17} /> Review &amp; generate video
                </button>
                <p className="text-center text-xs leading-5 text-[#a095aa]">
                  You can review all frame details before starting video
                  generation.
                </p>
                {generationError && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                  >
                    <p className="font-semibold">Video generation failed</p>
                    <p className="mt-1 whitespace-pre-wrap break-words">
                      {generationError}
                    </p>
                    <p className="mt-2 text-xs leading-5">
                      Check that the original MP4 files are available and FFmpeg
                      is configured on the server.
                    </p>
                  </div>
                )}
              </div>

              {generatedVideo && (
                <div className="mt-7 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                      <CheckCircle2 size={21} />
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-emerald-950">
                        Your invitation video is ready
                      </h3>
                      <p className="mt-1 break-words text-sm leading-5 text-emerald-800">
                        {jobId
                          ? `Job ID: ${jobId}`
                          : "Your customized invitation is ready to preview or download."}
                      </p>
                    </div>
                  </div>
                  <video
                    key={generatedVideo}
                    controls
                    playsInline
                    preload="metadata"
                    className="mt-4 max-h-[520px] w-full rounded-xl bg-black"
                    src={generatedVideo}
                  />
                  <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setShowFinalPreview(true)}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
                    >
                      <Play size={16} /> Open full preview
                    </button>
                    <a
                      href={generatedVideo}
                      download
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
                    >
                      <Download size={16} /> Download MP4
                    </a>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {/* Review dialog */}
      {showReview && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/65 p-3 sm:p-6"
          onClick={() => setShowReview(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-7"
          className="fixed inset-0 z-[60] flex items-end justify-center bg-[#21132c]/65 p-0 backdrop-blur-sm sm:items-center sm:p-5"
          onClick={() => !generating && setShowReview(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-title"
            className="relative max-h-[94dvh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl animate-[dialogIn_200ms_ease-out] sm:max-h-[90vh] sm:rounded-3xl sm:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowReview(false)}
              aria-label="Close review"
              className="absolute right-4 top-4 rounded-full p-2 text-gray-500 hover:bg-gray-100"
            >
              <X size={20} />
            </button>
            <h2 className="page-title pr-8 text-2xl font-semibold">
              Review your invitation
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Check the edited details before generating. Preview thumbnails
              remain artwork-only.
            </p>
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {frames.map((frame) => {
                const textFields = frame.placeholderConfig?.texts || [];
                const values = framesData[String(frame.id)] || {};
                return (
                  <div
                    key={frame.id}
                    className="rounded-xl border border-gray-200 p-3"
                  >
                    <div className="flex items-center gap-3">
                      {frame.previewImage && (
                        <img
                          src={mediaUrl(frame.previewImage)}
                          alt=""
                          className="h-20 w-14 rounded object-cover"
                        />
                      )}
                      <div>
                        <h3 className="font-semibold">
                          {frame.title || `Frame ${frame.frameNumber}`}
                        </h3>
                        <p className="text-xs text-gray-500">
              disabled={generating}
              aria-label="Close review"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-[#8b7b95] transition hover:bg-[#f7f0fb] disabled:opacity-40"
            >
              <X size={20} />
            </button>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a86dcd]">
              Final check
            </p>
            <h2
              id="review-title"
              className="mt-1 pr-10 text-2xl font-semibold tracking-tight text-[#302438] sm:text-3xl"
            >
              Review your invitation
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#8b8093]">
              Confirm the text and music before generating your personalized
              video.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {frames.map((frame, frameIndex) => {
                const textFields = frame.placeholderConfig?.texts || [];
                const values = framesData[String(frame.id)] || {};
                return (
                  <article
                    key={frame.id}
                    className="rounded-2xl border border-[#eadff3] p-3 sm:p-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {frame.previewImage ? (
                        <img
                          src={mediaUrl(frame.previewImage)}
                          alt=""
                          className="h-20 w-14 shrink-0 rounded-lg object-cover ring-1 ring-[#eadff3]"
                        />
                      ) : (
                        <div className="flex h-20 w-14 shrink-0 items-center justify-center rounded-lg bg-[#f5eafa] text-[#a86dcd]">
                          <Sparkles size={18} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#a86dcd]">
                          Frame {frameIndex + 1}
                        </p>
                        <h3 className="truncate font-semibold text-[#302438]">
                          {frame.title || `Frame ${frame.frameNumber}`}
                        </h3>
                        <p className="mt-1 text-xs text-[#9687a0]">
                          {textFields.length} editable field
                          {textFields.length === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 space-y-2">
                      {textFields.map((field, index) => (
                        <div key={index}>
                          <p className="text-xs font-medium text-gray-500">
                            {field.key || `Text ${index + 1}`}
                          </p>
                          <p className="whitespace-pre-wrap break-words text-sm text-gray-800">
                            {values[`text_${index}`] ?? field.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 flex flex-col justify-between gap-4 border-t border-gray-100 pt-5 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm text-gray-500">Background music</p>
                <p className="font-medium">
                  {selectedMusic?.title || "No background music"}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Template price: ₹{template.price.toLocaleString("en-IN")}
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentFrameIndex(frameIndex);
                          setShowReview(false);
                        }}
                        className="ml-auto shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-[#9259b7] hover:bg-[#f7effc]"
                      >
                        Edit
                      </button>
                    </div>
                    {textFields.length > 0 && (
                      <div className="mt-3 space-y-3 border-t border-[#f0e8f5] pt-3">
                        {textFields.map((field, index) => (
                          <div key={index} className="min-w-0">
                            <p className="text-xs font-medium text-[#9687a0]">
                              {field.key || field.name || `Text ${index + 1}`}
                            </p>
                            <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-5 text-[#51415d]">
                              {values[`text_${index}`] ?? field.text ?? ""}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>

            <div className="mt-5 flex flex-col gap-4 border-t border-[#eee5f3] pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs text-[#9687a0]">Background music</p>
                <p className="mt-1 break-words font-semibold text-[#51415d]">
                  {selectedMusic?.title || "No background music"}
                </p>
                <p className="mt-1 text-sm text-[#8b8093]">
                  Template price: ₹
                  {Number(template.price).toLocaleString("en-IN")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void generateVideo()}
                disabled={generating}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#a86dcd] px-5 py-3 font-semibold text-white hover:bg-[#914bb8] disabled:opacity-60"
              >
                {generating ? (
                  <>
                    <LoaderCircle className="animate-spin" size={18} />{" "}
                    Generating...
                  </>
                ) : (
                  "Generate Video"
                className={`${buttonPrimary} w-full sm:w-auto sm:min-w-48`}
              >
                {generating ? (
                  <>
                    <LoaderCircle className="animate-spin" size={18} />
                    Generating video...
                  </>
                ) : (
                  <>
                    <Sparkles size={17} />
                    Generate video
                  </>
                )}
              </button>
            </div>
            {generating && (
              <div className="mt-4 rounded-xl bg-[#f8f0fc] p-4 text-sm leading-6 text-[#744493]">
                Please keep this page open while your invitation video is being
                generated.
              </div>
            )}
          </section>
        </div>
      )}

      {/* Generated video full preview */}
      {showFinalPreview && generatedVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setShowFinalPreview(false)}
        >
          <div
            className="relative w-full max-w-md rounded-xl bg-black p-2"
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-3 backdrop-blur-sm sm:p-6"
          onClick={() => setShowFinalPreview(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Generated video preview"
            className="relative w-full max-w-lg rounded-2xl bg-[#120d16] p-2 shadow-2xl sm:p-3"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowFinalPreview(false)}
              aria-label="Close video preview"
              className="absolute -right-3 -top-3 z-10 rounded-full bg-white p-2 text-gray-800 shadow"
            >
              <X size={19} />
              className="absolute -right-2 -top-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#302438] shadow-lg transition hover:scale-105"
            >
              <X size={20} />
            </button>
            <video
              controls
              autoPlay
              playsInline
              className="max-h-[85vh] w-full rounded-lg"
              src={generatedVideo}
            />
          </div>
              className="max-h-[85dvh] w-full rounded-xl bg-black"
              src={generatedVideo}
            />
          </section>
        </div>
      )}

      <Footer />
      <FloatingWhatsApp />

      <style jsx global>{`
        @keyframes frameFadeIn {
          from {
            opacity: 0;
            transform: scale(0.99);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes dialogIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-\\[frameFadeIn_300ms_ease-out\\],
          .animate-\\[dialogIn_200ms_ease-out\\] {
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
}
