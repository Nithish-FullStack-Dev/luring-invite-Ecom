"use client";

import { useEffect, useState } from "react";

type Animation = "none" | "fade-in" | "slide-in" | "zoom-in" | "typewriter";
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
  animation: Animation;
  animationDuration: string;
  animationDelay: string;
  animationDirection: "left" | "right" | "top" | "bottom";
};
type FrameDraft = {
  title: string;
  sourceVideo: string;
  previewImage: string;
  durationSeconds: string;
  texts: TextDraft[];
};
type Track = {
  id: number;
  title: string;
  path: string;
  duration?: number | null;
  enabled?: boolean;
};
const blankText = (key = "Event Name"): TextDraft => ({
  key,
  text: "",
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
const blankFrame = (i: number): FrameDraft => ({
  title: `Frame ${i}`,
  sourceVideo: "",
  previewImage: "",
  durationSeconds: "5",
  texts: [blankText()],
});
const field =
  "mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100";
const label = "block text-sm font-medium text-gray-700";

async function upload(file: File, kind: "templates" | "uploads" | "music") {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("kind", kind);
  const r = await fetch("/api/admin/media/upload", {
    method: "POST",
    body: fd,
  });
  const j = await r.json();
  if (!r.ok || j.status !== "success")
    throw new Error(j.message || "Upload failed.");
  return String(j.data.path);
}
function toText(item: any, index: number): TextDraft {
  const anim = item?.anim && typeof item.anim === "object" ? item.anim : {};
  const type = ["fade-in", "slide-in", "zoom-in", "typewriter"].includes(
    String(anim.type),
  )
    ? (anim.type as Animation)
    : "none";
  return {
    key: String(item?.key ?? item?.name ?? `Text ${index + 1}`),
    text: String(item?.text ?? ""),
    font: String(item?.fontFile ?? item?.font ?? "DejaVuSans"),
    fontSize: String(item?.fontSize ?? 48),
    fontColor: String(item?.fontColor ?? item?.color ?? "#ffffff"),
    x: String(item?.x ?? item?.position?.x ?? "center"),
    y: String(item?.y ?? item?.position?.y ?? "center"),
    alignment: String(item?.alignment ?? "center"),
    maxLength: String(item?.maxLength ?? 100),
    animation: type,
    animationDuration: String(anim.duration ?? 1),
    animationDelay: String(anim.delay ?? 0),
    animationDirection: ["left", "right", "top", "bottom"].includes(
      String(anim.direction),
    )
      ? anim.direction
      : "bottom",
  };
}
function toFrame(frame: any, index: number): FrameDraft {
  let config = frame?.placeholderConfig ?? frame?.legacyPlaceholderConfig ?? {};
  if (typeof config === "string") {
    try {
      config = JSON.parse(config);
    } catch {
      config = {};
    }
  }
  let texts: any[] = Array.isArray(config?.texts)
    ? config.texts
    : Object.entries(config || {})
        .filter(
          ([, v]: any) =>
            v && typeof v === "object" && (v.type === "text" || "text" in v),
        )
        .map(([key, v]: any) => ({ key, ...v }));
  return {
    title: String(frame?.title ?? `Frame ${index + 1}`),
    sourceVideo: String(frame?.sourceVideo ?? ""),
    previewImage: String(frame?.previewImage ?? ""),
    durationSeconds: String(frame?.durationSeconds ?? 5),
    texts: texts.map(toText).length ? texts.map(toText) : [blankText()],
  };
}

export default function EditCustomize({ id }: { id: number }) {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0");
  const [durationSeconds, setDurationSeconds] = useState("30");
  const [thumbnail, setThumbnail] = useState("");
  const [previewVideo, setPreviewVideo] = useState("");
  const [sourceVideo, setSourceVideo] = useState("");
  const [active, setActive] = useState(true);
  const [frames, setFrames] = useState<FrameDraft[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [trackId, setTrackId] = useState("");
  const [trackTitle, setTrackTitle] = useState("");
  const [trackPath, setTrackPath] = useState("");
  const [trackDuration, setTrackDuration] = useState("");
  const [trackEnabled, setTrackEnabled] = useState(true);
  const [isNewTrack, setIsNewTrack] = useState(false);

  useEffect(() => {
    void load();
  }, [id]);
  async function load() {
    setLoading(true);
    setError("");
    try {
      const [tr, mr] = await Promise.all([
        fetch(`/api/templates/${encodeURIComponent(id)}`, {
          cache: "no-store",
        }),
        fetch("/api/music?includeDisabled=true", { cache: "no-store" }),
      ]);
      const tj = await tr.json();
      if (!tr.ok || tj.status !== "success")
        throw new Error(tj.message || "Unable to load template.");
      const t = tj.data;
      setTitle(String(t.title ?? ""));
      setDescription(String(t.description ?? ""));
      setPrice(String(t.price ?? 0));
      setDurationSeconds(String(t.durationSeconds ?? 30));
      setThumbnail(String(t.thumbnail ?? ""));
      setPreviewVideo(String(t.previewVideo ?? ""));
      setSourceVideo(String(t.sourceVideo ?? ""));
      setActive(t.active !== false);
      setFrames((t.frames ?? []).map(toFrame));
      if (mr.ok) {
        const mj = await mr.json();
        if (mj.status === "success") setTracks(mj.data ?? []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load editor.");
    } finally {
      setLoading(false);
    }
  }
  async function uploadTo(
    file: File | undefined,
    kind: "templates" | "uploads" | "music",
    set: (path: string) => void,
    what: string,
  ) {
    if (!file) return;
    setUploading(what);
    setError("");
    try {
      set(await upload(file, kind));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading("");
    }
  }
  function updateFrame(i: number, patch: Partial<FrameDraft>) {
    setFrames((old) => old.map((f, n) => (n === i ? { ...f, ...patch } : f)));
  }
  function updateText(fi: number, ti: number, patch: Partial<TextDraft>) {
    setFrames((old) =>
      old.map((f, i) =>
        i !== fi
          ? f
          : {
              ...f,
              texts: f.texts.map((t, j) => (j === ti ? { ...t, ...patch } : t)),
            },
      ),
    );
  }
  function chooseTrack(value: string) {
    setTrackId(value);
    const track = tracks.find((t) => String(t.id) === value);
    setIsNewTrack(value === "new");
    if (track) {
      setTrackTitle(track.title);
      setTrackPath(track.path);
      setTrackDuration(String(track.duration ?? ""));
      setTrackEnabled(track.enabled !== false);
    } else if (value === "new") {
      setTrackTitle("");
      setTrackPath("");
      setTrackDuration("");
      setTrackEnabled(true);
    } else {
      setTrackTitle("");
      setTrackPath("");
      setTrackDuration("");
    }
  }
  async function saveTrack() {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      if (!trackTitle.trim() || !trackPath.trim())
        throw new Error("Enter a track title and upload/select an audio file.");
      const payload = {
        title: trackTitle.trim(),
        path: trackPath.trim(),
        duration: trackDuration || null,
        enabled: trackEnabled,
      };
      const r = await fetch(
        isNewTrack ? "/api/music" : `/api/music/${trackId}`,
        {
          method: isNewTrack ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const j = await r.json();
      if (!r.ok || j.status !== "success")
        throw new Error(j.message || "Unable to save music track.");
      const mr = await fetch("/api/music?includeDisabled=true", {
        cache: "no-store",
      });
      const mj = await mr.json();
      if (mj.status === "success") setTracks(mj.data ?? []);
      setTrackId(String(j.data.id));
      setIsNewTrack(false);
      setSuccess("Music track saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save track.");
    } finally {
      setBusy(false);
    }
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      if (!title.trim()) throw new Error("Template title is required.");
      if (!thumbnail || !sourceVideo)
        throw new Error("Thumbnail and main source video are required.");
      if (!frames.length) throw new Error("Add at least one frame.");
      for (let i = 0; i < frames.length; i++)
        if (!frames[i].sourceVideo)
          throw new Error(`Upload a source video for Frame ${i + 1}.`);
      const payload = {
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        durationSeconds: Number(durationSeconds),
        thumbnail,
        previewVideo: previewVideo || null,
        sourceVideo,
        active,
        frames: frames.map((f, i) => ({
          title: f.title.trim() || `Frame ${i + 1}`,
          sourceVideo: f.sourceVideo,
          previewImage: f.previewImage || null,
          durationSeconds: Number(f.durationSeconds || 0) || null,
          placeholderConfig: {
            texts: f.texts.map((t) => ({
              key: t.key.trim() || "Text",
              text: t.text,
              font: t.font || "DejaVuSans",
              fontSize: Number(t.fontSize || 48),
              fontColor: t.fontColor || "#ffffff",
              x: t.x || "center",
              y: t.y || "center",
              alignment: t.alignment || "center",
              maxLength: Number(t.maxLength || 100),
              ...(t.animation !== "none"
                ? {
                    anim: {
                      type: t.animation,
                      duration: Number(t.animationDuration || 1),
                      delay: Number(t.animationDelay || 0),
                      direction: t.animationDirection,
                    },
                  }
                : {}),
            })),
          },
        })),
      };
      const r = await fetch(`/api/templates/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (!r.ok || j.status !== "success")
        throw new Error(j.message || "Unable to update template.");
      setSuccess("Template and frame settings saved successfully.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save template.");
    } finally {
      setBusy(false);
    }
  }

  if (loading)
    return (
      <div className="mx-auto max-w-5xl rounded-xl border p-8 text-sm text-gray-600">
        Loading template editor…
      </div>
    );
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
          <label className={label}>
            Template title *
            <input
              className={field}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={160}
            />
          </label>
          <label className={label}>
            Price (₹) *
            <input
              className={field}
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </label>
          <label className={label}>
            Total duration (seconds) *
            <input
              className={field}
              type="number"
              min="1"
              value={durationSeconds}
              onChange={(e) => setDurationSeconds(e.target.value)}
              required
            />
          </label>
          <label className="flex items-center gap-2 pt-6 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />{" "}
            Publish template on public website
          </label>
        </div>
        <label className={label}>
          Description
          <textarea
            className={field}
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <div className="grid gap-4 md:grid-cols-3">
          <label className={label}>
            Thumbnail image
            <input
              className={field}
              type="file"
              accept="image/*"
              onChange={(e) =>
                void uploadTo(
                  e.target.files?.[0],
                  "uploads",
                  setThumbnail,
                  "thumbnail",
                )
              }
            />
            <span className="mt-1 block break-all text-xs text-green-700">
              Current: {thumbnail || "not uploaded"}
            </span>
          </label>
          <label className={label}>
            Preview video (optional)
            <input
              className={field}
              type="file"
              accept="video/*"
              onChange={(e) =>
                void uploadTo(
                  e.target.files?.[0],
                  "templates",
                  setPreviewVideo,
                  "preview video",
                )
              }
            />
            <span className="mt-1 block break-all text-xs text-green-700">
              Current: {previewVideo || "none"}
            </span>
            <button
              type="button"
              className="mt-1 text-xs text-red-600"
              onClick={() => setPreviewVideo("")}
            >
              Remove preview video
            </button>
          </label>
          <label className={label}>
            Main source video *
            <input
              className={field}
              type="file"
              accept="video/*"
              onChange={(e) =>
                void uploadTo(
                  e.target.files?.[0],
                  "templates",
                  setSourceVideo,
                  "main source video",
                )
              }
            />
            <span className="mt-1 block break-all text-xs text-green-700">
              Current: {sourceVideo || "not uploaded"}
            </span>
          </label>
        </div>
      </section>
      <section className="space-y-4 rounded-xl border border-gray-200 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Frames and editable text</h2>
            <p className="text-sm text-gray-500">
              Edit existing frames, replace their media, change text defaults,
              and add/remove frames.
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg border border-violet-300 px-3 py-2 text-sm font-medium text-violet-700"
            onClick={() =>
              setFrames((old) => [...old, blankFrame(old.length + 1)])
            }
          >
            + Add frame
          </button>
        </div>
        {frames.map((f, fi) => (
          <div
            key={fi}
            className="space-y-4 rounded-lg border border-gray-200 p-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Frame {fi + 1}</h3>
              {frames.length > 1 && (
                <button
                  type="button"
                  className="text-sm text-red-600"
                  onClick={() =>
                    setFrames((old) => old.filter((_, i) => i !== fi))
                  }
                >
                  Remove frame
                </button>
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className={label}>
                Frame title
                <input
                  className={field}
                  value={f.title}
                  onChange={(e) => updateFrame(fi, { title: e.target.value })}
                />
              </label>
              <label className={label}>
                Duration (seconds)
                <input
                  className={field}
                  type="number"
                  min="1"
                  value={f.durationSeconds}
                  onChange={(e) =>
                    updateFrame(fi, { durationSeconds: e.target.value })
                  }
                />
              </label>
              <label className={label}>
                Frame source video
                <input
                  className={field}
                  type="file"
                  accept="video/*"
                  onChange={(e) =>
                    void uploadTo(
                      e.target.files?.[0],
                      "templates",
                      (p) => updateFrame(fi, { sourceVideo: p }),
                      `frame ${fi + 1} video`,
                    )
                  }
                />
                <span className="mt-1 block break-all text-xs text-green-700">
                  Current: {f.sourceVideo || "not uploaded"}
                </span>
              </label>
              <label className={label}>
                Frame preview image
                <input
                  className={field}
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    void uploadTo(
                      e.target.files?.[0],
                      "uploads",
                      (p) => updateFrame(fi, { previewImage: p }),
                      `frame ${fi + 1} preview`,
                    )
                  }
                />
                <span className="mt-1 block break-all text-xs text-green-700">
                  Current: {f.previewImage || "none"}
                </span>
                <button
                  type="button"
                  className="mt-1 text-xs text-red-600"
                  onClick={() => updateFrame(fi, { previewImage: "" })}
                >
                  Remove preview
                </button>
              </label>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Default text fields</h4>
                <button
                  type="button"
                  className="text-sm font-medium text-violet-700"
                  onClick={() =>
                    updateFrame(fi, {
                      texts: [
                        ...f.texts,
                        blankText(`Text ${f.texts.length + 1}`),
                      ],
                    })
                  }
                >
                  + Add text field
                </button>
              </div>
              {f.texts.map((t, ti) => (
                <div
                  key={ti}
                  className="grid gap-3 rounded-lg bg-gray-50 p-3 md:grid-cols-2"
                >
                  <label className={label}>
                    Field label/key
                    <input
                      className={field}
                      value={t.key}
                      onChange={(e) =>
                        updateText(fi, ti, { key: e.target.value })
                      }
                      required
                    />
                  </label>
                  <label className={label}>
                    Default text
                    <input
                      className={field}
                      value={t.text}
                      onChange={(e) =>
                        updateText(fi, ti, { text: e.target.value })
                      }
                    />
                  </label>
                  <label className={label}>
                    Font
                    <input
                      className={field}
                      value={t.font}
                      onChange={(e) =>
                        updateText(fi, ti, { font: e.target.value })
                      }
                    />
                  </label>
                  <label className={label}>
                    Font size
                    <input
                      className={field}
                      type="number"
                      min="1"
                      max="240"
                      value={t.fontSize}
                      onChange={(e) =>
                        updateText(fi, ti, { fontSize: e.target.value })
                      }
                    />
                  </label>
                  <label className={label}>
                    Font color
                    <input
                      className={`${field} h-10 p-1`}
                      type="color"
                      value={
                        /^#[0-9a-f]{6}$/i.test(t.fontColor)
                          ? t.fontColor
                          : "#ffffff"
                      }
                      onChange={(e) =>
                        updateText(fi, ti, { fontColor: e.target.value })
                      }
                    />
                  </label>
                  <label className={label}>
                    Alignment
                    <select
                      className={field}
                      value={t.alignment}
                      onChange={(e) =>
                        updateText(fi, ti, { alignment: e.target.value })
                      }
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </label>
                  <label className={label}>
                    X position
                    <input
                      className={field}
                      value={t.x}
                      onChange={(e) =>
                        updateText(fi, ti, { x: e.target.value })
                      }
                      placeholder="center or pixel/expression"
                    />
                  </label>
                  <label className={label}>
                    Y position
                    <input
                      className={field}
                      value={t.y}
                      onChange={(e) =>
                        updateText(fi, ti, { y: e.target.value })
                      }
                      placeholder="center or pixel/expression"
                    />
                  </label>
                  <label className={label}>
                    Maximum characters
                    <input
                      className={field}
                      type="number"
                      min="1"
                      max="2000"
                      value={t.maxLength}
                      onChange={(e) =>
                        updateText(fi, ti, { maxLength: e.target.value })
                      }
                    />
                  </label>
                  <div className="md:col-span-2 rounded-lg border border-violet-200 bg-white p-3">
                    <h5 className="mb-3 text-sm font-semibold text-violet-800">
                      Text animation
                    </h5>
                    <div className="grid gap-3 md:grid-cols-3">
                      <label className={label}>
                        Preset
                        <select
                          className={field}
                          value={t.animation}
                          onChange={(e) =>
                            updateText(fi, ti, {
                              animation: e.target.value as Animation,
                            })
                          }
                        >
                          <option value="none">None / static</option>
                          <option value="fade-in">Fade In</option>
                          <option value="slide-in">Slide In</option>
                          <option value="zoom-in">Zoom In</option>
                          <option value="typewriter">Typewriter</option>
                        </select>
                      </label>
                      <label className={label}>
                        Duration (seconds)
                        <input
                          className={field}
                          type="number"
                          min="0.1"
                          max="10"
                          step="0.1"
                          value={t.animationDuration}
                          disabled={t.animation === "none"}
                          onChange={(e) =>
                            updateText(fi, ti, {
                              animationDuration: e.target.value,
                            })
                          }
                        />
                      </label>
                      <label className={label}>
                        Delay (seconds)
                        <input
                          className={field}
                          type="number"
                          min="0"
                          max="120"
                          step="0.1"
                          value={t.animationDelay}
                          disabled={t.animation === "none"}
                          onChange={(e) =>
                            updateText(fi, ti, {
                              animationDelay: e.target.value,
                            })
                          }
                        />
                      </label>
                      {t.animation === "slide-in" && (
                        <label className={label}>
                          Direction
                          <select
                            className={field}
                            value={t.animationDirection}
                            onChange={(e) =>
                              updateText(fi, ti, {
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
                  </div>
                  {f.texts.length > 1 && (
                    <div className="md:col-span-2">
                      <button
                        type="button"
                        className="text-sm text-red-600"
                        onClick={() =>
                          updateFrame(fi, {
                            texts: f.texts.filter((_, i) => i !== ti),
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
        <h2 className="text-lg font-semibold">Music library</h2>
        <p className="text-sm text-gray-500">
          Edit an existing music track or add a new one. Music tracks are global
          library entries; select the track your render/customization flow
          should use.
        </p>
        <label className={label}>
          Choose music track
          <select
            className={field}
            value={trackId}
            onChange={(e) => chooseTrack(e.target.value)}
          >
            <option value="">Choose a track to edit…</option>
            {tracks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
                {t.enabled === false ? " (disabled)" : ""}
              </option>
            ))}
            <option value="new">+ Add new music track</option>
          </select>
        </label>
        {(trackId || isNewTrack) && (
          <div className="grid gap-4 md:grid-cols-2">
            <label className={label}>
              Track title
              <input
                className={field}
                value={trackTitle}
                onChange={(e) => setTrackTitle(e.target.value)}
                required
              />
            </label>
            <label className={label}>
              Replace audio file (optional)
              <input
                className={field}
                type="file"
                accept="audio/*"
                onChange={(e) =>
                  void uploadTo(
                    e.target.files?.[0],
                    "music",
                    setTrackPath,
                    "music track",
                  )
                }
              />
              <span className="mt-1 block break-all text-xs text-green-700">
                Current: {trackPath || "not uploaded"}
              </span>
            </label>
            <label className={label}>
              Duration in seconds
              <input
                className={field}
                type="number"
                min="0"
                step="1"
                value={trackDuration}
                onChange={(e) => setTrackDuration(e.target.value)}
              />
            </label>
            <label className="flex items-center gap-2 pt-6 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={trackEnabled}
                onChange={(e) => setTrackEnabled(e.target.checked)}
              />{" "}
              Enabled for customers
            </label>
            <div className="md:col-span-2">
              <button
                type="button"
                disabled={busy || Boolean(uploading)}
                onClick={() => void saveTrack()}
                className="rounded-lg border border-violet-300 px-4 py-2 text-sm font-semibold text-violet-700 disabled:opacity-50"
              >
                {isNewTrack ? "Add music track" : "Save music changes"}
              </button>
            </div>
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
          className="rounded-lg bg-violet-700 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save all template changes"}
        </button>
      </div>
    </form>
  );
}
