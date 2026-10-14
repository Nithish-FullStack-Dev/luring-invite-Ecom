"use client";

import { useState } from "react";

type UploadKind = "templates" | "uploads" | "music";

type FrameDraft = {
  title: string;
  sourceVideo: string;
  previewImage: string;
  durationSeconds: string;
  texts: TextDraft[];
};

type TextDraft = {
  key: string;
  text: string;
  font: string;
  fontSize: string;
  fontColor: string;
  x: string;
  y: string;
  alignment: string;
  maxLength: string;
  animation: "none" | "fade-in" | "slide-in" | "zoom-in" | "typewriter";
  animationDuration: string;
  animationDelay: string;
  animationDirection: "left" | "right" | "top" | "bottom";
};

const emptyText = (): TextDraft => ({
  key: "Event Name",
  text: "Your Event Name",
  font: "DejaVuSans",
  fontSize: "48",
  fontColor: "#ffffff",
  x: "center",
  y: "center",
  alignment: "center",
  maxLength: "100",
  animation: "none",
  animationDuration: "1",
  animationDelay: "0",
  animationDirection: "bottom",
});

const emptyFrame = (number: number): FrameDraft => ({
  title: `Frame ${number}`,
  sourceVideo: "",
  previewImage: "",
  durationSeconds: "5",
  texts: [emptyText()],
});

async function uploadFile(file: File, kind: UploadKind): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("kind", kind);

  const response = await fetch("/api/admin/media/upload", {
    method: "POST",
    body: formData,
  });
  const result = await response.json();
  if (!response.ok || result.status !== "success") {
    throw new Error(result.message || `Unable to upload ${file.name}`);
  }
  return result.data.path as string;
}

