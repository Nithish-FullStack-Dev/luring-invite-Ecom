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
  const [ignoredFields, setIgnoredFields] = useState<Record<string, boolean>>(
    {},
  );
  const [validationMessage, setValidationMessage] = useState("");

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

  const fieldId = (frameId: string | number, textKey: string) =>
    `${String(frameId)}:${textKey}`;

  const isFieldIgnored = (frameId: string | number, textKey: string) =>
    ignoredFields[fieldId(frameId, textKey)] === true;

  const isFrameComplete = (frame: Frame) => {
    const fields = frame.placeholderConfig?.texts || [];
    const values = framesData[String(frame.id)] || {};
    return fields.every((field, index) => {
      const key = String(field.key ?? `text_${index}`);
      return (
        isFieldIgnored(frame.id, key) ||
        normalizeNewlines(values[key] ?? field.text).trim().length > 0
      );
    });
  };

  const allFramesComplete = frames.every(isFrameComplete);

  const moveFrame = (direction: -1 | 1) => {
    if (direction === 1 && currentFrame && !isFrameComplete(currentFrame)) {
      setValidationMessage(
        "Complete each field or check ‘Ignore this field’ before moving to the next frame.",
      );
      return;
    }
    setValidationMessage("");
    setCurrentFrameIndex((current) =>
      Math.max(0, Math.min(frames.length - 1, current + direction)),
    );
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
                  defaults[String(field.key ?? `text_${index}`)] =
                    normalizeNewlines(field.text);
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
                const fieldKey = String(field.key ?? `text_${index}`);
                const value = normalizeNewlines(
                  currentValues[fieldKey] ?? field.text,
                );
                const maxLength = Math.max(
                  1,
                  Math.min(2000, Number(field.maxLength) || 500),
                );
                return (
                  <div key={`${currentFrame.id}-${index}`}>
                    <label
                      htmlFor={`text-${currentFrame.id}-${index}`}
                      className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                      {field.label ||
                        field.key ||
                        field.name ||
                        `Text field ${index + 1}`}
                    </label>
                    <textarea
                      id={`text-${currentFrame.id}-${index}`}
                      value={value}
                      onChange={(event) =>
                        updateText(
                          currentFrame.id,
                          fieldKey,
                          event.target.value,
                        )
                      }
                      rows={Math.min(7, Math.max(2, value.split("\n").length))}
                      maxLength={maxLength}
                      required={field.required === true}
                      className="w-full resize-y rounded-lg border border-gray-200 px-3 py-3 text-sm leading-6 outline-none transition focus:border-[#a86dcd] focus:ring-2 focus:ring-purple-100"
                      placeholder={
                        field.placeholder || "Enter invitation text..."
                      }
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
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Review dialog */}
      {showReview && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/65 p-3 sm:p-6"
          onClick={() => setShowReview(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-7"
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
                          {textFields.length} editable field
                          {textFields.length === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 space-y-2">
                      {textFields.map((field, index) => (
                        <div key={index}>
                          <p className="text-xs font-medium text-gray-500">
                            {field.label || field.key || `Text ${index + 1}`}
                          </p>
                          <p className="whitespace-pre-wrap break-words text-sm text-gray-800">
                            {values[String(field.key ?? `text_${index}`)] ??
                              field.text}
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
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Larger generated video modal */}
      {showFinalPreview && generatedVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setShowFinalPreview(false)}
        >
          <div
            className="relative w-full max-w-md rounded-xl bg-black p-2"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowFinalPreview(false)}
              aria-label="Close video preview"
              className="absolute -right-3 -top-3 z-10 rounded-full bg-white p-2 text-gray-800 shadow"
            >
              <X size={19} />
            </button>
            <video
              controls
              autoPlay
              playsInline
              className="max-h-[85vh] w-full rounded-lg"
              src={generatedVideo}
            />
          </div>
        </div>
      )}
    </div>
  );
}
