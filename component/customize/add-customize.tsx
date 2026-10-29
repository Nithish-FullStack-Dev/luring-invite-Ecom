"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import TemplateCanvasEditor from "@/component/customize/TemplateCanvasEditor";
import {
  blankFrame as emptyFrame,
  templateSavePayload,
  type TemplateFrameDraft as FrameDraft,
} from "@/lib/template-editor";

type UploadKind = "templates" | "uploads" | "music" | "fonts";
type MusicTrack = { id: string; title: string; path: string; duration?: number | null; enabled: boolean };

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
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [categorySlug, setCategorySlug] = useState<string | null>(null);
  const price = "0";
  const [thumbnail, setThumbnail] = useState("");
  const [previewVideo, setPreviewVideo] = useState("");
  const [sourceVideo, setSourceVideo] = useState("");
  const [active, setActive] = useState(true);
  const [frames, setFrames] = useState<FrameDraft[]>([emptyFrame(1)]);
  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>([]);
  const [selectedMusicIds, setSelectedMusicIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const savedSnapshot = useRef<string | null>(null);
  const currentSnapshot = useRef("");

  useEffect(() => {
    void fetch("/api/music?includeDisabled=true", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (response.ok && result.status === "success") {
          setMusicTracks(result.data || []);
        }
      })
      .catch(() => undefined);
  }, []);

  async function uploadForStudio(file: File, kind: UploadKind): Promise<string> {
    setError("");
    setUploading(file.name);
    try {
      return await uploadFile(file, kind);
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
    if (savedSnapshot.current === null) savedSnapshot.current = currentSnapshot.current;
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
      if (!payload.title.trim()) throw new Error("Enter a template title.");
      if (!payload.thumbnail) throw new Error("Upload a thumbnail.");
      if (payload.frames.length === 0) throw new Error("Add at least one frame.");

      for (let i = 0; i < payload.frames.length; i++) {
        if (!payload.frames[i].sourceVideo) {
          throw new Error(`Upload a source video for Frame ${i + 1}.`);
        }
      }

      const response = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok || result.status !== "success") {
        throw new Error(result.message || "Could not create the template.");
      }

      savedSnapshot.current = JSON.stringify(payload);
      setSuccess(`Template "${payload.title}" created successfully.`);
      router.push(`/admin/customize/${result.data.id}/edit`);
      return true;
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not create the template.",
      );
    } finally {
      setBusy(false);
    }
    return false;
  }

  return (
    <TemplateCanvasEditor
      frames={frames}
      onChange={setFrames}
      title={title}
      slug={slug}
      description={description}
      categorySlug={categorySlug ?? ""}
      thumbnail={thumbnail}
      previewVideo={previewVideo}
      sourceVideo={sourceVideo}
      active={active}
      musicTracks={musicTracks}
      selectedMusicIds={selectedMusicIds}
      saving={busy}
      uploading={uploading}
      error={error}
      statusMessage={success}
      onDetailsChange={(patch) => {
        if (patch.title !== undefined) setTitle(patch.title);
        if (patch.slug !== undefined) setSlug(patch.slug);
        if (patch.description !== undefined) setDescription(patch.description);
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
        setMusicTracks((current) => [...current.filter((item) => item.id !== track.id), { ...track, enabled: track.enabled !== false }]);
        setSelectedMusicIds((current) => [...new Set([...current, track.id])]);
      }}
    />
  );
}
