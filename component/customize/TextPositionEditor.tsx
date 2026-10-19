"use client";

import { useRef, useState } from "react";
import { mediaUrl } from "@/lib/client-api";

type PositionText = {
  key?: string;
  label?: string;
  text?: string;
  fontSize?: string | number;
  fontColor?: string;
  color?: string;
  alignment?: string;
  x?: string | number;
  y?: string | number;
  position?: { x?: string | number; y?: string | number };
};

type Props = {
  frame: { title?: string; previewImage?: string; sourceVideo?: string };
  texts: PositionText[];
  onChange: (index: number, patch: { x: string; y: string }) => void;
};

function percent(value: unknown, axis: "x" | "y") {
  const raw = String(value ?? "center").trim().toLowerCase();
  if (["center", "centre", "middle"].includes(raw)) return 50;
  if (raw.endsWith("%")) {
    const value = Number(raw.slice(0, -1));
    return Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 50;
  }
  if (/^-?\d+(\.\d+)?$/.test(raw)) {
    const base = axis === "x" ? 1080 : 1920;
    return Math.min(100, Math.max(0, (Number(raw) / base) * 100));
  }
  return 50;
}

export default function TextPositionEditor({ frame, texts, onChange }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const draggingIndex = useRef<number | null>(null);
  const [aspectRatio, setAspectRatio] = useState("9 / 16");

  function rememberAspect(width: number, height: number) {
    if (width > 0 && height > 0) setAspectRatio(`${width} / ${height}`);
  }

  function moveText(event: React.PointerEvent<HTMLDivElement>) {
    const index = draggingIndex.current;
    const bounds = stageRef.current?.getBoundingClientRect();
    if (index === null || !bounds || bounds.width === 0 || bounds.height === 0)
      return;
    const x = Math.min(100, Math.max(0, ((event.clientX - bounds.left) / bounds.width) * 100));
    const y = Math.min(100, Math.max(0, ((event.clientY - bounds.top) / bounds.height) * 100));
    onChange(index, { x: `${x.toFixed(2)}%`, y: `${y.toFixed(2)}%` });
  }

  return (
    <div className="rounded-lg border border-violet-200 bg-white p-3">
      <p className="mb-2 text-sm font-semibold text-violet-800">
        Drag text on the scene preview to set its position
      </p>
      <div
        ref={stageRef}
        className="relative mx-auto w-full max-w-[320px] touch-none overflow-hidden rounded-md bg-slate-900"
        style={{ aspectRatio }}
        onPointerMove={moveText}
        onPointerUp={() => (draggingIndex.current = null)}
        onPointerCancel={() => (draggingIndex.current = null)}
      >
        {frame.previewImage ? (
          <img
            src={mediaUrl(frame.previewImage)}
            alt={`${frame.title || "Scene"} preview`}
            draggable={false}
            onLoad={(event) =>
              rememberAspect(
                event.currentTarget.naturalWidth,
                event.currentTarget.naturalHeight,
              )
            }
            className="absolute inset-0 h-full w-full object-contain"
          />
        ) : frame.sourceVideo ? (
          <video
            src={mediaUrl(frame.sourceVideo)}
            muted
            loop
            playsInline
            controls
            preload="metadata"
            onLoadedMetadata={(event) =>
              rememberAspect(
                event.currentTarget.videoWidth,
                event.currentTarget.videoHeight,
              )
            }
            className="absolute inset-0 h-full w-full object-contain"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-white/60">
            Upload a scene video or preview image to position text.
          </div>
        )}
        {texts.map((text, index) => {
          const label = String(text.label ?? text.key ?? `Text ${index + 1}`);
          const x = percent(text.x ?? text.position?.x, "x");
          const y = percent(text.y ?? text.position?.y, "y");
          const rawAlignment = String(text.alignment ?? "center");
          const alignment: "left" | "center" | "right" =
            rawAlignment === "left" || rawAlignment === "right" ? rawAlignment : "center";
          return (
            <div
              key={`${text.key}-${index}`}
              role="button"
              tabIndex={0}
              aria-label={`Drag ${label} to position`}
              onPointerDown={(event) => {
                event.preventDefault();
                draggingIndex.current = index;
                event.currentTarget.setPointerCapture(event.pointerId);
              }}
              onPointerUp={() => (draggingIndex.current = null)}
              className="absolute z-10 max-w-[90%] cursor-move select-none whitespace-pre-wrap rounded border border-dashed border-white/80 bg-black/20 px-1.5 py-0.5 text-center shadow-[0_1px_4px_rgba(0,0,0,.8)] outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: `translate(${alignment === "left" ? "0" : alignment === "right" ? "-100%" : "-50%"}, -50%)`,
                color: String(text.fontColor ?? text.color ?? "#ffffff"),
                fontSize: `${Math.max(8, Math.min(42, Number(text.fontSize) / 3 || 16))}px`,
                textAlign: alignment,
              }}
            >
              {String(text.text ?? "") || label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
