"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Play, X, PencilLine, Star, Film } from "lucide-react";
import { mediaUrl } from "@/lib/client-api";

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
  frames: { id: number; title?: string | null; previewImage?: string | null }[];
};

export default function TemplatePreviewPage() {
  const params = useParams<{ category: string; id: string }>();
  const id = params?.id;
  const category = params?.category || "birthday";
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showVideo, setShowVideo] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/templates/${id}`, { signal: controller.signal, cache: "no-store" });
        const result = await response.json();
        if (!response.ok || result.status !== "success") throw new Error(result.message || "Template not found.");
        setTemplate(result.data);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Unable to load this template.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void load();
    return () => controller.abort();
  }, [id]);

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center text-gray-500">Loading template...</div>;
  if (error || !template) return <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center"><h1 className="text-2xl font-semibold">Unable to load template</h1><p className="mt-3 text-sm text-red-600">{error || "Template not found."}</p><Link href="/" className="mt-6 rounded-lg bg-[#a86dcd] px-5 py-3 font-semibold text-white">Browse templates</Link></div>;

  const sampleVideo = template.previewVideo || template.sourceVideo;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
      <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#995fc0]"><ArrowLeft size={16} /> Back to templates</Link>
      <div className="grid grid-cols-1 items-start gap-9 md:grid-cols-2">
        <div className="mx-auto w-full max-w-md">
          <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 shadow-lg">
            {template.thumbnail ? <img src={mediaUrl(template.thumbnail)} alt={template.title} className="max-h-[760px] w-full rounded-xl object-contain" /> : <div className="flex aspect-[9/16] items-center justify-center text-gray-400">Thumbnail unavailable</div>}
            {sampleVideo && (
              <button type="button" onClick={() => { setVideoFailed(false); setShowVideo(true); }} className="absolute inset-0 flex items-center justify-center bg-black/10 transition hover:bg-black/20" aria-label="Play video preview">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#a22e37] shadow-lg"><Play size={29} fill="currentColor" /></span>
              </button>
            )}
          </div>
          <p className="mt-3 text-center text-xs text-gray-500">The preview image may include artwork from the original template.</p>
        </div>

        <div className="pt-2">
          <div className="mb-4 flex flex-wrap gap-2">{template.categories.map((item) => <span key={item.slug} className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-800">{item.name}</span>)}</div>
          <h1 className="page-title text-3xl font-semibold leading-tight sm:text-4xl">{template.title}</h1>
          <p className="mt-4 leading-7 text-gray-600">{template.description || "Make this invitation your own with names, event dates, family details and background music."}</p>

          <div className="mt-6 rounded-xl border border-purple-100 bg-white p-5">
            <div className="flex items-end justify-between gap-4">
              <div><p className="text-sm text-gray-500">Customize your invitation</p><p className="mt-1 text-3xl font-bold text-[#985cc0]">₹{template.price.toLocaleString("en-IN")}</p></div>
              <div className="text-right text-sm text-gray-500"><p className="flex items-center justify-end gap-1"><Star size={15} className="fill-amber-400 text-amber-400" /> Personalizable</p><p className="mt-1 flex items-center justify-end gap-1"><Film size={15} /> {template.frames.length} frame{template.frames.length === 1 ? "" : "s"}</p></div>
            </div>
            <Link href={`/customize/${category}/${template.id}`} className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#a86dcd] to-[#8e51b4] px-5 py-3 font-semibold text-white shadow-sm hover:brightness-105"><PencilLine size={18} /> Customize This Template</Link>
          </div>

          <h2 className="mt-8 text-lg font-semibold">How it works</h2>
          <ul className="mt-3 space-y-3 text-sm leading-6 text-gray-600">
            <li>1. Edit each frame's text, names, dates and invitation details.</li>
            <li>2. Select a background music track or choose no music.</li>
            <li>3. Generate your personalized MP4 and preview or download it.</li>
          </ul>
        </div>
      </div>

      {showVideo && sampleVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setShowVideo(false)}>
          <div className="relative w-full max-w-md rounded-xl bg-black p-2" onClick={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => setShowVideo(false)} className="absolute -right-3 -top-3 z-10 rounded-full bg-white p-2 text-gray-800 shadow" aria-label="Close video"><X size={20} /></button>
            {!videoFailed ? <video key={mediaUrl(sampleVideo)} controls autoPlay playsInline className="max-h-[82vh] w-full rounded-lg" onError={() => setVideoFailed(true)}><source src={mediaUrl(sampleVideo)} type="video/mp4" />Your browser does not support this video.</video> : <div className="p-8 text-center text-white"><p>Sample video not found.</p><p className="mt-2 text-sm text-gray-300">Restore the source MP4 to the path configured in the template seed data.</p></div>}
          </div>
        </div>
      )}
    </div>
  );
}
