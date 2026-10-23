"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Download,
  LoaderCircle,
  Music2,
  Play,
  RefreshCw,
  X,
  Sparkles,
  Film,
  Clock3,
} from "lucide-react";
import { mediaUrl } from "@/lib/client-api";
import { normalizeNewlines } from "@/lib/template-config";
import Header from "@/component/layout/header";
import Footer from "@/component/layout/Footer";
import FloatingWhatsApp from "@/component/layout/FloatingWhatsApp";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type TextConfig = {
  key?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
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
  placeholderConfig: {
    texts?: TextConfig[];
    [key: string]: unknown;
  };
  durationSeconds?: number | null;
};

type MusicTrack = {
  id: string;
  title: string;
  path: string;
  duration?: number | null;
};

type Template = {
  id: number;
  title: string;
  description?: string | null;
  thumbnail?: string | null;
  price: number;
  categories: Category[];
  musicTracks?: MusicTrack[];
};

type FramesData = Record<string, Record<string, string>>;

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm leading-6 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#a86dcd] focus:ring-4 focus:ring-purple-100";

const secondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:border-purple-200 hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-40";

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
  const [showReview, setShowReview] = useState(false);
  const [showFinalPreview, setShowFinalPreview] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState("");
  const [generationError, setGenerationError] = useState("");
  const [jobId, setJobId] = useState("");

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    const loadEditor = async () => {
      setLoading(true);
      setLoadingMusic(true);
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
          throw new Error(
            templateResult.message || "Template could not be loaded.",
          );
        }

        if (!frameResponse.ok || frameResult.status !== "success") {
          throw new Error(
            frameResult.message || "Template frames could not be loaded.",
          );
        }

        const loadedFrames: Frame[] = Array.isArray(frameResult.frames)
          ? frameResult.frames
          : [];

        if (loadedFrames.length === 0) {
          throw new Error("This template has no editable frames.");
        }

        const loadedTemplate: Template = templateResult.data;

        setTemplate(loadedTemplate);
        setFrames(loadedFrames);
        setMusicTracks(
          Array.isArray(loadedTemplate.musicTracks)
            ? loadedTemplate.musicTracks
            : [],
        );

        const initial: FramesData = {};

        loadedFrames.forEach((frame) => {
          const texts = Array.isArray(frame.placeholderConfig?.texts)
            ? frame.placeholderConfig.texts
            : [];

          initial[String(frame.id)] = {};

          texts.forEach((field, index) => {
            initial[String(frame.id)][String(field.key ?? `text_${index}`)] =
              normalizeNewlines(field.text);
          });
        });

        setFramesData(initial);
        setCurrentFrameIndex(0);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        setError(
          err instanceof Error ? err.message : "Unable to load the editor.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setLoadingMusic(false);
        }
      }
    };

    void loadEditor();

    return () => controller.abort();
  }, [id]);

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
    setFramesData((previous) => ({
      ...previous,
      [String(frameId)]: {
        ...previous[String(frameId)],
        [textKey]: normalizeNewlines(value),
      },
    }));

    setGeneratedVideo("");
    setGenerationError("");
  };

  const moveFrame = (direction: -1 | 1) => {
    setCurrentFrameIndex((current) =>
      Math.max(0, Math.min(frames.length - 1, current + direction)),
    );
  };

  const resetCurrentFrame = () => {
    if (!currentFrame) return;

    const defaults: Record<string, string> = {};

    currentFields.forEach((field, index) => {
      defaults[String(field.key ?? `text_${index}`)] = normalizeNewlines(
        field.text,
      );
    });

    setFramesData((previous) => ({
      ...previous,
      [currentFrameKey]: defaults,
    }));

    setGeneratedVideo("");
    setGenerationError("");
  };

  const generateVideo = async () => {
    if (!template || generating) return;

    setGenerating(true);
    setGenerationError("");
    setGeneratedVideo("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          templateId: template.id,
          framesData,
          musicTrackId: selectedMusicTrackId || null,
        }),
      });

      const result = await response.json();

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
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="flex items-center gap-3 rounded-2xl border border-purple-100 bg-white px-6 py-5 text-sm text-gray-600 shadow-sm">
            <LoaderCircle size={22} className="animate-spin text-[#a86dcd]" />
            Loading your invitation editor...
          </div>
        </main>
        <Footer />
        <FloatingWhatsApp />
      </>
    );
  }

  if (error || !template || frames.length === 0) {
    return (
      <>
        <Header />
        <main className="flex min-h-[60vh] items-center justify-center px-4 py-12">
          <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
              <Film size={26} />
            </div>
            <h1 className="mt-4 text-xl font-semibold text-gray-900">
              Unable to open editor
            </h1>
            <p className="mt-2 text-sm text-red-600">
              {error || "No frames available."}
            </p>
            <Link
              href={`/preview/${category}/${id}`}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#a86dcd] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#914bb8]"
            >
              <ArrowLeft size={16} />
              Back to template
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

      <main className="min-h-screen bg-[#faf9fc]">
        <div className="mx-auto w-full max-w-[1800px] px-3 py-5 sm:px-5 sm:py-7 lg:px-8">
          <div className="mb-6 flex flex-col gap-4 sm:mb-7 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <Link
                href={`/preview/${category}/${template.id}`}
                className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#985cc0]"
              >
                <ArrowLeft size={16} />
                Back to template
              </Link>

              <div className="flex flex-wrap items-center gap-2">
                <h1 className="page-title text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                  Customize your invitation
                </h1>
                <Sparkles size={20} className="text-[#a86dcd]" />
              </div>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                Personalize your invitation, choose background music, and
                generate your video.
              </p>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-2xl border border-purple-100 bg-white px-5 py-3 shadow-sm sm:min-w-[190px] sm:justify-end">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  Template price
                </p>
                <p className="mt-1 text-2xl font-bold text-[#985cc0]">
                  ₹{template.price.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-[#985cc0]">
                <Sparkles size={22} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(180px,0.65fr)_minmax(300px,1fr)] xl:grid-cols-[210px_minmax(300px,0.9fr)_minmax(390px,1.2fr)] xl:gap-5 2xl:gap-6">
            <aside className="min-w-0 self-start rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4 xl:sticky xl:top-5">
              <div className="mb-4 flex items-center justify-between gap-2">
                <div>
                  <h2 className="font-semibold text-gray-900">Your frames</h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Select a scene to edit
                  </p>
                </div>
                <span className="shrink-0 rounded-lg bg-purple-50 px-2.5 py-1.5 text-xs font-semibold text-[#985cc0]">
                  {currentFrameIndex + 1}/{frames.length}
                </span>
              </div>

              <div className="flex gap-3 overflow-x-auto overscroll-x-contain pb-2 [scrollbar-width:thin] lg:max-h-[calc(100vh-300px)] lg:min-h-0 lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto lg:overscroll-y-contain lg:pr-1 lg:pb-1">
                {frames.map((frame, index) => {
                  const active = index === currentFrameIndex;

                  return (
                    <button
                      key={frame.id}
                      type="button"
                      onClick={() => setCurrentFrameIndex(index)}
                      aria-current={active ? "step" : undefined}
                      className={`group w-[105px] shrink-0 rounded-xl border-2 p-1.5 text-left transition sm:w-[120px] lg:w-full ${
                        active
                          ? "border-[#a86dcd] bg-purple-50 shadow-sm"
                          : "border-transparent bg-gray-50 hover:border-purple-200 hover:bg-purple-50/50"
                      }`}
                    >
                      <div className="relative aspect-[9/16] overflow-hidden rounded-lg bg-gray-100">
                        {frame.previewImage ? (
                          <img
                            src={mediaUrl(frame.previewImage)}
                            alt={frame.title || `Frame ${index + 1}`}
                            loading="lazy"
                            className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
                            No image
                          </div>
                        )}

                        {active && (
                          <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#a86dcd] text-white shadow">
                            <CheckCircle2 size={15} />
                          </div>
                        )}
                      </div>

                      <p
                        className={`truncate px-1 py-2 text-center text-sm font-medium ${
                          active ? "text-[#985cc0]" : "text-gray-600"
                        }`}
                      >
                        {frame.title || `Frame ${index + 1}`}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 hidden rounded-xl bg-gray-50 p-3 lg:block">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                  <Clock3 size={15} className="text-[#985cc0]" />
                  Scene {currentFrameIndex + 1} of {frames.length}
                </div>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Scroll the frames list to find other scenes.
                </p>
              </div>
            </aside>

            <section className="min-w-0 self-start rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-5 xl:p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-gray-900">
                    Artwork preview
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    {currentFrame?.title || `Frame ${currentFrameIndex + 1}`}
                  </p>
                </div>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1.5 text-xs font-medium text-[#985cc0]">
                  <Film size={14} />
                  Artwork only
                </span>
              </div>

              <div className="mx-auto w-full max-w-[340px]">
                <div className="relative aspect-[9/16] w-full overflow-hidden rounded-xl bg-gray-100 shadow-md ring-1 ring-black/5">
                  {currentFrame?.previewImage ? (
                    <img
                      key={currentFrame.id}
                      src={mediaUrl(currentFrame.previewImage)}
                      alt={currentFrame.title || "Invitation frame artwork"}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">
                      No preview image available
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => moveFrame(-1)}
                  disabled={currentFrameIndex === 0}
                  className={secondaryButtonClass}
                >
                  <ChevronLeft size={17} />
                  <span className="hidden sm:inline">Previous</span>
                </button>

                <span className="text-center text-xs font-medium text-gray-500">
                  Frame {currentFrameIndex + 1} of {frames.length}
                </span>

                <button
                  type="button"
                  onClick={() => moveFrame(1)}
                  disabled={currentFrameIndex >= frames.length - 1}
                  className={secondaryButtonClass}
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight size={17} />
                </button>
              </div>

              <div className="mt-4 rounded-xl border border-purple-100 bg-purple-50/50 p-3">
                <div className="flex items-start gap-2.5">
                  <Sparkles
                    size={17}
                    className="mt-0.5 shrink-0 text-[#985cc0]"
                  />
                  <p className="text-xs leading-5 text-gray-600">
                    This preview displays the original artwork. Your custom text
                    is applied when the final video is generated.
                  </p>
                </div>
              </div>
            </section>

            <section className="min-w-0 self-start rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 xl:p-5 2xl:p-6 lg:col-span-2 xl:col-span-1">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-[#985cc0]">
                      <Sparkles size={18} />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Customize scene
                    </h2>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Edit the text for{" "}
                    <span className="font-medium text-gray-700">
                      {currentFrame?.title || `Frame ${currentFrameIndex + 1}`}
                    </span>
                    .
                  </p>
                </div>

                <button
                  type="button"
                  title="Reset current frame text"
                  aria-label="Reset current frame text"
                  onClick={resetCurrentFrame}
                  className="shrink-0 rounded-xl border border-gray-200 p-2.5 text-gray-500 transition hover:border-purple-200 hover:bg-purple-50 hover:text-[#985cc0]"
                >
                  <RefreshCw size={17} />
                </button>
              </div>

              {currentFields.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center">
                  <Film size={25} className="mx-auto text-gray-400" />
                  <p className="mt-3 text-sm font-medium text-gray-700">
                    No editable text fields
                  </p>
                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    This frame does not have any text fields configured.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {currentFields.map((field, index) => {
                    const fieldKey = String(field.key ?? `text_${index}`);
                    const value = normalizeNewlines(
                      currentValues[fieldKey] ?? field.text,
                    );
                    const maxLength = Math.max(
                      1,
                      Math.min(2000, Number(field.maxLength) || 500),
                    );

                    return (
                      <div key={`${currentFrame?.id}-${index}`}>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <label
                            htmlFor={`text-${currentFrame?.id}-${index}`}
                            className="text-sm font-semibold text-gray-800"
                          >
                            {field.label ||
                              field.key ||
                              field.name ||
                              `Text field ${index + 1}`}
                            {field.required && (
                              <span className="ml-1 text-red-500">*</span>
                            )}
                          </label>

                          <span className="shrink-0 text-xs text-gray-400">
                            {index + 1}/{currentFields.length}
                          </span>
                        </div>

                        <textarea
                          id={`text-${currentFrame?.id}-${index}`}
                          value={value}
                          onChange={(event) =>
                            currentFrame &&
                            updateText(
                              currentFrame.id,
                              fieldKey,
                              event.target.value,
                            )
                          }
                          rows={Math.min(
                            6,
                            Math.max(3, value.split("\n").length),
                          )}
                          maxLength={maxLength}
                          required={field.required === true}
                          className={`${inputClass} resize-y bg-gray-50/50 focus:bg-white`}
                          placeholder={
                            field.placeholder || "Enter invitation text..."
                          }
                        />

                        <div className="mt-2 flex items-center justify-between gap-3">
                          <p className="text-xs text-gray-400">
                            Line breaks are preserved.
                          </p>
                          <span
                            className={`shrink-0 text-xs ${
                              value.length >= maxLength
                                ? "font-semibold text-red-500"
                                : "text-gray-400"
                            }`}
                          >
                            {value.length}/{maxLength}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="my-6 border-t border-gray-100" />

              <div>
                <label
                  htmlFor="music"
                  className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-[#985cc0]">
                    <Music2 size={17} />
                  </div>
                  Background music
                </label>

                <p className="mb-3 text-xs leading-5 text-gray-500">
                  Choose a soundtrack for your invitation video.
                </p>

                <select
                  id="music"
                  value={selectedMusicTrackId}
                  onChange={(event) => {
                    setSelectedMusicTrackId(event.target.value);
                    setGeneratedVideo("");
                  }}
                  disabled={loadingMusic}
                  className={inputClass}
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

                {selectedMusic && (
                  <div className="mt-3 flex items-center gap-3 rounded-xl bg-purple-50/70 p-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#985cc0] shadow-sm">
                      <Music2 size={17} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">
                        Selected soundtrack
                      </p>
                      <p className="truncate text-sm font-medium text-gray-800">
                        {selectedMusic.title}
                      </p>
                    </div>
                    <CheckCircle2
                      size={17}
                      className="ml-auto shrink-0 text-[#985cc0]"
                    />
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={() => setShowReview(true)}
                  disabled={generating}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#a86dcd] px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#914bb8] focus:outline-none focus:ring-4 focus:ring-purple-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Sparkles size={17} />
                  Review & Generate Video
                </button>

                <p className="text-center text-xs leading-5 text-gray-400">
                  Review your details before generating your invitation.
                </p>
              </div>

              {generationError && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <p className="font-semibold">Video generation failed</p>
                  <p className="mt-1 whitespace-pre-wrap break-words leading-6">
                    {generationError}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-red-600">
                    Confirm the original MP4 files are under
                    public/media/templates and FFmpeg is installed.
                  </p>
                </div>
              )}

              {generatedVideo && (
                <div className="mt-6 rounded-2xl border border-green-200 bg-green-50/70 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
                      <CheckCircle2 size={21} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-semibold text-green-900">
                        Your video is ready!
                      </h3>
                      <p className="mt-1 break-words text-sm text-green-800">
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
                    className="mt-4 max-h-[520px] w-full rounded-xl bg-black"
                    src={generatedVideo}
                  />

                  <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setShowFinalPreview(true)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-green-300 bg-white px-4 py-3 text-sm font-semibold text-green-800 transition hover:bg-green-100"
                    >
                      <Play size={17} />
                      Open preview
                    </button>

                    <a
                      href={generatedVideo}
                      download
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
                    >
                      <Download size={17} />
                      Download MP4
                    </a>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {showReview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/65 p-3 backdrop-blur-sm sm:p-6"
          onClick={() => !generating && setShowReview(false)}
        >
          <div
            className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl sm:p-6 lg:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowReview(false)}
              disabled={generating}
              aria-label="Close review"
              className="absolute right-4 top-4 rounded-xl border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-100 disabled:opacity-50"
            >
              <X size={19} />
            </button>

            <div className="pr-10">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-[#985cc0]">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                    Review your invitation
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Check all your details before creating the video.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {frames.map((frame) => {
                const textFields = frame.placeholderConfig?.texts || [];
                const values = framesData[String(frame.id)] || {};

                return (
                  <div
                    key={frame.id}
                    className="min-w-0 rounded-xl border border-gray-200 p-3 sm:p-4"
                  >
                    <div className="flex items-center gap-3">
                      {frame.previewImage && (
                        <img
                          src={mediaUrl(frame.previewImage)}
                          alt=""
                          className="h-20 w-14 shrink-0 rounded-lg object-cover"
                        />
                      )}

                      <div className="min-w-0">
                        <h3 className="truncate font-semibold text-gray-900">
                          {frame.title || `Frame ${frame.frameNumber}`}
                        </h3>
                        <p className="mt-1 text-xs text-gray-500">
                          {textFields.length} editable field
                          {textFields.length === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      {textFields.map((field, index) => {
                        const fieldKey = String(field.key ?? `text_${index}`);
                        const fieldValue =
                          values[fieldKey] ?? normalizeNewlines(field.text);

                        return (
                          <div key={`${frame.id}-${index}`} className="min-w-0">
                            <p className="mb-1 text-xs font-semibold text-gray-500">
                              {field.label || field.key || `Text ${index + 1}`}
                            </p>
                            <p className="break-words whitespace-pre-wrap text-sm leading-6 text-gray-800">
                              {fieldValue || "No text entered"}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col gap-4 rounded-xl bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  Background music
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-gray-800">
                  {selectedMusic?.title || "No background music"}
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Template price: ₹{template.price.toLocaleString("en-IN")}
                </p>
              </div>

              <div className="grid w-full grid-cols-1 gap-2 sm:w-auto sm:min-w-[220px]">
                <button
                  type="button"
                  onClick={() => void generateVideo()}
                  disabled={generating}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#a86dcd] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#914bb8] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {generating ? (
                    <>
                      <LoaderCircle size={18} className="animate-spin" />
                      Generating video...
                    </>
                  ) : (
                    <>
                      <Film size={18} />
                      Generate Video
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowReview(false)}
                  disabled={generating}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
                >
                  Continue editing
                </button>
              </div>
            </div>

            {generationError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <p className="font-semibold">Video generation failed</p>
                <p className="mt-1 whitespace-pre-wrap break-words">
                  {generationError}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {showFinalPreview && generatedVideo && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-950/85 p-3 backdrop-blur-sm sm:p-6"
          onClick={() => setShowFinalPreview(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl bg-white p-2 shadow-2xl sm:p-3"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowFinalPreview(false)}
              aria-label="Close video preview"
              className="absolute -right-2 -top-2 z-10 rounded-full bg-white p-2.5 text-gray-800 shadow-lg transition hover:bg-gray-100"
            >
              <X size={19} />
            </button>

            <video
              key={generatedVideo}
              controls
              autoPlay
              playsInline
              className="max-h-[85vh] w-full rounded-xl bg-black"
              src={generatedVideo}
            />
          </div>
        </div>
      )}

      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