export default function AddCustomize() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0");
  const [durationSeconds, setDurationSeconds] = useState("30");
  const [thumbnail, setThumbnail] = useState("");
  const [previewVideo, setPreviewVideo] = useState("");
  const [sourceVideo, setSourceVideo] = useState("");
  const [active, setActive] = useState(true);
  const [frames, setFrames] = useState<FrameDraft[]>([emptyFrame(1)]);
  const [musicTitle, setMusicTitle] = useState("");
  const [musicPath, setMusicPath] = useState("");
  const [musicDuration, setMusicDuration] = useState("");
  const [addMusic, setAddMusic] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleUpload(
    file: File | undefined,
    kind: UploadKind,
    onUploaded: (path: string) => void,
    label: string,
  ) {
    if (!file) return;
    setError("");
    setUploading(label);
    try {
      const path = await uploadFile(file, kind);
      onUploaded(path);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading("");
    }
  }

  function updateFrame(index: number, patch: Partial<FrameDraft>) {
    setFrames((current) =>
      current.map((frame, i) => (i === index ? { ...frame, ...patch } : frame)),
    );
  }

  function updateText(
    frameIndex: number,
    textIndex: number,
    patch: Partial<TextDraft>,
  ) {
    setFrames((current) =>
      current.map((frame, i) =>
        i !== frameIndex
          ? frame
          : {
              ...frame,
              texts: frame.texts.map((text, j) =>
                j === textIndex ? { ...text, ...patch } : text,
              ),
            },
      ),
    );
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");

    try {
      if (!title.trim()) throw new Error("Enter a template title.");
      if (!sourceVideo) throw new Error("Upload the main source video.");
      if (!thumbnail) throw new Error("Upload a thumbnail.");
      if (frames.length === 0) throw new Error("Add at least one frame.");

      for (let i = 0; i < frames.length; i++) {
        if (!frames[i].sourceVideo) {
          throw new Error(`Upload a source video for Frame ${i + 1}.`);
        }
      }

      const payload = {
        title: title.trim(),
        description: description.trim(),
        price: Number(price || 0),
        durationSeconds: Number(durationSeconds || 0),
        thumbnail,
        previewVideo: previewVideo || null,
        sourceVideo,
        active,
        frames: frames.map((frame, index) => ({
          frameNumber: index + 1,
          title: frame.title.trim() || `Frame ${index + 1}`,
          sourceVideo: frame.sourceVideo,
          previewImage: frame.previewImage || null,
          durationSeconds: Number(frame.durationSeconds || 0) || null,
          placeholderConfig: {
            texts: frame.texts.map((text) => ({
              key: text.key.trim() || "Text",
              text: text.text,
              font: text.font || "DejaVuSans",
              fontSize: Number(text.fontSize || 48),
              fontColor: text.fontColor || "#ffffff",
              x: text.x || "center",
              y: text.y || "center",
              alignment: text.alignment || "center",
              maxLength: Number(text.maxLength || 100),
              ...(text.animation !== "none"
                ? {
                    anim: {
                      type: text.animation,
                      duration: Number(text.animationDuration || 1),
                      delay: Number(text.animationDelay || 0),
                      direction: text.animationDirection,
                    },
                  }
                : {}),
            })),
          },
        })),
        music:
          addMusic && musicTitle.trim() && musicPath
            ? {
                title: musicTitle.trim(),
                path: musicPath,
                duration: Number(musicDuration || 0) || null,
              }
            : null,
      };

      const response = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok || result.status !== "success") {
        throw new Error(result.message || "Could not create the template.");
      }

      setSuccess(`Template "${title}" created successfully.`);
      window.location.href = `/admin/customize/${result.data.id}`;
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not create the template.",
      );
    } finally {
      setBusy(false);
    }
  }

  const fieldClass =
    "mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100";
  const labelClass = "block text-sm font-medium text-gray-700";

  return (
    <form onSubmit={submit} className="mx-auto max-w-5xl space-y-8">
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}
      {success && (
        <div
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700"
        >
          {success}
        </div>
      )}
      {uploading && (
        <div className="rounded-lg bg-violet-50 p-3 text-sm text-violet-800">
          Uploading {uploading}…
        </div>
      )}

      <section className="space-y-4 rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-semibold">Template details</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className={labelClass}>
            Template title *
            <input
              className={fieldClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={160}
            />
          </label>
          <label className={labelClass}>
            Price (₹) *
            <input
              className={fieldClass}
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </label>
          <label className={labelClass}>
            Total duration (seconds) *
            <input
              className={fieldClass}
              type="number"
              min="1"
              step="1"
              value={durationSeconds}
              onChange={(e) => setDurationSeconds(e.target.value)}
              required
            />
          </label>
          <label className={`${labelClass} flex items-center gap-2 pt-6`}>
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
            Publish this template on the public website
          </label>
        </div>
        <label className={labelClass}>
          Description
          <textarea
            className={fieldClass}
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <div className="grid gap-4 md:grid-cols-3">
          <label className={labelClass}>
            Thumbnail image *
            <input
              className={fieldClass}
              type="file"
              accept="image/*"
              required={!thumbnail}
              onChange={(e) =>
                void handleUpload(
                  e.target.files?.[0],
                  "uploads",
                  setThumbnail,
                  "thumbnail",
                )
              }
            />
            {thumbnail && (
              <span className="mt-1 block break-all text-xs text-green-700">
                Saved: {thumbnail}
              </span>
            )}
          </label>
          <label className={labelClass}>
            Preview video (optional)
            <input
              className={fieldClass}
              type="file"
              accept="video/*"
              onChange={(e) =>
                void handleUpload(
                  e.target.files?.[0],
                  "templates",
                  setPreviewVideo,
                  "preview video",
                )
              }
            />
            {previewVideo && (
              <span className="mt-1 block break-all text-xs text-green-700">
                Saved: {previewVideo}
              </span>
            )}
          </label>
          <label className={labelClass}>
            Main source video *
            <input
              className={fieldClass}
              type="file"
              accept="video/*"
              required={!sourceVideo}
              onChange={(e) =>
                void handleUpload(
                  e.target.files?.[0],
                  "templates",
                  setSourceVideo,
                  "main source video",
                )
              }
            />
            {sourceVideo && (
              <span className="mt-1 block break-all text-xs text-green-700">
                Saved: {sourceVideo}
              </span>
            )}
          </label>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-gray-200 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Frames and editable text</h2>
            <p className="text-sm text-gray-500">
              Each frame can have its own video, preview image, and default text
              positions.
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg border border-violet-300 px-3 py-2 text-sm font-medium text-violet-700"
            onClick={() =>
              setFrames((current) => [
                ...current,
                emptyFrame(current.length + 1),
              ])
            }
          >
            + Add frame
          </button>
        </div>

        {frames.map((frame, frameIndex) => (
          <div
            key={frameIndex}
            className="space-y-4 rounded-lg border border-gray-200 p-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Frame {frameIndex + 1}</h3>
              {frames.length > 1 && (
                <button
                  type="button"
                  className="text-sm text-red-600"
                  onClick={() =>
                    setFrames((current) =>
                      current.filter((_, i) => i !== frameIndex),
                    )
                  }
                >
                  Remove frame
                </button>
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className={labelClass}>
                Frame title
                <input
                  className={fieldClass}
                  value={frame.title}
                  onChange={(e) =>
                    updateFrame(frameIndex, { title: e.target.value })
                  }
                />
              </label>
              <label className={labelClass}>
                Frame duration (seconds)
                <input
                  className={fieldClass}
                  type="number"
                  min="1"
                  step="1"
                  value={frame.durationSeconds}
                  onChange={(e) =>
                    updateFrame(frameIndex, { durationSeconds: e.target.value })
                  }
                />
              </label>
              <label className={labelClass}>
                Frame source video *
                <input
                  className={fieldClass}
                  type="file"
                  accept="video/*"
                  required={!frame.sourceVideo}
                  onChange={(e) =>
                    void handleUpload(
                      e.target.files?.[0],
                      "templates",
                      (path) => updateFrame(frameIndex, { sourceVideo: path }),
                      `Frame ${frameIndex + 1} video`,
                    )
                  }
                />
                {frame.sourceVideo && (
                  <span className="mt-1 block break-all text-xs text-green-700">
                    {frame.sourceVideo}
                  </span>
                )}
              </label>
              <label className={labelClass}>
                Frame preview image (optional)
                <input
                  className={fieldClass}
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    void handleUpload(
                      e.target.files?.[0],
                      "uploads",
                      (path) => updateFrame(frameIndex, { previewImage: path }),
                      `Frame ${frameIndex + 1} preview`,
                    )
                  }
                />
                {frame.previewImage && (
                  <span className="mt-1 block break-all text-xs text-green-700">
                    {frame.previewImage}
                  </span>
                )}
              </label>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-medium">Default text fields</h4>
                <button
                  type="button"
                  className="text-sm font-medium text-violet-700"
                  onClick={() =>
                    updateFrame(frameIndex, {
                      texts: [
                        ...frame.texts,
                        {
                          ...emptyText(),
                          key: `Text ${frame.texts.length + 1}`,
                        },
                      ],
                    })
                  }
                >
                  + Add text field
                </button>
              </div>
              {frame.texts.map((text, textIndex) => (
                <div
                  key={textIndex}
                  className="grid gap-3 rounded-lg bg-gray-50 p-3 md:grid-cols-2"
                >
                  <label className={labelClass}>
                    Field label / key
                    <input
                      className={fieldClass}
                      value={text.key}
                      onChange={(e) =>
                        updateText(frameIndex, textIndex, {
                          key: e.target.value,
                        })
                      }
                      required
                    />
                  </label>
                  <label className={labelClass}>
                    Default text
                    <input
                      className={fieldClass}
                      value={text.text}
                      onChange={(e) =>
                        updateText(frameIndex, textIndex, {
                          text: e.target.value,
                        })
                      }
                    />
                  </label>
                  <label className={labelClass}>
                    Font name
                    <input
                      className={fieldClass}
                      value={text.font}
                      onChange={(e) =>
                        updateText(frameIndex, textIndex, {
                          font: e.target.value,
                        })
                      }
                      placeholder="DejaVuSans"
                    />
                  </label>
                  <label className={labelClass}>
                    Font size
                    <input
                      className={fieldClass}
                      type="number"
                      min="1"
                      value={text.fontSize}
                      onChange={(e) =>
                        updateText(frameIndex, textIndex, {
                          fontSize: e.target.value,
                        })
                      }
                    />
                  </label>
                  <label className={labelClass}>
                    Font color
                    <input
                      className={`${fieldClass} h-10 p-1`}
                      type="color"
                      value={text.fontColor}
                      onChange={(e) =>
                        updateText(frameIndex, textIndex, {
                          fontColor: e.target.value,
                        })
                      }
                    />
                  </label>
                  <label className={labelClass}>
                    Alignment
                    <select
                      className={fieldClass}
                      value={text.alignment}
                      onChange={(e) =>
                        updateText(frameIndex, textIndex, {
                          alignment: e.target.value,
                        })
                      }
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </label>
                  <label className={labelClass}>
                    X position
                    <input
                      className={fieldClass}
                      value={text.x}
                      onChange={(e) =>
                        updateText(frameIndex, textIndex, { x: e.target.value })
                      }
                      placeholder="center or pixel number"
                    />
                  </label>
                  <label className={labelClass}>
                    Y position
                    <input
                      className={fieldClass}
                      value={text.y}
                      onChange={(e) =>
                        updateText(frameIndex, textIndex, { y: e.target.value })
                      }
                      placeholder="center or pixel number"
                    />
                  </label>
                  <label className={labelClass}>
                    Maximum characters
                    <input
                      className={fieldClass}
                      type="number"
                      min="1"
                      max="2000"
                      value={text.maxLength}
                      onChange={(e) =>
                        updateText(frameIndex, textIndex, {
                          maxLength: e.target.value,
                        })
                      }
                    />
                  </label>
                  <div className="md:col-span-2 rounded-lg border border-violet-200 bg-white p-3">
                    <h5 className="mb-3 text-sm font-semibold text-violet-800">
                      Text animation
                    </h5>
                    <div className="grid gap-3 md:grid-cols-3">
                      <label className={labelClass}>
                        Animation preset
                        <select
                          className={fieldClass}
                          value={text.animation}
                          onChange={(e) =>
                            updateText(frameIndex, textIndex, {
                              animation: e.target
                                .value as TextDraft["animation"],
                            })
                          }
                        >
                          <option value="none">None (static text)</option>
                          <option value="fade-in">Fade In</option>
                          <option value="slide-in">Slide In</option>
                          <option value="zoom-in">Zoom In</option>
                          <option value="typewriter">Typewriter</option>
                        </select>
                      </label>
                      <label className={labelClass}>
                        Duration (seconds)
                        <input
                          className={fieldClass}
                          type="number"
                          min="0.1"
                          max="10"
                          step="0.1"
                          value={text.animationDuration}
                          onChange={(e) =>
                            updateText(frameIndex, textIndex, {
                              animationDuration: e.target.value,
                            })
                          }
                          disabled={text.animation === "none"}
                        />
                      </label>
                      <label className={labelClass}>
                        Delay (seconds)
                        <input
                          className={fieldClass}
                          type="number"
                          min="0"
                          max="120"
                          step="0.1"
                          value={text.animationDelay}
                          onChange={(e) =>
                            updateText(frameIndex, textIndex, {
                              animationDelay: e.target.value,
                            })
                          }
                          disabled={text.animation === "none"}
                        />
                      </label>
                      {text.animation === "slide-in" && (
                        <label className={labelClass}>
                          Slide direction
                          <select
                            className={fieldClass}
                            value={text.animationDirection}
                            onChange={(e) =>
                              updateText(frameIndex, textIndex, {
                                animationDirection: e.target
                                  .value as TextDraft["animationDirection"],
                              })
                            }
                          >
                            <option value="left">From left</option>
                            <option value="right">From right</option>
                            <option value="top">From top</option>
                            <option value="bottom">From bottom</option>
                          </select>
                        </label>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Animation settings are saved with this text field and
                      applied when the invitation video is rendered.
                    </p>
                  </div>
                  {frame.texts.length > 1 && (
                    <div className="flex items-end">
                      <button
                        type="button"
                        className="rounded-lg px-3 py-2 text-sm text-red-600"
                        onClick={() =>
                          updateFrame(frameIndex, {
                            texts: frame.texts.filter(
                              (_, i) => i !== textIndex,
                            ),
                          })
                        }
                      >
                        Remove text field
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-4 rounded-xl border border-gray-200 p-5">
        <label className="flex items-center gap-2 font-semibold">
          <input
            type="checkbox"
            checked={addMusic}
            onChange={(e) => setAddMusic(e.target.checked)}
          />
          Add a music track while creating this template
        </label>
        {addMusic && (
          <div className="grid gap-4 md:grid-cols-3">
            <label className={labelClass}>
              Track title
              <input
                className={fieldClass}
                value={musicTitle}
                onChange={(e) => setMusicTitle(e.target.value)}
                required={addMusic}
              />
            </label>
            <label className={labelClass}>
              Audio file
              <input
                className={fieldClass}
                type="file"
                accept="audio/*"
                required={!musicPath}
                onChange={(e) =>
                  void handleUpload(
                    e.target.files?.[0],
                    "music",
                    setMusicPath,
                    "music track",
                  )
                }
              />
              {musicPath && (
                <span className="mt-1 block break-all text-xs text-green-700">
                  {musicPath}
                </span>
              )}
            </label>
            <label className={labelClass}>
              Duration (seconds, optional)
              <input
                className={fieldClass}
                type="number"
                min="0"
                step="1"
                value={musicDuration}
                onChange={(e) => setMusicDuration(e.target.value)}
              />
            </label>
          </div>
        )}
      </section>

      <div className="flex flex-wrap justify-end gap-3">
        <button
          type="button"
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium"
          onClick={() => (window.location.href = "/admin/customize")}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={busy || Boolean(uploading)}
          className="rounded-lg bg-violet-700 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Creating template…" : "Create template"}
        </button>
      </div>
    </form>
  );
}
