"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import TemplateCanvasEditor from "@/component/customize/TemplateCanvasEditor";
import {
  frameDraftFromConfig,
  templateSavePayload,
  type TemplateFrameDraft as FrameDraft,
} from "@/lib/template-editor";
import { selectedTemplateCategorySlug } from "@/lib/template-categories";
type Track = {
  id: string;
  title: string;
  path: string;
  duration?: number | null;
  enabled?: boolean;
};
async function upload(file: File, kind: "templates" | "uploads" | "music" | "fonts") {
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

export default function EditCustomize({ id }: { id: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [categorySlug, setCategorySlug] = useState<string | null | undefined>();
  const [price, setPrice] = useState("0");
  const [thumbnail, setThumbnail] = useState("");
  const [previewVideo, setPreviewVideo] = useState("");
  const [sourceVideo, setSourceVideo] = useState("");
  const [active, setActive] = useState(true);
  const [frames, setFrames] = useState<FrameDraft[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedMusicIds, setSelectedMusicIds] = useState<string[]>([]);
  const savedSnapshot = useRef<string | null>(null);
  const currentSnapshot = useRef("");

  const load = useCallback(async () => {
    try {
      const [tr, mr] = await Promise.all([
        fetch(`/api/templates/${encodeURIComponent(id)}?manage=true`, {
          cache: "no-store",
        }),
        fetch("/api/music?includeDisabled=true", { cache: "no-store" }),
      ]);
      const tj = await tr.json();
      if (!tr.ok || tj.status !== "success")
        throw new Error(tj.message || "Unable to load template.");
      setError("");
      const t = tj.data;
      setTitle(String(t.title ?? ""));
      setSlug(String(t.slug ?? ""));
      setDescription(String(t.description ?? ""));
      setCategorySlug(selectedTemplateCategorySlug(t.categories ?? []));
      setPrice(String(t.price ?? 0));
      setThumbnail(String(t.thumbnail ?? ""));
      setPreviewVideo(String(t.previewVideo ?? ""));
      setSourceVideo(String(t.sourceVideo ?? ""));
      setActive(t.active !== false);
      setFrames((t.frames ?? []).map(frameDraftFromConfig));
      if (mr.ok) {
        const mj = await mr.json();
        if (mj.status === "success") {
          const availableTracks: Track[] = mj.data ?? [];
          setTracks(availableTracks);
          setSelectedMusicIds(
            t.musicConfigured
              ? (t.musicTracks ?? []).filter((track: Track) => track.enabled !== false).map((track: Track) => track.id)
              : availableTracks.filter((track) => track.enabled !== false).map((track) => track.id),
          );
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load editor.");
    } finally {
      setLoading(false);
    }
  }, [id]);
  useEffect(() => {
    // The async fetch updates the editor after the template response arrives.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);
  async function uploadForStudio(file: File, kind: "templates" | "uploads" | "music" | "fonts"): Promise<string> {
    setUploading(file.name);
    setError("");
    try {
      return await upload(file, kind);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Upload failed.";
      setError(message);
      throw e;
    } finally {
      setUploading("");
    }
  }

  function buildPayload() {
    return templateSavePayload({
      title,
      slug,
      description,
      categorySlug,
      price,
      durationSeconds: String(Math.max(1, Math.round(frames.reduce((sum, frame) => sum + (Number(frame.durationSeconds) || 0), 0)))),
      thumbnail,
      previewVideo,
      sourceVideo,
      active,
      frames,
      musicTrackIds: selectedMusicIds,
    });
  }

  function getEditorSnapshot() {
    return JSON.stringify(buildPayload());
  }

  useEffect(() => {
    currentSnapshot.current = getEditorSnapshot();
    if (!loading && savedSnapshot.current === null) savedSnapshot.current = currentSnapshot.current;
  });
  useEffect(() => {
    const warnIfDirty = (event: BeforeUnloadEvent) => {
      if (busy || savedSnapshot.current === null || currentSnapshot.current === savedSnapshot.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnIfDirty);
    return () => window.removeEventListener("beforeunload", warnIfDirty);
  }, [busy]);

  async function saveTemplate(): Promise<boolean> {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const payload = buildPayload();
      if (!payload.title.trim()) throw new Error("Template title is required.");
      if (!payload.thumbnail)
        throw new Error("Thumbnail is required.");
      if (!payload.frames.length) throw new Error("Add at least one frame.");
      for (let i = 0; i < payload.frames.length; i++)
        if (!payload.frames[i].sourceVideo)
          throw new Error(`Upload a source video for Frame ${i + 1}.`);
      const r = await fetch(`/api/templates/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (!r.ok || j.status !== "success")
        throw new Error(j.message || "Unable to update template.");
      savedSnapshot.current = JSON.stringify(payload);
      setSuccess("Template and frame settings saved successfully.");
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save template.");
    } finally {
      setBusy(false);
    }
    return false;
  }

  if (loading)
    return (
      <div className="mx-auto max-w-5xl rounded-xl border p-8 text-sm text-gray-600">
        Loading template editor…
      </div>
    );
  return (
    <TemplateCanvasEditor
      templateId={id}
      frames={frames}
      onChange={setFrames}
      title={title}
      slug={slug}
      description={description}
      price={price}
      categorySlug={categorySlug ?? ""}
      thumbnail={thumbnail}
      previewVideo={previewVideo}
      sourceVideo={sourceVideo}
      active={active}
      musicTracks={tracks}
      selectedMusicIds={selectedMusicIds}
      saving={busy}
      uploading={uploading}
      error={error}
      statusMessage={success}
      onDetailsChange={(patch) => {
        if (patch.title !== undefined) setTitle(patch.title);
        if (patch.slug !== undefined) setSlug(patch.slug);
        if (patch.description !== undefined) setDescription(patch.description);
        if (patch.price !== undefined) setPrice(patch.price);
        if (patch.categorySlug !== undefined) setCategorySlug(patch.categorySlug);
        if (patch.thumbnail !== undefined) setThumbnail(patch.thumbnail);
        if (patch.previewVideo !== undefined) setPreviewVideo(patch.previewVideo);
        if (patch.sourceVideo !== undefined) setSourceVideo(patch.sourceVideo);
        if (patch.active !== undefined) setActive(patch.active);
      }}
      onSelectedMusicIdsChange={setSelectedMusicIds}
      onUpload={uploadForStudio}
      onSave={saveTemplate}
      onMusicCreated={(track) => {
        setTracks((current) => [...current.filter((item) => item.id !== track.id), track]);
        setSelectedMusicIds((current) => [...new Set([...current, track.id])]);
      }}
      onNewTemplate={() => {
        if (savedSnapshot.current !== currentSnapshot.current && !window.confirm("Discard unsaved template changes and start a new template?")) return;
        router.push("/admin/add-customize");
      }}
    />
  );
}
