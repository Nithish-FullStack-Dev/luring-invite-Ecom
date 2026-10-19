"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { mediaUrl } from "@/lib/client-api";
import {
  blankFrame,
  blankText,
  type TemplateFrameDraft,
  type TemplateTextDraft,
} from "@/lib/template-editor";
import {
  easeProgress,
  resolveSceneTransition,
  resolveTextMotion,
  type SceneTransition,
} from "@/lib/text-motion";
import {
  FONT_REGISTRY,
  browserFontFaceCss,
  fontFamilyForEditor,
  resolveFontAsset,
} from "@/lib/font-registry";
import { revealPrefix } from "@/lib/text-reveal";
import {
  compositionPositionPercent,
  wrapInvitationText,
} from "@/lib/text-layout";

const entrances = [
  "none",
  "fade-in",
  "slide-in",
  "zoom-in",
  "scale-fade",
  "cinematic-title",
  "rotate-in",
  "overshoot",
  "typewriter",
  "word-reveal",
] as const;
const exits = [
  "none",
  "fade-out",
  "slide-out",
  "zoom-out",
  "rotate-out",
] as const;
type Props = {
  frames: TemplateFrameDraft[];
  onChange: (frames: TemplateFrameDraft[]) => void;
  templateId?: number;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  previewVideo: string;
  sourceVideo: string;
  active: boolean;
  musicTracks: StudioTrack[];
  selectedMusicIds: string[];
  saving: boolean;
  uploading?: string;
  error?: string;
  statusMessage?: string;
  onDetailsChange: (patch: Partial<StudioDetails>) => void;
  onSelectedMusicIdsChange: (ids: string[]) => void;
  onUpload: (
    file: File,
    kind: "templates" | "uploads" | "music" | "fonts",
  ) => Promise<string>;
  onSave: () => Promise<boolean>;
  onMusicCreated: (track: StudioTrack) => void;
  onNewTemplate?: () => void;
};
type StudioTrack = {
  id: string;
  title: string;
  path: string;
  duration?: number | null;
  enabled?: boolean;
};
type Asset = { path: string; name: string; size: number; modifiedAt: number };
type StudioDetails = {
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  previewVideo: string;
  sourceVideo: string;
  active: boolean;
};

function num(
  value: string | undefined,
  fallback: number,
  min: number,
  max: number,
) {
  const parsed = Number(value);
  return Number.isFinite(parsed)
    ? Math.min(max, Math.max(min, parsed))
    : fallback;
}
function maxStageDuration(duration: number) {
  return Math.max(0.1, duration * 0.45);
}
function hasExitAnimation(text: TemplateTextDraft) {
  return (
    text.exitAnimation !== "none" ||
    ["fade-in-out", "slide-in-out", "zoom-in-out"].includes(text.animation)
  );
}
function clampTextTiming(
  text: TemplateTextDraft,
  duration: number,
): Partial<TemplateTextDraft> {
  const scene = Math.max(0.1, duration);
  const enterDuration = Math.min(
    num(text.animationDuration, 1, 0.1, 10),
    maxStageDuration(scene),
  );
  const exitDuration = Math.min(
    num(text.exitDuration, 0.6, 0.1, 10),
    maxStageDuration(scene),
  );
  const hasExit = hasExitAnimation(text);
  const delayLimit = Math.max(
    0,
    scene - enterDuration - (hasExit ? exitDuration : 0),
  );
  const animationDelay = Math.min(
    num(text.animationDelay, 0, 0, scene),
    delayLimit,
  );
  const visibleStart = Math.min(num(text.visibleStart, 0, 0, scene), scene);
  const visibleEnd = Math.max(
    visibleStart,
    Math.min(num(text.visibleEnd, scene, 0, scene), scene),
  );
  const latestExit = Math.max(0, scene - exitDuration);
  const earliestExit = Math.min(animationDelay + enterDuration, latestExit);
  const exitStart = Math.max(
    earliestExit,
    Math.min(num(text.exitStart, latestExit, 0, scene), latestExit),
  );
  return {
    animationDuration: String(enterDuration),
    animationDelay: String(animationDelay),
    visibleStart: String(visibleStart),
    visibleEnd: String(visibleEnd),
    exitDuration: String(exitDuration),
    exitStart: String(exitStart),
  };
}
function asPercent(
  value: string | undefined,
  fallback: number,
  axis: "x" | "y",
  compositionDimension: number,
) {
  return compositionPositionPercent(
    value,
    compositionDimension,
    fallback,
    axis,
  );
}
function pct(value: number) {
  return `${Math.min(100, Math.max(0, value)).toFixed(2)}%`;
}
function titlePreset(value: string) {
  if (value === "typewriter" || value === "character-reveal")
    return "Letter by letter";
  if (value === "word-reveal") return "Word by word";
  return value
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
function isTextReveal(value: string) {
  return ["typewriter", "character-reveal", "word-reveal"].includes(value);
}
function previewRevealText(
  text: TemplateTextDraft,
  time: number,
  duration: number,
  compositionWidth: number,
) {
  const animation = resolveTextMotion(
    {
      type: text.animation,
      entrance: {
        type: text.animation,
        duration: text.animationDuration,
        start: text.animationDelay,
        easing: text.animationEasing,
      },
    },
    duration,
  );
  if (!isTextReveal(animation.type)) return text.text;
  const progress = easeProgress(
    (time - animation.delay) / Math.max(0.1, animation.duration),
    animation.easing,
  );
  const mode = animation.type === "word-reveal" ? "word" : "letter";
  const wrapped = wrapInvitationText(
    text.text,
    num(text.fontSize, 48, 6, 240),
    (compositionWidth * num(text.boxWidth, 90, 10, 100)) / 100,
  );
  return wrapped
    .split("\n")
    .map((line) => revealPrefix(line, mode, progress))
    .join("\n");
}
function isImagePath(value: string) {
  return /\.(avif|gif|jpe?g|png|webp)$/i.test(value);
}
function outputComposition(width: number, height: number) {
  const scale = Math.min(1080 / Math.max(2, width), 1920 / Math.max(2, height));
  return {
    width: Math.max(2, Math.round((width * scale) / 2) * 2),
    height: Math.max(2, Math.round((height * scale) / 2) * 2),
  };
}
function createLayerId() {
  return `text_${globalThis.crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
}
const transitionOptions: { value: SceneTransition["type"]; label: string }[] = [
  { value: "hard-cut", label: "Hard cut" },
  { value: "cross-dissolve", label: "Cross dissolve" },
  { value: "cinematic-dissolve", label: "Cinematic dissolve" },
  { value: "fade-black", label: "Fade through black" },
  { value: "fade-white", label: "Fade through white" },
  { value: "slide", label: "Slide" },
  { value: "push", label: "Push" },
  { value: "zoom", label: "Zoom in" },
  { value: "smooth-wipe", label: "Smooth wipe" },
  { value: "directional-reveal", label: "Directional reveal" },
  { value: "blur-dissolve", label: "Blur dissolve" },
];
function frameTransition(frame: TemplateFrameDraft, maxDuration: number) {
  return resolveSceneTransition(
    frame.configExtras.transitionToNext,
    maxDuration,
  );
}
function transitionPreviewStyles(
  transition: SceneTransition,
  progress: number,
) {
  const p = Math.max(0, Math.min(1, progress));
  const direction = transition.direction;
  const vector =
    direction === "left"
      ? [-100, 0]
      : direction === "right"
        ? [100, 0]
        : direction === "top"
          ? [0, -100]
          : [0, 100];
  const incomingVector = [-vector[0], -vector[1]];
  const slide = transition.type === "slide" || transition.type === "push";
  const wipe =
    transition.type === "smooth-wipe" ||
    transition.type === "directional-reveal";
  const fadeThrough =
    transition.type === "fade-black" || transition.type === "fade-white";
  const crossDissolve =
    transition.type === "cross-dissolve" ||
    transition.type === "cinematic-dissolve";
  const outOpacity = fadeThrough
    ? p < 0.5
      ? 1 - p * 2
      : 0
    : crossDissolve ||
        transition.type === "zoom" ||
        transition.type === "blur-dissolve"
      ? 1 - p
      : 1;
  const inOpacity = fadeThrough
    ? p > 0.5
      ? (p - 0.5) * 2
      : 0
    : crossDissolve ||
        transition.type === "zoom" ||
        transition.type === "blur-dissolve"
      ? p
      : 1;
  const outTransform =
    transition.type === "slide"
      ? `translate(${vector[0] * p}%, ${vector[1] * p}%)`
      : transition.type === "zoom"
        ? `scale(${1 + p * 0.08})`
        : "none";
  const inTransform = slide
    ? `translate(${incomingVector[0] * (1 - p)}%, ${incomingVector[1] * (1 - p)}%)`
    : transition.type === "zoom"
      ? `scale(${1.08 - p * 0.08})`
      : "none";
  const incomingClip = wipe
    ? `inset(${direction === "bottom" ? 0 : direction === "top" ? `${(1 - p) * 100}%` : "0"} ${direction === "left" ? `${(1 - p) * 100}%` : direction === "right" ? 0 : "0"} ${direction === "top" ? 0 : direction === "bottom" ? `${(1 - p) * 100}%` : "0"} ${direction === "right" ? `${(1 - p) * 100}%` : "0"})`
    : undefined;
  const blur =
    transition.type === "blur-dissolve"
      ? `${Math.sin(p * Math.PI) * 12}px`
      : "0px";
  return {
    outgoing: { opacity: outOpacity, transform: outTransform },
    incoming: {
      opacity: inOpacity,
      transform: inTransform,
      clipPath: incomingClip,
      filter: blur === "0px" ? undefined : `blur(${blur})`,
    },
    backplate: fadeThrough
      ? transition.type === "fade-black"
        ? "#000000"
        : "#ffffff"
      : "#000000",
  };
}

function previewMotion(
  text: TemplateTextDraft,
  time: number,
  duration: number,
  canvasWidth: number,
  canvasHeight: number,
  boxWidth: number,
  boxHeight: number,
  compositionWidth: number,
  compositionHeight: number,
): React.CSSProperties {
  const animation = resolveTextMotion(
    {
      type: text.animation,
      entrance: {
        type: text.animation,
        duration: text.animationDuration,
        start: text.animationDelay,
        direction: text.animationDirection,
        easing: text.animationEasing,
      },
      exit: {
        type: text.exitAnimation,
        duration: text.exitDuration,
        start: text.exitStart,
        direction: text.animationDirection,
        easing: text.exitEasing,
      },
      emphasis: {
        type: text.emphasisAnimation,
        intensity: text.emphasisIntensity,
      },
    },
    duration,
  );
  const {
    type,
    duration: inDuration,
    delay: start,
    direction,
    easing,
    exitType,
    exitDuration: outDuration,
    exitStart: end,
    exitEasing,
    emphasisType,
    intensity,
  } = animation;
  const visibleStart = num(text.visibleStart, 0, 0, duration);
  const visibleEnd = num(text.visibleEnd, duration, visibleStart, duration);
  let opacity = num(text.opacity, 1, 0, 1);
  let dx = 0;
  let dy = 0;
  let scale = 1;
  let rotation = num(text.rotation, 0, -180, 180);
  const progress = (from: number, span: number, ease = easing) =>
    easeProgress((time - from) / Math.max(0.1, span), ease);
  const p = progress(start, inDuration);
  const entersFade = [
    "fade-in",
    "zoom-in",
    "scale-fade",
    "cinematic-title",
    "rotate-in",
    "overshoot",
  ].includes(type);
  if (entersFade) opacity *= progress(start, inDuration, easing);
  if (type === "slide-in") {
    if (direction === "left") dx = -(1 - p) * boxWidth;
    else if (direction === "right") dx = (1 - p) * canvasWidth;
    else if (direction === "top") dy = -(1 - p) * boxHeight;
    else dy = (1 - p) * canvasHeight;
  }
  if (type === "zoom-in") scale = 0.86 + 0.14 * p;
  if (type === "scale-fade") scale = 0.76 + 0.24 * p;
  if (type === "cinematic-title") {
    scale = 0.94 + 0.06 * p;
    dy += ((1 - p) * 36 * canvasHeight) / compositionHeight;
  }
  if (type === "overshoot") scale = 0.76 + 0.24 * p;
  if (type === "rotate-in") {
    rotation += (1 - p) * 10;
    if (time < start + inDuration) scale = 0.96 + 0.04 * p;
  }
  if (
    type === "typewriter" ||
    type === "character-reveal" ||
    type === "word-reveal"
  ) {
    if (time < start) opacity = 0;
    const out = time > end ? progress(end, outDuration, exitEasing) : 0;
    if (["fade-out", "zoom-out", "rotate-out"].includes(exitType))
      opacity *= 1 - out;
    if (exitType === "zoom-out") scale *= 1 - 0.14 * out;
    if (exitType === "slide-out") {
      if (direction === "left") dx = -out * boxWidth;
      else if (direction === "right") dx = out * canvasWidth;
      else if (direction === "top") dy = -out * boxHeight;
      else dy = out * canvasHeight;
    }
    if (exitType === "rotate-out") rotation += 10 * out;
    if (emphasisType === "float")
      dy +=
        Math.sin(time * 2.1) *
        12 *
        intensity *
        (canvasHeight / compositionHeight);
    if (emphasisType === "drift")
      dx +=
        Math.sin(time * 0.45) *
        18 *
        intensity *
        (canvasWidth / compositionWidth);
    if (emphasisType === "pulse")
      scale *= 1 + Math.sin(time * 2.2) * 0.025 * intensity;
    if (time < visibleStart || time > visibleEnd) opacity = 0;
    return {
      opacity,
      transform: `translate(${dx}px, ${dy}px) rotate(${rotation + (emphasisType === "rotate" ? Math.sin(time * 1.3) * 3 * intensity : 0)}deg) scale(${scale})`,
    };
  }
  if (exitType !== "none" && time > end) {
    const out = progress(end, outDuration, exitEasing);
    if (["fade-out", "zoom-out", "rotate-out"].includes(exitType))
      opacity *= 1 - out;
    if (exitType === "zoom-out") scale *= 1 - 0.14 * out;
    if (exitType === "slide-out") {
      if (direction === "left") dx = -out * boxWidth;
      else if (direction === "right") dx = out * canvasWidth;
      else if (direction === "top") dy = -out * boxHeight;
      else dy = out * canvasHeight;
    }
    if (exitType === "rotate-out") rotation += 10 * out;
  }
  if (emphasisType === "float")
    dy +=
      Math.sin(time * 2.1) *
      12 *
      intensity *
      (canvasHeight / compositionHeight);
  if (emphasisType === "drift")
    dx +=
      Math.sin(time * 0.45) * 18 * intensity * (canvasWidth / compositionWidth);
  if (emphasisType === "pulse")
    scale *= 1 + Math.sin(time * 2.2) * 0.025 * intensity;
  if (emphasisType === "rotate")
    rotation += Math.sin(time * 1.3) * 3 * intensity;
  if (time < visibleStart || time > visibleEnd) opacity = 0;
  return {
    opacity,
    transform: `translate(${dx}px, ${dy}px) rotate(${rotation}deg) scale(${scale})`,
  };
}

export default function TemplateCanvasEditor({
  frames,
  onChange,
  templateId,
  title,
  slug,
  description,
  thumbnail,
  previewVideo,
  sourceVideo,
  active,
  musicTracks,
  selectedMusicIds,
  saving,
  uploading = "",
  error = "",
  statusMessage = "",
  onDetailsChange,
  onSelectedMusicIdsChange,
  onUpload,
  onSave,
  onMusicCreated,
  onNewTemplate,
}: Props) {
  const [frameIndex, setFrameIndex] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [canvasSize, setCanvasSize] = useState({ width: 480, height: 854 });
  const [compositionSize, setCompositionSize] = useState({
    width: 1080,
    height: 1920,
  });
  const [selectedKey, setSelectedKey] = useState("");
  const [leftTab, setLeftTab] = useState<"scenes" | "layers" | "assets">(
    "scenes",
  );
  const [aspect, setAspect] = useState("9 / 16");
  const [playing, setPlaying] = useState(false);
  const [previewAll, setPreviewAll] = useState(false);
  const [playhead, setPlayhead] = useState(0);
  const [fontQuery, setFontQuery] = useState("");
  const [fontLoadFailures, setFontLoadFailures] = useState<string[]>([]);
  const [assetKind, setAssetKind] = useState<"templates" | "uploads">(
    "templates",
  );
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [musicTitle, setMusicTitle] = useState("");
  const [musicPath, setMusicPath] = useState("");
  const [musicBusy, setMusicBusy] = useState(false);
  const [musicError, setMusicError] = useState("");
  const [previewUploadError, setPreviewUploadError] = useState("");
  const [dragScene, setDragScene] = useState<number | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const backgroundVideo = useRef<HTMLVideoElement>(null);
  const transitionVideo = useRef<HTMLVideoElement>(null);
  const timelineRail = useRef<HTMLDivElement>(null);
  const sceneFileRef = useRef<HTMLInputElement>(null);
  const thumbnailFileRef = useRef<HTMLInputElement>(null);
  const framePreviewFileRef = useRef<HTMLInputElement>(null);
  const previewFileRef = useRef<HTMLInputElement>(null);
  const masterFileRef = useRef<HTMLInputElement>(null);
  const musicFileRef = useRef<HTMLInputElement>(null);
  const fontFileRef = useRef<HTMLInputElement>(null);
  const history = useRef<{
    past: TemplateFrameDraft[][];
    future: TemplateFrameDraft[][];
  }>({ past: [], future: [] });
  const lastFrames = useRef(frames);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const sceneDrag = useRef<{
    key: string;
    edge:
      | "start"
      | "end"
      | "visibleStart"
      | "visibleEnd"
      | "exitStart"
      | "exitEnd";
    rect: DOMRect;
    pointerId: number;
  } | null>(null);
  const drag = useRef<{
    key: string;
    mode: "move" | "resize";
    startX: number;
    startY: number;
    width: number;
    height: number;
    box: DOMRect;
  } | null>(null);
  const currentFrameIndex = Math.min(
    frameIndex,
    Math.max(0, frames.length - 1),
  );
  const frame = frames[currentFrameIndex];
  const duration = Math.max(0.1, Number(frame?.durationSeconds) || 5);
  const nextFrame = frames[currentFrameIndex + 1];
  const nextSceneDuration = Math.max(
    0.1,
    Number(nextFrame?.durationSeconds) || 5,
  );
  const transitionSettings =
    frame && nextFrame
      ? frameTransition(
          frame,
          Math.max(0.1, Math.min(duration, nextSceneDuration) * 0.45),
        )
      : resolveSceneTransition(undefined);
  const transitionDuration =
    transitionSettings.type === "hard-cut"
      ? 0
      : Math.min(
          transitionSettings.duration,
          Math.max(0.1, Math.min(duration, nextSceneDuration) * 0.45),
        );
  const transitionStart = duration - transitionDuration;
  const transitionActive = Boolean(
    previewAll &&
    nextFrame &&
    transitionDuration > 0 &&
    playhead >= transitionStart,
  );
  const transitionPreviewEnabled = Boolean(
    previewAll && nextFrame && transitionDuration > 0,
  );
  const transitionTime = transitionActive
    ? Math.min(transitionDuration, Math.max(0, playhead - transitionStart))
    : 0;
  const transitionProgress =
    transitionDuration > 0 ? transitionTime / transitionDuration : 0;
  const transitionVisual = transitionPreviewStyles(
    transitionSettings,
    transitionProgress,
  );
  const incomingSceneTime = transitionTime;
  const activeKey = frame?.texts.some((text) => text.key === selectedKey)
    ? selectedKey
    : (frame?.texts[0]?.key ?? "");
  const selectedIndex =
    frame?.texts.findIndex((text) => text.key === activeKey) ?? -1;
  const selected = selectedIndex >= 0 ? frame.texts[selectedIndex] : undefined;
  const previewTime = Math.min(playhead, duration);
  const usedFonts = useMemo(() => {
    const options = new Map(
      FONT_REGISTRY.map((font) => [font.id, resolveFontAsset(font.id)]),
    );
    for (const value of frames.flatMap((scene) =>
      scene.texts.map((text) => text.font),
    )) {
      const resolved = resolveFontAsset(value);
      options.set(resolved.id, resolved);
    }
    return Array.from(options.values());
  }, [frames]);
  const fontAssets = useMemo(
    () =>
      Array.from(
        new Set([
          ...FONT_REGISTRY.map((font) => font.id),
          ...frames.flatMap((scene) =>
            scene.texts.map((text) => String(text.font || "")),
          ),
        ]),
      ),
    [frames],
  );
  const filteredFonts = useMemo(
    () =>
      usedFonts.filter((font) =>
        font.label.toLowerCase().includes(fontQuery.toLowerCase()),
      ),
    [fontQuery, usedFonts],
  );

  useEffect(() => {
    let current = true;
    const values = Array.from(
      new Map(
        frames.flatMap((scene) =>
          scene.texts.map((text) => [
            `${text.font}:${text.fontWeight}`,
            { font: text.font, weight: text.fontWeight },
          ] as const),
        ),
      ).values(),
    );
    void Promise.all(
      values.map(async ({ font: value, weight }) => {
        const font = resolveFontAsset(value);
        const family = fontFamilyForEditor(value, weight);
        const defaultFamily = fontFamilyForEditor(value);
        const browserWeight = family === defaultFamily
          ? 400
          : Math.max(400, Math.min(900, Number(weight) || 700));
        try {
          const loaded = await document.fonts.load(
            `${browserWeight} 32px "${family}"`,
          );
          return loaded.length ? null : font.id;
        } catch {
          return font.id;
        }
      }),
    ).then((results) => {
      if (current)
        setFontLoadFailures(
          results.filter((value): value is string => Boolean(value)),
        );
    });
    return () => {
      current = false;
    };
  }, [frames]);
  const signature = JSON.stringify({
    title,
    slug,
    description,
    thumbnail,
    previewVideo,
    sourceVideo,
    active,
    frames,
    selectedMusicIds,
  });
  const [savedSignature, setSavedSignature] = useState(signature);
  const dirty = signature !== savedSignature;

  async function saveChanges() {
    const saved = await onSave();
    if (saved) {
      setSavedSignature(signature);
    }
  }

  useEffect(() => {
    lastFrames.current = frames;
  }, [frames]);

  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const updateSize = () =>
      setCanvasSize({
        width: element.clientWidth || 480,
        height: element.clientHeight || 854,
      });
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (leftTab !== "assets") return;
    void fetch(`/api/admin/media/library?kind=${assetKind}`, {
      cache: "no-store",
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || result.status !== "success")
          throw new Error(result.message || "Unable to load assets.");
        setAssets(result.data || []);
      })
      .catch(() => setAssets([]))
      .finally(() => setAssetsLoading(false));
  }, [leftTab, assetKind]);

  useEffect(() => {
    const video = backgroundVideo.current;
    if (!video) return;
    if (playing) void video.play().catch(() => undefined);
    else {
      video.pause();
      if (Number.isFinite(video.duration))
        video.currentTime = Math.min(playhead, video.duration || 0);
    }
  }, [playing, currentFrameIndex, frame?.sourceVideo, playhead]);

  useEffect(() => {
    const video = transitionVideo.current;
    if (!video || !nextFrame?.sourceVideo || isImagePath(nextFrame.sourceVideo))
      return;
    const sync = () => {
      try {
        if (!transitionActive) {
          video.pause();
          if (video.readyState >= 1) video.currentTime = 0;
          return;
        }
        if (Math.abs(video.currentTime - incomingSceneTime) > 0.12)
          video.currentTime = incomingSceneTime;
        if (playing) void video.play().catch(() => undefined);
        else video.pause();
      } catch {
        /* Metadata may not be ready yet. */
      }
    };
    sync();
    return () => video.pause();
  }, [
    transitionActive,
    transitionPreviewEnabled,
    incomingSceneTime,
    playing,
    nextFrame?.sourceVideo,
  ]);

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const delta = (now - last) / 1000;
      last = now;
      setPlayhead((current) => {
        const next = current + delta;
        if (next >= duration) {
          if (previewAll && currentFrameIndex + 1 < frames.length) {
            const remainder = next - duration;
            setFrameIndex(currentFrameIndex + 1);
            return Math.min(nextSceneDuration, transitionDuration + remainder);
          }
          setPlaying(false);
          setPreviewAll(false);
          return duration;
        }
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [
    playing,
    duration,
    previewAll,
    currentFrameIndex,
    frames.length,
    nextSceneDuration,
    transitionDuration,
  ]);

  function commitFrames(next: TemplateFrameDraft[]) {
    history.current.past.push(
      JSON.parse(JSON.stringify(lastFrames.current)) as TemplateFrameDraft[],
    );
    if (history.current.past.length > 60) history.current.past.shift();
    history.current.future = [];
    setCanUndo(true);
    setCanRedo(false);
    lastFrames.current = next;
    onChange(next);
  }
  function undo() {
    const previous = history.current.past.pop();
    if (!previous) return;
    history.current.future.push(
      JSON.parse(JSON.stringify(lastFrames.current)) as TemplateFrameDraft[],
    );
    setCanRedo(true);
    setCanUndo(history.current.past.length > 0);
    lastFrames.current = previous;
    onChange(previous);
  }
  function redo() {
    const next = history.current.future.pop();
    if (!next) return;
    history.current.past.push(
      JSON.parse(JSON.stringify(lastFrames.current)) as TemplateFrameDraft[],
    );
    setCanUndo(true);
    setCanRedo(history.current.future.length > 0);
    lastFrames.current = next;
    onChange(next);
  }
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
        return;
      if (event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      } else if (event.key.toLowerCase() === "y") {
        event.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  function updateFrame(index: number, patch: Partial<TemplateFrameDraft>) {
    commitFrames(
      frames.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }
  function updateTransition(patch: Partial<SceneTransition>) {
    if (!frame || !nextFrame) return;
    const settings = frameTransition(
      frame,
      Math.max(0.1, Math.min(duration, nextSceneDuration) * 0.45),
    );
    updateFrame(currentFrameIndex, {
      configExtras: {
        ...frame.configExtras,
        transitionToNext: { ...settings, ...patch },
      },
    });
  }
  function updateCompositionSize(width: number, height: number) {
    if (!width || !height) return;
    const size = outputComposition(width, height);
    setCompositionSize(size);
    setAspect(`${size.width} / ${size.height}`);
  }
  function updateText(key: string, patch: Partial<TemplateTextDraft>) {
    if (!frame) return;
    updateFrame(currentFrameIndex, {
      texts: frame.texts.map((text) =>
        text.key === key ? { ...text, ...patch } : text,
      ),
    });
  }
  function addText() {
    if (!frame) return;
    const key = createLayerId();
    const text = {
      ...blankText(key, "New Text"),
      text: "",
      placeholder: "Type invitation text",
      visibleEnd: String(duration),
      boxWidth: "72",
      boxHeight: "12",
      fontSize: "64",
      animation: "fade-in" as const,
      animationDuration: "0.8",
    };
    updateFrame(currentFrameIndex, { texts: [...frame.texts, text] });
    setSelectedKey(key);
  }
  function addScene() {
    const next = [...frames, blankFrame(frames.length + 1)];
    commitFrames(next);
    setFrameIndex(next.length - 1);
    setSelectedKey("");
    setPlayhead(0);
    setLeftTab("scenes");
  }
  function duplicateScene(index: number) {
    const original = frames[index];
    if (!original) return;
    const suffix = `_${createLayerId().slice(-8)}`;
    const copy: TemplateFrameDraft = {
      ...original,
      title: `${original.title || `Scene ${index + 1}`} copy`,
      configExtras: { ...original.configExtras },
      texts: original.texts.map((item) => ({
        ...item,
        key: `${item.key}${suffix}`,
        label: item.label,
        extra: { ...item.extra },
        animationExtra: { ...item.animationExtra },
      })),
    };
    const next = [
      ...frames.slice(0, index + 1),
      copy,
      ...frames.slice(index + 1),
    ];
    commitFrames(next);
    setFrameIndex(index + 1);
    setSelectedKey(copy.texts[0]?.key ?? "");
  }
  function moveScene(from: number, to: number) {
    if (to < 0 || to >= frames.length || from === to) return;
    const next = [...frames];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    commitFrames(next);
    setFrameIndex(to);
  }
  function deleteScene(index: number) {
    if (frames.length <= 1) return;
    const next = frames.filter((_, current) => current !== index);
    commitFrames(next);
    setFrameIndex(Math.min(index, next.length - 1));
    setSelectedKey("");
  }
  async function uploadIntoFrame(file: File | undefined) {
    if (!file || !frame) return;
    const image = file.type.startsWith("image/") || isImagePath(file.name);
    const path = await onUpload(file, image ? "uploads" : "templates");
    updateFrame(currentFrameIndex, {
      sourceVideo: path,
      ...(image ? { previewImage: path } : {}),
    });
  }
  async function uploadFramePreview(file: File | undefined) {
    if (!file || !frame) return;
    setPreviewUploadError("");
    if (!file.type.startsWith("image/") && !isImagePath(file.name)) {
      setPreviewUploadError("Choose a JPG, PNG, WEBP, GIF, or AVIF image.");
      return;
    }
    try {
      const path = await onUpload(file, "uploads");
      updateFrame(currentFrameIndex, { previewImage: path });
    } catch (caught) {
      setPreviewUploadError(
        caught instanceof Error ? caught.message : "Frame preview upload failed.",
      );
    }
  }
  async function addMusicTrack(file: File | undefined) {
    if (!file) return;
    setMusicError("");
    setMusicBusy(true);
    try {
      const path = await onUpload(file, "music");
      setMusicPath(path);
      setMusicTitle(file.name.replace(/\.[^.]+$/, ""));
    } catch (caught) {
      setMusicError(
        caught instanceof Error ? caught.message : "Music upload failed.",
      );
    } finally {
      setMusicBusy(false);
    }
  }
  async function saveMusicTrack() {
    if (!musicTitle.trim() || !musicPath) {
      setMusicError("Add a title and upload an audio file first.");
      return;
    }
    setMusicBusy(true);
    setMusicError("");
    try {
      const response = await fetch("/api/music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: musicTitle.trim(),
          path: musicPath,
          enabled: true,
        }),
      });
      const result = await response.json();
      if (!response.ok || result.status !== "success")
        throw new Error(result.message || "Unable to add music track.");
      const track = result.data as StudioTrack;
      onMusicCreated(track);
      onSelectedMusicIdsChange([...new Set([...selectedMusicIds, track.id])]);
      setMusicTitle("");
      setMusicPath("");
    } catch (caught) {
      setMusicError(
        caught instanceof Error ? caught.message : "Unable to add music track.",
      );
    } finally {
      setMusicBusy(false);
    }
  }
  async function toggleMusicTrack(track: StudioTrack) {
    setMusicBusy(true);
    setMusicError("");
    try {
      const response = await fetch(
        `/api/music/${encodeURIComponent(track.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: track.title,
            path: track.path,
            duration: track.duration ?? null,
            enabled: track.enabled === false,
          }),
        },
      );
      const result = await response.json();
      if (!response.ok || result.status !== "success")
        throw new Error(
          result.message || "Unable to update music availability.",
        );
      const updated = result.data as StudioTrack;
      onMusicCreated(updated);
      if (updated.enabled === false)
        onSelectedMusicIdsChange(
          selectedMusicIds.filter((id) => id !== track.id),
        );
    } catch (caught) {
      setMusicError(
        caught instanceof Error
          ? caught.message
          : "Unable to update music availability.",
      );
    } finally {
      setMusicBusy(false);
    }
  }
  function chooseAsset(asset: Asset) {
    if (!frame) return;
    const image = isImagePath(asset.path);
    updateFrame(currentFrameIndex, {
      sourceVideo: asset.path,
      ...(image ? { previewImage: asset.path } : {}),
    });
    setLeftTab("scenes");
  }
  function duplicateLayer() {
    if (!selected || !frame) return;
    duplicateLayerByKey(selected.key);
  }
  function duplicateLayerByKey(sourceKey: string) {
    const source = frame?.texts.find((item) => item.key === sourceKey);
    if (!source || !frame) return;
    const key = createLayerId();
    const copy = {
      ...source,
      key,
      label: `${source.label} copy`,
      x: pct(asPercent(source.x, 50, "x", compositionSize.width) + 3),
      y: pct(asPercent(source.y, 50, "y", compositionSize.height) + 3),
      extra: { ...source.extra },
      animationExtra: { ...source.animationExtra },
    };
    updateFrame(currentFrameIndex, { texts: [...frame.texts, copy] });
    setSelectedKey(key);
  }
  function reorderLayer(key: string, direction: -1 | 1) {
    if (!frame) return;
    const from = frame.texts.findIndex((item) => item.key === key);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= frame.texts.length) return;
    const texts = [...frame.texts];
    [texts[from], texts[to]] = [texts[to], texts[from]];
    updateFrame(currentFrameIndex, { texts });
  }
  function pointerMove(event: React.PointerEvent) {
    const active = drag.current;
    if (!active || !frame) return;
    const dx = ((event.clientX - active.startX) / active.box.width) * 100;
    const dy = ((event.clientY - active.startY) / active.box.height) * 100;
    if (active.mode === "move") {
      const nextX =
        asPercent(
          frame.texts.find((text) => text.key === active.key)?.x,
          50,
          "x",
          compositionSize.width,
        ) +
        dx;
      const nextY =
        asPercent(
          frame.texts.find((text) => text.key === active.key)?.y,
          50,
          "y",
          compositionSize.height,
        ) +
        dy;
      updateText(active.key, {
        x: pct(Math.abs(nextX - 50) < 1.5 ? 50 : nextX),
        y: pct(Math.abs(nextY - 50) < 1.5 ? 50 : nextY),
      });
    } else {
      const current = frame.texts.find((text) => text.key === active.key);
      updateText(active.key, {
        boxWidth: String(
          Math.min(
            100,
            Math.max(12, num(current?.boxWidth, active.width, 12, 100) + dx),
          ),
        ),
        boxHeight: String(
          Math.min(
            90,
            Math.max(5, num(current?.boxHeight, active.height, 5, 90) + dy),
          ),
        ),
      });
    }
    active.startX = event.clientX;
    active.startY = event.clientY;
  }
  function beginDrag(
    event: React.PointerEvent<HTMLButtonElement>,
    key: string,
    mode: "move" | "resize",
  ) {
    const box = stage.current?.getBoundingClientRect();
    const text = frame?.texts.find((item) => item.key === key);
    if (!box || !text) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      key,
      mode,
      startX: event.clientX,
      startY: event.clientY,
      width: num(text.boxWidth, 90, 12, 100),
      height: num(text.boxHeight, 20, 5, 90),
      box,
    };
  }
  function finishDrag() {
    drag.current = null;
  }
  function beginTimingDrag(
    event: React.PointerEvent<HTMLButtonElement>,
    key: string,
    edge:
      | "start"
      | "end"
      | "visibleStart"
      | "visibleEnd"
      | "exitStart"
      | "exitEnd",
  ) {
    const rect = timelineRail.current?.getBoundingClientRect();
    if (!rect) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    sceneDrag.current = { key, edge, rect, pointerId: event.pointerId };
  }
  function moveTimingDrag(event: React.PointerEvent<HTMLButtonElement>) {
    const active = sceneDrag.current;
    if (!active || active.pointerId !== event.pointerId) return;
    const time = Math.min(
      duration,
      Math.max(
        0,
        ((event.clientX - active.rect.left) / active.rect.width) * duration,
      ),
    );
    const text = frame?.texts.find((item) => item.key === active.key);
    if (!text) return;
    const enterDuration = num(
      text.animationDuration,
      1,
      0.1,
      maxStageDuration(duration),
    );
    const exitDuration = num(
      text.exitDuration,
      0.6,
      0.1,
      maxStageDuration(duration),
    );
    const delayMax = Math.max(
      0,
      duration - enterDuration - (hasExitAnimation(text) ? exitDuration : 0),
    );
    if (active.edge === "start") {
      updateText(active.key, {
        animationDelay: String(Math.min(time, delayMax)),
      });
    } else if (active.edge === "end") {
      const start = num(text.animationDelay, 0, 0, duration);
      const stageMax = Math.max(
        0.1,
        Math.min(
          maxStageDuration(duration),
          duration - start - (hasExitAnimation(text) ? exitDuration : 0),
        ),
      );
      updateText(active.key, {
        animationDuration: String(
          Math.min(stageMax, Math.max(0.1, time - start)),
        ),
      });
    } else if (active.edge === "visibleStart") {
      updateText(active.key, {
        visibleStart: String(
          Math.min(time, num(text.visibleEnd, duration, 0, duration)),
        ),
      });
    } else if (active.edge === "visibleEnd") {
      updateText(active.key, {
        visibleEnd: String(
          Math.max(num(text.visibleStart, 0, 0, duration), time),
        ),
      });
    } else if (active.edge === "exitStart") {
      const earliestExit = Math.min(
        num(text.animationDelay, 0, 0, duration) + enterDuration,
        duration - exitDuration,
      );
      updateText(active.key, {
        exitStart: String(
          Math.max(earliestExit, Math.min(time, duration - exitDuration)),
        ),
      });
    } else {
      const exitStart = num(
        text.exitStart,
        duration - Number(text.exitDuration || 0.6),
        0,
        duration,
      );
      updateText(active.key, {
        exitDuration: String(
          Math.max(0.1, Math.min(maxStageDuration(duration), time - exitStart)),
        ),
      });
    }
    setPlayhead(time);
  }
  function endTimingDrag(event: React.PointerEvent<HTMLButtonElement>) {
    if (sceneDrag.current?.pointerId === event.pointerId)
      sceneDrag.current = null;
  }

  if (!frame)
    return (
      <div className="rounded-xl border p-5 text-sm text-slate-500">
        Add a frame to open the visual editor.
      </div>
    );
  const crop = {
    objectFit:
      frame.backgroundFit === "fill"
        ? "fill"
        : frame.backgroundFit === "cover"
          ? "cover"
          : "contain",
  } as const;
  const focal = `${num(frame.focalX, 50, 0, 100)}% ${num(frame.focalY, 50, 0, 100)}%`;
  const cssFaces = browserFontFaceCss(fontAssets);

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <style>{cssFaces}</style>
      <div className="flex flex-wrap items-center gap-3 border-b bg-slate-900 px-4 py-3 text-white">
        <div className="min-w-[220px] flex-1">
          <label className="mb-1 block text-[10px] uppercase tracking-wider text-slate-300">
            Invitation template
          </label>
          <input
            value={title}
            onChange={(event) => onDetailsChange({ title: event.target.value })}
            placeholder="Untitled invitation"
            maxLength={160}
            className="w-full max-w-xl bg-transparent text-lg font-semibold outline-none placeholder:text-slate-400"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {onNewTemplate && (
            <button
              type="button"
              onClick={onNewTemplate}
              className="rounded border border-white/20 px-3 py-2 text-sm hover:bg-white/10"
            >
              New template
            </button>
          )}
          <button
            type="button"
            title="Undo (Ctrl+Z)"
            onClick={undo}
            disabled={!canUndo}
            className="rounded border border-white/20 px-3 py-2 text-sm disabled:opacity-40"
          >
            ↶
          </button>
          <button
            type="button"
            title="Redo (Ctrl+Shift+Z)"
            onClick={redo}
            disabled={!canRedo}
            className="rounded border border-white/20 px-3 py-2 text-sm disabled:opacity-40"
          >
            ↷
          </button>
          <button
            type="button"
            onClick={() => {
              setFrameIndex(0);
              setPlayhead(0);
              setPreviewAll(true);
              setPlaying(true);
            }}
            className="rounded border border-white/20 px-3 py-2 text-sm hover:bg-white/10"
          >
            Preview invitation
          </button>
          <span
            role="status"
            className={`min-w-24 text-center text-xs ${error ? "text-red-300" : dirty ? "text-amber-200" : "text-emerald-200"}`}
          >
            {saving
              ? "Saving…"
              : error
                ? "Save failed"
                : dirty
                  ? "Unsaved changes"
                  : statusMessage || "Saved"}
          </span>
          <button
            type="button"
            onClick={() => void saveChanges()}
            disabled={saving}
            className="rounded-lg bg-violet-500 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-400 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save template"}
          </button>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-white px-4 py-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setDetailsOpen((open) => !open)}
            className="rounded border px-3 py-1.5 text-xs font-medium"
          >
            {detailsOpen ? "Hide template details" : "Template details"}
          </button>
          <span className="text-xs text-slate-500">
            {templateId ? `Template #${templateId}` : "New invitation"}
          </span>
          <span className="text-xs text-slate-400">
            {frames.length} scene{frames.length === 1 ? "" : "s"} ·{" "}
            {frames
              .reduce(
                (sum, item) =>
                  sum + Math.max(0, Number(item.durationSeconds) || 0),
                0,
              )
              .toFixed(1)}
            s
          </span>
        </div>
        <button
          type="button"
          onClick={addText}
          className="rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-800"
        >
          ＋ Add Text
        </button>
      </div>
      {detailsOpen && (
        <div className="grid gap-3 border-b bg-slate-50 p-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="text-xs font-medium text-slate-700">
            Slug
            <input
              value={slug}
              onChange={(event) =>
                onDetailsChange({ slug: event.target.value })
              }
              className="mt-1 w-full rounded border bg-white px-2 py-2 text-sm"
              placeholder="auto from title"
            />
          </label>
          <label className="flex items-center gap-2 pt-5 text-sm">
            <input
              type="checkbox"
              checked={active}
              onChange={(event) =>
                onDetailsChange({ active: event.target.checked })
              }
            />{" "}
            Publish on customer website
          </label>
          <label className="text-xs font-medium text-slate-700 md:col-span-2">
            Description
            <textarea
              value={description}
              onChange={(event) =>
                onDetailsChange({ description: event.target.value })
              }
              rows={2}
              className="mt-1 w-full rounded border bg-white px-2 py-2 text-sm"
            />
          </label>
          <div className="flex flex-wrap items-center gap-3 text-xs md:col-span-2 xl:col-span-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">Thumbnail</span>
              {thumbnail ? (
                <img
                  src={mediaUrl(thumbnail)}
                  alt="Template thumbnail"
                  className="h-12 w-12 rounded object-cover"
                />
              ) : (
                <span className="text-amber-700">Required before saving</span>
              )}
              <button
                type="button"
                onClick={() => thumbnailFileRef.current?.click()}
                className="rounded border bg-white px-2 py-1.5"
              >
                {thumbnail ? "Replace" : "Upload thumbnail"}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Master / preview</span>
              <span className="max-w-48 truncate text-slate-500">
                {previewVideo || "Optional"}
              </span>
              <button
                type="button"
                onClick={() => previewFileRef.current?.click()}
                className="rounded border bg-white px-2 py-1.5"
              >
                Choose preview
              </button>
              <button
                type="button"
                onClick={() => masterFileRef.current?.click()}
                className="rounded border bg-white px-2 py-1.5"
              >
                Choose reference
              </button>
              <span className="max-w-48 truncate text-slate-500">
                {sourceVideo}
              </span>
            </div>
          </div>
        </div>
      )}
      {error && (
        <div
          role="alert"
          className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700"
        >
          {error}
        </div>
      )}
      {statusMessage && !error && (
        <div
          role="status"
          className="border-b border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800"
        >
          {statusMessage}
        </div>
      )}
      {uploading && (
        <div className="border-b bg-violet-50 px-4 py-2 text-xs text-violet-800">
          Uploading {uploading}…
        </div>
      )}
      <input
        ref={thumbnailFileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file)
            void onUpload(file, "uploads")
              .then((path) => onDetailsChange({ thumbnail: path }))
              .catch(() => undefined);
        }}
      />
      <input
        ref={previewFileRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file)
            void onUpload(file, "templates")
              .then((path) => onDetailsChange({ previewVideo: path }))
              .catch(() => undefined);
        }}
      />
      <input
        ref={framePreviewFileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif,.jpg,.jpeg,.png,.webp,.gif,.avif"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          void uploadFramePreview(file);
        }}
      />
      <input
        ref={masterFileRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file)
            void onUpload(file, "templates")
              .then((path) => onDetailsChange({ sourceVideo: path }))
              .catch(() => undefined);
        }}
      />
      <input
        ref={sceneFileRef}
        type="file"
        accept="video/*,image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          void uploadIntoFrame(file).catch(() => undefined);
        }}
      />
      <input
        ref={musicFileRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          void addMusicTrack(file);
        }}
      />
      <input
        ref={fontFileRef}
        type="file"
        accept=".ttf,.otf,font/ttf,font/otf"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file && selected)
            void onUpload(file, "fonts")
              .then((path) => updateText(selected.key, { font: path }))
              .catch(() => undefined);
        }}
      />
      <div className="grid min-h-[680px] lg:grid-cols-[240px_minmax(320px,1fr)_310px]">
        <aside className="border-b p-3 lg:border-b-0 lg:border-r">
          <div className="mb-3 grid grid-cols-3 rounded-lg bg-slate-100 p-1 text-xs">
            {(["scenes", "layers", "assets"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  if (tab === "assets" && leftTab !== "assets")
                    setAssetsLoading(true);
                  setLeftTab(tab);
                }}
                className={`rounded px-2 py-1.5 capitalize ${leftTab === tab ? "bg-white font-semibold shadow-sm" : "text-slate-500"}`}
              >
                {tab}
              </button>
            ))}
          </div>
          {leftTab === "scenes" && (
            <>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Scenes
                </h3>
                <button
                  type="button"
                  onClick={addScene}
                  className="rounded bg-violet-100 px-2 py-1 text-xs font-semibold text-violet-800"
                >
                  ＋ Scene
                </button>
              </div>
              <div className="space-y-2">
                {frames.map((item, index) => (
                  <div
                    key={`${item.title}-${index}`}
                    draggable
                    onDragStart={() => setDragScene(index)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => {
                      if (dragScene !== null) moveScene(dragScene, index);
                      setDragScene(null);
                    }}
                    onDragEnd={() => setDragScene(null)}
                    className={`rounded-lg border p-2 ${index === currentFrameIndex ? "border-violet-400 bg-violet-50" : "border-slate-200 bg-white"}`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setFrameIndex(index);
                        setPlayhead(0);
                        setPlaying(false);
                        setPreviewAll(false);
                      }}
                      className="flex w-full items-center gap-2 text-left"
                    >
                      {item.previewImage || isImagePath(item.sourceVideo) ? (
                        <img
                          src={mediaUrl(item.previewImage || item.sourceVideo)}
                          alt=""
                          className="h-12 w-10 rounded object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-10 items-center justify-center rounded bg-slate-200 text-lg">
                          ▶
                        </div>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-semibold">
                          {String(index + 1).padStart(2, "0")} ·{" "}
                          {item.title || `Scene ${index + 1}`}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {Number(item.durationSeconds || 0).toFixed(1)}s ·{" "}
                          {item.texts.length} layers
                        </span>
                        {index < frames.length - 1 &&
                          (() => {
                            const nextDuration =
                              Number(frames[index + 1]?.durationSeconds) || 5;
                            const max = Math.max(
                              0.1,
                              Math.min(
                                Number(item.durationSeconds) || 5,
                                nextDuration,
                              ) * 0.45,
                            );
                            const transition = frameTransition(item, max);
                            const label =
                              transitionOptions.find(
                                (option) => option.value === transition.type,
                              )?.label || "Hard cut";
                            return (
                              <span className="block text-[10px] font-medium text-violet-700">
                                → {label}
                                {transition.type !== "hard-cut"
                                  ? ` · ${transition.duration.toFixed(1)}s`
                                  : ""}
                              </span>
                            );
                          })()}
                      </span>
                    </button>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setFrameIndex(index);
                          sceneFileRef.current?.click();
                        }}
                        className="rounded border px-1.5 py-1 text-[10px]"
                      >
                        Media
                      </button>
                      <button
                        type="button"
                        onClick={() => duplicateScene(index)}
                        className="rounded border px-1.5 py-1 text-[10px]"
                      >
                        Duplicate
                      </button>
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveScene(index, index - 1)}
                        className="rounded border px-1.5 py-1 text-[10px] disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        disabled={index === frames.length - 1}
                        onClick={() => moveScene(index, index + 1)}
                        className="rounded border px-1.5 py-1 text-[10px] disabled:opacity-30"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        disabled={frames.length <= 1}
                        onClick={() => deleteScene(index)}
                        className="rounded border border-red-100 px-1.5 py-1 text-[10px] text-red-700 disabled:opacity-30"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => sceneFileRef.current?.click()}
                className="mt-3 w-full rounded-lg border border-dashed border-violet-300 p-3 text-xs font-medium text-violet-800"
              >
                Upload scene video or image
              </button>
            </>
          )}
          {leftTab === "layers" && (
            <>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Text layers
                </h3>
                <button
                  type="button"
                  onClick={addText}
                  className="text-xs font-semibold text-violet-700"
                >
                  ＋ Add Text
                </button>
              </div>
              <ul className="space-y-1">
                {frame.texts.map((text, index) => (
                  <li
                    key={text.key}
                    className={`flex items-center gap-1 rounded border px-2 py-1.5 ${text.key === activeKey ? "border-violet-300 bg-violet-50" : "border-transparent hover:bg-slate-50"}`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedKey(text.key)}
                      className={`min-w-0 flex-1 truncate text-left text-xs ${text.visible ? "text-slate-800" : "text-slate-400 line-through"}`}
                    >
                      {text.label || text.key}
                    </button>
                    <button
                      type="button"
                      title="Toggle visibility"
                      onClick={() =>
                        updateText(text.key, { visible: !text.visible })
                      }
                      className="text-xs text-slate-500"
                    >
                      {text.visible ? "◉" : "○"}
                    </button>
                    <button
                      type="button"
                      title="Duplicate"
                      onClick={() => duplicateLayerByKey(text.key)}
                      className="text-xs"
                    >
                      ⧉
                    </button>
                    <button
                      type="button"
                      title="Move layer up"
                      onClick={() => reorderLayer(text.key, 1)}
                      disabled={index === frame.texts.length - 1}
                      className="text-xs disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      title="Move layer down"
                      onClick={() => reorderLayer(text.key, -1)}
                      disabled={index === 0}
                      className="text-xs disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
          {leftTab === "assets" && (
            <>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Saved assets
                </h3>
                <button
                  type="button"
                  onClick={() => sceneFileRef.current?.click()}
                  className="text-xs font-semibold text-violet-700"
                >
                  Upload
                </button>
              </div>
              <select
                value={assetKind}
                onChange={(event) => {
                  setAssetsLoading(true);
                  setAssetKind(event.target.value as "templates" | "uploads");
                }}
                className="mb-2 w-full rounded border bg-white px-2 py-1.5 text-xs"
              >
                <option value="templates">Scene videos</option>
                <option value="uploads">Images</option>
              </select>
              {assetsLoading ? (
                <p className="text-xs text-slate-500">Loading assets…</p>
              ) : assets.length ? (
                <div className="max-h-[560px] space-y-1 overflow-auto">
                  {assets.map((asset) => (
                    <button
                      key={asset.path}
                      type="button"
                      onClick={() => chooseAsset(asset)}
                      className="flex w-full items-center gap-2 rounded p-1.5 text-left hover:bg-violet-50"
                    >
                      {isImagePath(asset.path) ? (
                        <img
                          src={mediaUrl(asset.path)}
                          alt=""
                          className="h-10 w-8 rounded object-cover"
                        />
                      ) : (
                        <span className="flex h-10 w-8 items-center justify-center rounded bg-slate-100">
                          ▶
                        </span>
                      )}
                      <span className="min-w-0 truncate text-[10px]">
                        {asset.name}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  No saved assets in this category yet.
                </p>
              )}
            </>
          )}
        </aside>
        <div className="min-w-0 bg-slate-100 p-3 sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs text-slate-600">
                Background{" "}
                <select
                  value={frame.backgroundFit}
                  onChange={(event) =>
                    updateFrame(currentFrameIndex, {
                      backgroundFit: event.target
                        .value as TemplateFrameDraft["backgroundFit"],
                    })
                  }
                  className="ml-1 rounded border bg-white px-2 py-1"
                >
                  <option value="contain">Fit</option>
                  <option value="cover">Fill / crop</option>
                  <option value="fill">Stretch</option>
                </select>
              </label>
              {frame.backgroundFit === "cover" && (
                <>
                  <label className="text-xs text-slate-600">
                    Focal X{" "}
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={frame.focalX}
                      onChange={(event) =>
                        updateFrame(currentFrameIndex, {
                          focalX: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label className="text-xs text-slate-600">
                    Y{" "}
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={frame.focalY}
                      onChange={(event) =>
                        updateFrame(currentFrameIndex, {
                          focalY: event.target.value,
                        })
                      }
                    />
                  </label>
                </>
              )}
              <button
                type="button"
                onClick={() =>
                  updateFrame(currentFrameIndex, {
                    backgroundFit: "contain",
                    focalX: "50",
                    focalY: "50",
                  })
                }
                className="rounded border bg-white px-2 py-1 text-xs"
              >
                Reset crop
              </button>
              <label className="ml-auto flex items-center gap-1 text-xs text-slate-600">
                Zoom{" "}
                <input
                  aria-label="Canvas zoom"
                  type="range"
                  min="75"
                  max="140"
                  value={zoom}
                  onChange={(event) => setZoom(Number(event.target.value))}
                />
                <button
                  type="button"
                  onClick={() => setZoom(100)}
                  className="rounded border bg-white px-2 py-1"
                >
                  Fit
                </button>
              </label>
            </div>
            <span className="text-xs text-slate-500">
              Composition preview · {duration.toFixed(1)}s
            </span>
          </div>
          <div
            ref={stage}
            className="relative mx-auto w-full touch-none overflow-hidden rounded-lg bg-black shadow-lg"
            onPointerMove={pointerMove}
            onPointerUp={finishDrag}
            onPointerCancel={finishDrag}
            style={{
              aspectRatio: aspect,
              containerType: "inline-size",
              maxWidth: `${(450 * zoom) / 100}px`,
              backgroundColor: transitionActive
                ? transitionVisual.backplate
                : "#000000",
            }}
          >
            <div
              className="absolute inset-0"
              style={transitionActive ? transitionVisual.outgoing : undefined}
            >
              {frame.sourceVideo && isImagePath(frame.sourceVideo) ? (
                <img
                  key={frame.sourceVideo}
                  src={mediaUrl(frame.sourceVideo)}
                  alt="Selected scene background"
                  draggable={false}
                  onLoad={(event) => {
                    if (currentFrameIndex === 0)
                      updateCompositionSize(
                        event.currentTarget.naturalWidth,
                        event.currentTarget.naturalHeight,
                      );
                  }}
                  className="absolute inset-0 h-full w-full"
                  style={{ ...crop, objectPosition: focal }}
                />
              ) : frame.sourceVideo ? (
                <video
                  key={frame.sourceVideo}
                  ref={backgroundVideo}
                  src={mediaUrl(frame.sourceVideo)}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  onLoadedMetadata={(event) => {
                    const video = event.currentTarget;
                    if (
                      currentFrameIndex === 0 &&
                      video.videoWidth &&
                      video.videoHeight
                    )
                      updateCompositionSize(
                        video.videoWidth,
                        video.videoHeight,
                      );
                  }}
                  className="absolute inset-0 h-full w-full"
                  style={{ ...crop, objectPosition: focal }}
                />
              ) : frame.previewImage ? (
                <img
                  src={mediaUrl(frame.previewImage)}
                  alt="Selected frame background"
                  draggable={false}
                  onLoad={(event) => {
                    if (currentFrameIndex === 0)
                      updateCompositionSize(
                        event.currentTarget.naturalWidth,
                        event.currentTarget.naturalHeight,
                      );
                  }}
                  className="absolute inset-0 h-full w-full"
                  style={{ ...crop, objectPosition: focal }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center p-8 text-center text-sm text-white/70">
                  Upload a frame video or preview image to design its text.
                </div>
              )}
              {frame.texts.map((text) => {
                if (!text.visible) return null;
                const align =
                  text.alignment === "left"
                    ? "left"
                    : text.alignment === "right"
                      ? "right"
                      : "center";
                const translate =
                  align === "left" ? "0" : align === "right" ? "-100%" : "-50%";
                const chosen = text.key === activeKey;
                const fontAsset = resolveFontAsset(text.font);
                const previewingReveal =
                  isTextReveal(text.animation) &&
                  (playing || previewAll || previewTime > 0);
                const fontSizeValue = num(text.fontSize, 48, 6, 240);
                const wrappedText = wrapInvitationText(
                  text.text,
                  fontSizeValue,
                  (compositionSize.width * num(text.boxWidth, 90, 12, 100)) /
                    100,
                );
                const shownText = previewingReveal
                  ? previewRevealText(
                      text,
                      previewTime,
                      duration,
                      compositionSize.width,
                    )
                  : wrappedText;
                const compositionScale =
                  canvasSize.width / compositionSize.width;
                const textRows = Math.max(1, wrappedText.split("\n").length);
                const shadow =
                  num(text.shadowX, 0, -40, 40) || num(text.shadowY, 0, -40, 40)
                    ? `${num(text.shadowX, 0, -40, 40) * compositionScale}px ${num(text.shadowY, 0, -40, 40) * compositionScale}px 0px ${text.shadowColor}`
                    : undefined;
                const canvasWidth = canvasSize.width;
                const canvasHeight = canvasSize.height;
                const motion = previewMotion(
                  text,
                  previewTime,
                  duration,
                  canvasWidth,
                  canvasHeight,
                  (canvasWidth * num(text.boxWidth, 90, 12, 100)) / 100,
                  (canvasHeight * num(text.boxHeight, 20, 5, 90)) / 100,
                  compositionSize.width,
                  compositionSize.height,
                );
                return (
                  <div
                    key={text.key}
                    onClick={() => setSelectedKey(text.key)}
                    className={`absolute z-10 flex items-center ${chosen ? "outline outline-1 outline-dashed outline-amber-300" : ""}`}
                    style={{
                      left: `${asPercent(text.x, 50, "x", compositionSize.width)}%`,
                      top: `${asPercent(text.y, 50, "y", compositionSize.height)}%`,
                      width: `${num(text.boxWidth, 90, 12, 100)}%`,
                      height: `${num(text.boxHeight, 20, 5, 90)}%`,
                      ...motion,
                      transform: `translate(${translate}, -50%) ${String(motion.transform ?? "")}`,
                      transformOrigin: "center",
                      opacity: text.visible ? motion.opacity : 0,
                      backgroundColor:
                        Number(text.backgroundOpacity) > 0
                          ? `${text.backgroundColor}${Math.round(
                              num(text.backgroundOpacity, 0, 0, 1) * 255,
                            )
                              .toString(16)
                              .padStart(2, "0")}`
                          : "transparent",
                      padding:
                        num(text.backgroundOpacity, 0, 0, 1) > 0
                          ? `${num(text.backgroundPadding, 8, 0, 60) * compositionScale}px`
                          : 0,
                      boxSizing: "border-box",
                    }}
                  >
                    {chosen && (
                      <button
                        type="button"
                        aria-label={`Drag ${text.label}`}
                        onPointerDown={(event) =>
                          beginDrag(event, text.key, "move")
                        }
                        className="absolute -top-4 left-0 z-20 cursor-move rounded border border-amber-200 bg-slate-900/80 px-1.5 text-[10px] font-medium text-white shadow-sm"
                      >
                        move
                      </button>
                    )}
                    <textarea
                      aria-label={`${text.label} text`}
                      placeholder={text.placeholder || text.label || "Add text"}
                      value={shownText}
                      readOnly={previewingReveal}
                      rows={Math.max(1, textRows)}
                      wrap="off"
                      onClick={() => setSelectedKey(text.key)}
                      onChange={(event) =>
                        updateText(text.key, { text: event.target.value })
                      }
                      className="block h-auto max-h-full w-full resize-none overflow-hidden bg-transparent p-0 text-center leading-tight text-shadow-none outline-none placeholder:text-white/80"
                      style={{
                        height: "auto",
                        whiteSpace: "pre",
                        backgroundColor: "transparent",
                        backgroundImage: "none",
                        border: 0,
                        textAlign: align,
                        color: text.fontColor,
                        fontFamily: `'${fontFamilyForEditor(text.font, text.fontWeight)}', sans-serif`,
                        fontSize: `${fontSizeValue * compositionScale}px`,
                        fontWeight: 400,
                        fontSynthesis: text.italic ? "style" : "none",
                        fontStyle: text.italic ? "italic" : "normal",
                        letterSpacing: `${(fontAsset.supportsLetterSpacing ? num(text.letterSpacing, 0, 0, 12) : 0) * compositionScale}px`,
                        lineHeight: `${Math.max(0.8, 1 + num(text.lineSpacing, 8, -10, 80) / Math.max(6, Number(text.fontSize) || 48))}`,
                        WebkitTextStroke: `${num(text.strokeWidth, 0, 0, 20) * compositionScale}px ${text.strokeColor}`,
                        textShadow: shadow,
                      }}
                    />
                    {chosen && (
                      <button
                        type="button"
                        aria-label="Resize text box"
                        onPointerDown={(event) =>
                          beginDrag(event, text.key, "resize")
                        }
                        className="absolute -bottom-2 -right-2 z-20 h-4 w-4 cursor-nwse-resize rounded-sm border-2 border-white bg-violet-600"
                      />
                    )}
                  </div>
                );
              })}
            </div>
            {transitionPreviewEnabled && nextFrame && (
              <div
                className="pointer-events-none absolute inset-0"
                style={transitionVisual.incoming}
              >
                {nextFrame.sourceVideo && isImagePath(nextFrame.sourceVideo) ? (
                  <img
                    src={mediaUrl(nextFrame.sourceVideo)}
                    alt="Incoming scene"
                    draggable={false}
                    className="absolute inset-0 h-full w-full"
                    style={{
                      objectFit:
                        nextFrame.backgroundFit === "fill"
                          ? "fill"
                          : nextFrame.backgroundFit === "cover"
                            ? "cover"
                            : "contain",
                      objectPosition: `${num(nextFrame.focalX, 50, 0, 100)}% ${num(nextFrame.focalY, 50, 0, 100)}%`,
                    }}
                  />
                ) : nextFrame.sourceVideo ? (
                  <video
                    ref={transitionVideo}
                    src={mediaUrl(nextFrame.sourceVideo)}
                    muted
                    playsInline
                    preload="auto"
                    onLoadedMetadata={(event) => {
                      try {
                        event.currentTarget.currentTime = transitionActive
                          ? incomingSceneTime
                          : 0;
                        if (transitionActive && playing)
                          void event.currentTarget
                            .play()
                            .catch(() => undefined);
                      } catch {
                        /* Wait for metadata. */
                      }
                    }}
                    className="absolute inset-0 h-full w-full"
                    style={{
                      objectFit:
                        nextFrame.backgroundFit === "fill"
                          ? "fill"
                          : nextFrame.backgroundFit === "cover"
                            ? "cover"
                            : "contain",
                      objectPosition: `${num(nextFrame.focalX, 50, 0, 100)}% ${num(nextFrame.focalY, 50, 0, 100)}%`,
                    }}
                  />
                ) : nextFrame.previewImage ? (
                  <img
                    src={mediaUrl(nextFrame.previewImage)}
                    alt="Incoming scene"
                    draggable={false}
                    className="absolute inset-0 h-full w-full"
                    style={{ objectFit: "contain" }}
                  />
                ) : (
                  <div className="absolute inset-0 bg-black" />
                )}
                {nextFrame.texts
                  .filter((text) => text.visible)
                  .map((text) => {
                    const align =
                      text.alignment === "left"
                        ? "left"
                        : text.alignment === "right"
                          ? "right"
                          : "center";
                    const translate =
                      align === "left"
                        ? "0"
                        : align === "right"
                          ? "-100%"
                          : "-50%";
                    const fontSizeValue = num(text.fontSize, 48, 6, 240);
                    const compositionScale =
                      canvasSize.width / compositionSize.width;
                    const motion = previewMotion(
                      text,
                      incomingSceneTime,
                      nextSceneDuration,
                      canvasSize.width,
                      canvasSize.height,
                      (canvasSize.width * num(text.boxWidth, 90, 12, 100)) /
                        100,
                      (canvasSize.height * num(text.boxHeight, 20, 5, 90)) /
                        100,
                      compositionSize.width,
                      compositionSize.height,
                    );
                    const shadow =
                      num(text.shadowX, 0, -40, 40) ||
                      num(text.shadowY, 0, -40, 40)
                        ? `${num(text.shadowX, 0, -40, 40) * compositionScale}px ${num(text.shadowY, 0, -40, 40) * compositionScale}px 0px ${text.shadowColor}`
                        : undefined;
                    const fontAsset = resolveFontAsset(text.font);
                    const shownText = previewRevealText(
                      text,
                      incomingSceneTime,
                      nextSceneDuration,
                      compositionSize.width,
                    );
                    const letterSpacing = fontAsset.supportsLetterSpacing
                      ? num(text.letterSpacing, 0, 0, 12)
                      : 0;
                    return (
                      <div
                        key={text.key}
                        className="absolute z-10 flex items-center"
                        style={{
                          left: `${asPercent(text.x, 50, "x", compositionSize.width)}%`,
                          top: `${asPercent(text.y, 50, "y", compositionSize.height)}%`,
                          width: `${num(text.boxWidth, 90, 12, 100)}%`,
                          height: `${num(text.boxHeight, 20, 5, 90)}%`,
                          ...motion,
                          transform: `translate(${translate}, -50%) ${String(motion.transform ?? "")}`,
                          transformOrigin: "center",
                          opacity: motion.opacity,
                          backgroundColor:
                            Number(text.backgroundOpacity) > 0
                              ? `${text.backgroundColor}${Math.round(
                                  num(text.backgroundOpacity, 0, 0, 1) * 255,
                                )
                                  .toString(16)
                                  .padStart(2, "0")}`
                              : "transparent",
                          padding:
                            num(text.backgroundOpacity, 0, 0, 1) > 0
                              ? `${num(text.backgroundPadding, 8, 0, 60) * compositionScale}px`
                              : 0,
                          boxSizing: "border-box",
                        }}
                      >
                        <div
                          className="w-full whitespace-pre-wrap"
                          style={{
                            textAlign: align,
                            color: text.fontColor,
                            fontFamily: `'${fontFamilyForEditor(text.font, text.fontWeight)}', sans-serif`,
                            fontSize: `${fontSizeValue * compositionScale}px`,
                            fontWeight: 400,
                            fontSynthesis: text.italic ? "style" : "none",
                            fontStyle: text.italic ? "italic" : "normal",
                            letterSpacing: `${letterSpacing * compositionScale}px`,
                            lineHeight: `${Math.max(0.8, 1 + num(text.lineSpacing, 8, -10, 80) / Math.max(6, Number(text.fontSize) || 48))}`,
                            WebkitTextStroke: `${num(text.strokeWidth, 0, 0, 20) * compositionScale}px ${text.strokeColor}`,
                            textShadow: shadow,
                          }}
                        >
                          {shownText}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
            <span className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-dashed border-white/25" />
            <span className="pointer-events-none absolute inset-y-0 left-1/2 border-l border-dashed border-white/25" />
          </div>
          <div className="mx-auto mt-3 flex max-w-[450px] items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (playing) setPlaying(false);
                else {
                  if (playhead >= duration) setPlayhead(0);
                  setPlaying(true);
                }
              }}
              className="rounded border bg-white px-3 py-1.5 text-sm"
            >
              {playing ? "Pause" : "Play"}
            </button>
            <button
              type="button"
              onClick={() => {
                setPlaying(false);
                setPlayhead(0);
              }}
              className="rounded border bg-white px-3 py-1.5 text-sm"
            >
              Restart
            </button>
            <input
              aria-label="Preview timeline seek"
              className="min-w-0 flex-1"
              type="range"
              min="0"
              max={duration}
              step="0.01"
              value={playhead}
              onChange={(event) => {
                setPlaying(false);
                setPlayhead(Number(event.target.value));
              }}
            />
            <span className="w-20 text-right font-mono text-xs">
              {previewTime.toFixed(2)}s
            </span>
          </div>
          <div className="mt-5 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-slate-800">
                  Scene timeline
                </h3>
                <p className="text-[10px] text-slate-500">
                  Drag the selected layer&apos;s handles to set entrance,
                  visible, and exit timing.
                </p>
              </div>
              <span className="font-mono text-xs text-slate-600">
                {previewTime.toFixed(2)} / {duration.toFixed(2)}s
              </span>
            </div>
            <div className="mb-2 flex justify-between pl-28 text-[9px] text-slate-400">
              <span>0s</span>
              <span>{(duration / 4).toFixed(1)}s</span>
              <span>{(duration / 2).toFixed(1)}s</span>
              <span>{((duration * 3) / 4).toFixed(1)}s</span>
              <span>{duration.toFixed(1)}s</span>
            </div>
            <div className="space-y-2">
              {frame.texts.map((item) => {
                const entranceStart = num(item.animationDelay, 0, 0, duration);
                const entranceDuration = num(
                  item.animationDuration,
                  1,
                  0.1,
                  maxStageDuration(duration),
                );
                const entranceEnd = Math.min(
                  duration,
                  entranceStart + entranceDuration,
                );
                const visibleStart = num(item.visibleStart, 0, 0, duration);
                const visibleEnd = num(
                  item.visibleEnd,
                  duration,
                  visibleStart,
                  duration,
                );
                const exitDuration = num(
                  item.exitDuration,
                  0.6,
                  0.1,
                  maxStageDuration(duration),
                );
                const exitStart = num(
                  item.exitStart,
                  duration - exitDuration,
                  0,
                  duration,
                );
                const exitEnd = Math.min(duration, exitStart + exitDuration);
                const showEntrance = item.animation !== "none";
                const showExit = hasExitAnimation(item);
                const pos = (time: number) => `${(time / duration) * 100}%`;
                const width = (start: number, end: number) =>
                  `${Math.max(0, ((end - start) / duration) * 100)}%`;
                const handle = (
                  edge:
                    | "start"
                    | "end"
                    | "visibleStart"
                    | "visibleEnd"
                    | "exitStart"
                    | "exitEnd",
                  time: number,
                  color: string,
                ) => (
                  <button
                    type="button"
                    key={edge}
                    title={`${edge} ${time.toFixed(2)} seconds`}
                    onPointerDown={(event) =>
                      beginTimingDrag(event, item.key, edge)
                    }
                    onPointerMove={moveTimingDrag}
                    onPointerUp={endTimingDrag}
                    onPointerCancel={endTimingDrag}
                    className={`absolute top-1/2 z-20 h-4 w-2 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize rounded-sm border border-white ${color}`}
                    style={{ left: pos(time), touchAction: "none" }}
                  />
                );
                return (
                  <div
                    key={item.key}
                    className={`grid grid-cols-[108px_minmax(0,1fr)] items-center gap-2 rounded px-1 py-1 ${item.key === activeKey ? "bg-violet-50" : ""}`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedKey(item.key)}
                      className="truncate text-left text-[10px] font-medium text-slate-700"
                    >
                      {item.label || item.key}
                    </button>
                    <div
                      ref={item.key === activeKey ? timelineRail : undefined}
                      className="relative h-7 cursor-pointer rounded bg-slate-100"
                      onClick={(event) => {
                        if ((event.target as HTMLElement).tagName === "BUTTON")
                          return;
                        const box = event.currentTarget.getBoundingClientRect();
                        setPlaying(false);
                        setPlayhead(
                          Math.min(
                            duration,
                            Math.max(
                              0,
                              ((event.clientX - box.left) / box.width) *
                                duration,
                            ),
                          ),
                        );
                        setSelectedKey(item.key);
                      }}
                    >
                      <div
                        className="absolute inset-y-1 rounded bg-violet-200"
                        style={{
                          left: pos(visibleStart),
                          width: width(visibleStart, visibleEnd),
                        }}
                      />
                      {showEntrance && (
                        <div
                          className="absolute inset-y-0 rounded bg-amber-400/90"
                          style={{
                            left: pos(entranceStart),
                            width: width(entranceStart, entranceEnd),
                          }}
                        />
                      )}
                      {showExit && (
                        <div
                          className="absolute inset-y-0 rounded bg-rose-400/90"
                          style={{
                            left: pos(exitStart),
                            width: width(exitStart, exitEnd),
                          }}
                        />
                      )}
                      <div
                        className="pointer-events-none absolute inset-y-0 z-10 w-0.5 bg-slate-900"
                        style={{ left: pos(previewTime) }}
                      />
                      {item.key === activeKey && (
                        <>
                          {showEntrance && (
                            <>
                              {handle("start", entranceStart, "bg-amber-700")}
                              {handle("end", entranceEnd, "bg-amber-700")}
                            </>
                          )}
                          {handle(
                            "visibleStart",
                            visibleStart,
                            "bg-violet-700",
                          )}
                          {handle("visibleEnd", visibleEnd, "bg-violet-700")}
                          {showExit && (
                            <>
                              {handle("exitStart", exitStart, "bg-rose-700")}
                              {handle("exitEnd", exitEnd, "bg-rose-700")}
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {!frame.texts.length && (
              <p className="py-3 text-center text-xs text-slate-500">
                Add a text layer to create its animation track.
              </p>
            )}
          </div>
        </div>

        <aside className="max-h-[900px] space-y-3 overflow-y-auto border-t p-3 lg:border-l lg:border-t-0">
          <details className="rounded-lg border bg-white p-3">
            <summary className="cursor-pointer text-xs font-semibold text-slate-800">
              Scene properties
            </summary>
            <div className="mt-3 space-y-2">
              <div className="rounded border bg-slate-50 p-2">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-slate-700">
                    Frame preview image
                  </span>
                  <span className="truncate text-[10px] text-slate-500">
                    {frame.previewImage ? "Saved with template" : "Optional"}
                  </span>
                </div>
                {frame.previewImage ? (
                  <img
                    src={mediaUrl(frame.previewImage)}
                    alt={`${frame.title || "Scene"} preview`}
                    className="mb-2 max-h-24 w-full rounded bg-white object-contain"
                  />
                ) : (
                  <p className="mb-2 rounded bg-white px-2 py-2 text-center text-[10px] text-slate-500">
                    No frame thumbnail saved. The scene background remains unchanged.
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => framePreviewFileRef.current?.click()}
                  className="w-full rounded border border-dashed px-3 py-2 text-xs font-medium text-violet-700"
                >
                  {frame.previewImage ? "Replace preview image" : "Upload preview image"}
                </button>
                {previewUploadError && (
                  <p role="alert" className="mt-2 text-xs text-red-700">
                    {previewUploadError}
                  </p>
                )}
              </div>
              <label className="block text-xs">
                Scene name
                <input
                  value={frame.title}
                  onChange={(event) =>
                    updateFrame(currentFrameIndex, {
                      title: event.target.value,
                    })
                  }
                  className="mt-1 w-full rounded border px-2 py-1.5 text-sm"
                />
              </label>
              <label className="block text-xs">
                Scene duration (seconds)
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={frame.durationSeconds}
                  onChange={(event) => {
                    const nextDuration = Math.max(
                      1,
                      Math.round(num(event.target.value, duration, 1, 86400)),
                    );
                    updateFrame(currentFrameIndex, {
                      durationSeconds: String(nextDuration),
                      texts: frame.texts.map((item) => ({
                        ...item,
                        ...clampTextTiming(item, nextDuration),
                      })),
                    });
                    setPlayhead(Math.min(playhead, nextDuration));
                  }}
                  className="mt-1 w-full rounded border px-2 py-1.5 text-sm"
                />
              </label>
              {nextFrame ? (
                <div className="rounded-lg border border-violet-200 bg-violet-50/50 p-2">
                  <h4 className="mb-2 text-xs font-semibold text-slate-800">
                    Transition to{" "}
                    {nextFrame.title || `Scene ${currentFrameIndex + 2}`}
                  </h4>
                  <label className="block text-xs">
                    Transition preset
                    <select
                      className="mt-1 w-full rounded border bg-white px-2 py-1.5"
                      value={transitionSettings.type}
                      onChange={(event) =>
                        updateTransition({
                          type: event.target.value as SceneTransition["type"],
                        })
                      }
                    >
                      {transitionOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  {transitionSettings.type !== "hard-cut" && (
                    <>
                      <label className="mt-2 block text-xs">
                        Duration{" "}
                        <span className="float-right">
                          {transitionSettings.duration.toFixed(1)}s
                        </span>
                        <input
                          type="range"
                          min="0.1"
                          max={Math.max(
                            0.1,
                            Math.min(duration, nextSceneDuration) * 0.45,
                          )}
                          step="0.05"
                          className="mt-1 w-full"
                          value={transitionSettings.duration}
                          onChange={(event) =>
                            updateTransition({
                              duration: Number(event.target.value),
                            })
                          }
                        />
                      </label>
                      {[
                        "slide",
                        "push",
                        "smooth-wipe",
                        "directional-reveal",
                      ].includes(transitionSettings.type) && (
                        <label className="mt-2 block text-xs">
                          Direction
                          <select
                            className="mt-1 w-full rounded border bg-white px-2 py-1.5"
                            value={transitionSettings.direction}
                            onChange={(event) =>
                              updateTransition({
                                direction: event.target
                                  .value as SceneTransition["direction"],
                              })
                            }
                          >
                            <option value="left">Left</option>
                            <option value="right">Right</option>
                            <option value="top">Up</option>
                            <option value="bottom">Down</option>
                          </select>
                        </label>
                      )}
                    </>
                  )}
                  <p className="mt-2 text-[10px] text-slate-500">
                    Applies only between these adjacent scenes. Its duration
                    overlaps both scenes.
                  </p>
                </div>
              ) : (
                <p className="rounded border bg-slate-50 p-2 text-[10px] text-slate-500">
                  The last scene has no outgoing transition.
                </p>
              )}
              <button
                type="button"
                onClick={() => sceneFileRef.current?.click()}
                className="w-full rounded border border-dashed px-3 py-2 text-xs font-medium text-violet-700"
              >
                Replace background media
              </button>
              <div className="text-[10px] text-slate-500">
                {frame.sourceVideo || "No background selected"}
              </div>
            </div>
          </details>
          <details className="rounded-lg border bg-white p-3">
            <summary className="cursor-pointer text-xs font-semibold text-slate-800">
              Customer music choices
            </summary>
            <div className="mt-3 space-y-2">
              {musicTracks.map((track) => (
                <div key={track.id} className="rounded border p-2">
                  <label className="flex items-start gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={selectedMusicIds.includes(track.id)}
                      disabled={track.enabled === false}
                      onChange={(event) =>
                        onSelectedMusicIdsChange(
                          event.target.checked
                            ? [...new Set([...selectedMusicIds, track.id])]
                            : selectedMusicIds.filter((id) => id !== track.id),
                        )
                      }
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{track.title}</span>
                      <span className="text-[10px] text-slate-500">
                        {track.enabled === false
                          ? "Disabled in music library"
                          : "Available"}
                      </span>
                    </span>
                    <button
                      type="button"
                      disabled={musicBusy}
                      onClick={() => void toggleMusicTrack(track)}
                      className="rounded border px-1.5 py-1 text-[10px] text-violet-700 disabled:opacity-50"
                    >
                      {track.enabled === false ? "Enable" : "Disable"}
                    </button>
                  </label>
                  {track.path && (
                    <audio
                      controls
                      preload="none"
                      src={mediaUrl(track.path)}
                      className="mt-1 h-8 w-full"
                    />
                  )}
                </div>
              ))}
              {!musicTracks.length && (
                <p className="text-xs text-slate-500">
                  Upload a track below or manage existing tracks in this
                  template.
                </p>
              )}
              <button
                type="button"
                onClick={() => musicFileRef.current?.click()}
                className="w-full rounded border border-dashed px-3 py-2 text-xs font-medium text-violet-700"
              >
                {musicBusy ? "Adding music…" : "Upload music track"}
              </button>
              {musicPath && (
                <>
                  <label className="block text-xs">
                    Track title
                    <input
                      value={musicTitle}
                      onChange={(event) => setMusicTitle(event.target.value)}
                      className="mt-1 w-full rounded border px-2 py-1.5"
                    />
                  </label>
                  <button
                    type="button"
                    disabled={musicBusy}
                    onClick={() => void saveMusicTrack()}
                    className="w-full rounded bg-violet-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    Add track to library and template
                  </button>
                </>
              )}
              {musicError && (
                <p role="alert" className="text-xs text-red-700">
                  {musicError}
                </p>
              )}
            </div>
          </details>
          {selected ? (
            <>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">
                  Text properties
                </h3>
                <div className="flex gap-1">
                  <button
                    type="button"
                    title="Center selected layer"
                    onClick={() =>
                      updateText(selected.key, {
                        x: "50%",
                        y: "50%",
                        alignment: "center",
                      })
                    }
                    className="rounded border px-2 py-1 text-xs"
                  >
                    Center
                  </button>
                  <button
                    type="button"
                    title="Duplicate layer"
                    onClick={duplicateLayer}
                    className="rounded border px-2 py-1 text-xs"
                  >
                    Copy
                  </button>
                  <button
                    type="button"
                    title="Delete layer"
                    onClick={() => {
                      updateFrame(currentFrameIndex, {
                        texts: frame.texts.filter(
                          (text) => text.key !== selected.key,
                        ),
                      });
                      setSelectedKey(
                        frame.texts.find((text) => text.key !== selected.key)
                          ?.key ?? "",
                      );
                    }}
                    className="rounded border border-red-200 px-2 py-1 text-xs text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <label className="block text-xs font-medium">
                Layer name
                <input
                  className="mt-1 w-full rounded border px-2 py-1.5 text-sm"
                  value={selected.label}
                  onChange={(event) =>
                    updateText(selected.key, { label: event.target.value })
                  }
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={selected.customerEditable}
                    onChange={(event) =>
                      updateText(selected.key, {
                        customerEditable: event.target.checked,
                      })
                    }
                  />{" "}
                  Customer editable
                </label>
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={selected.required}
                    onChange={(event) =>
                      updateText(selected.key, {
                        required: event.target.checked,
                      })
                    }
                  />{" "}
                  Required
                </label>
              </div>
              <label className="block text-xs">
                Placeholder
                <input
                  className="mt-1 w-full rounded border px-2 py-1.5 text-sm"
                  value={selected.placeholder}
                  onChange={(event) =>
                    updateText(selected.key, {
                      placeholder: event.target.value,
                    })
                  }
                />
              </label>
              <label className="block text-xs">
                Character limit
                <input
                  type="number"
                  min="1"
                  max="2000"
                  className="mt-1 w-full rounded border px-2 py-1.5 text-sm"
                  value={selected.maxLength}
                  onChange={(event) =>
                    updateText(selected.key, { maxLength: event.target.value })
                  }
                />
              </label>
              <label className="block text-xs">
                Search fonts
                <input
                  value={fontQuery}
                  onChange={(event) => setFontQuery(event.target.value)}
                  placeholder="Search installed fonts"
                  className="mt-1 w-full rounded border px-2 py-1.5 text-sm"
                />
              </label>
              <label className="block text-xs">
                Font
                <select
                  className="mt-1 w-full rounded border bg-white px-2 py-1.5 text-sm"
                  value={resolveFontAsset(selected.font).id}
                  onChange={(event) =>
                    updateText(selected.key, { font: event.target.value })
                  }
                >
                  {filteredFonts.map((font) => (
                    <option
                      key={font.id}
                      value={font.id}
                      disabled={!font.renderable}
                    >
                      {font.label}
                    </option>
                  ))}
                </select>
              </label>
              {!resolveFontAsset(selected.font).renderable && (
                <p
                  role="alert"
                  className="rounded bg-amber-50 p-2 text-[11px] text-amber-900"
                >
                  This saved font is WOFF-only. The browser can preview it, but
                  this FFmpeg build cannot render it. Choose a listed font or
                  upload a TTF/OTF file before generating.
                </p>
              )}
              {fontLoadFailures.includes(
                resolveFontAsset(selected.font).id,
              ) && (
                <p
                  role="alert"
                  className="rounded bg-red-50 p-2 text-[11px] text-red-800"
                >
                  The preview font did not load. Check the font asset path or
                  choose another installed font.
                </p>
              )}
              <button
                type="button"
                onClick={() => fontFileRef.current?.click()}
                className="w-full rounded border border-dashed px-2 py-1.5 text-left text-[11px] text-violet-700"
              >
                Upload a TTF/OTF font for browser and FFmpeg rendering
              </button>
              <div className="grid grid-cols-2 gap-2">
                <label className="block text-xs">
                  Size
                  <input
                    type="number"
                    min="6"
                    max="240"
                    className="mt-1 w-full rounded border px-2 py-1.5 text-sm"
                    value={selected.fontSize}
                    onChange={(event) =>
                      updateText(selected.key, { fontSize: event.target.value })
                    }
                  />
                </label>
                <label className="block text-xs">
                  Weight
                  <select
                    className="mt-1 w-full rounded border bg-white px-2 py-1.5 text-sm"
                    value={selected.fontWeight}
                    onChange={(event) =>
                      updateText(selected.key, {
                        fontWeight: event.target.value,
                      })
                    }
                  >
                    <option value="400">Regular</option>
                    <option value="500">Medium</option>
                    <option value="600">Semi bold</option>
                    <option value="700">Bold</option>
                  </select>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="block text-xs">
                  Text color
                  <input
                    type="color"
                    className="mt-1 h-9 w-full rounded border"
                    value={
                      /^#[0-9a-f]{6}$/i.test(selected.fontColor)
                        ? selected.fontColor
                        : "#ffffff"
                    }
                    onChange={(event) =>
                      updateText(selected.key, {
                        fontColor: event.target.value,
                      })
                    }
                  />
                </label>
                <label className="block text-xs">
                  Opacity
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    className="mt-3 w-full"
                    value={selected.opacity}
                    onChange={(event) =>
                      updateText(selected.key, { opacity: event.target.value })
                    }
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="block text-xs">
                  Alignment
                  <select
                    className="mt-1 w-full rounded border bg-white px-2 py-1.5"
                    value={selected.alignment}
                    onChange={(event) =>
                      updateText(selected.key, {
                        alignment: event.target.value,
                      })
                    }
                  >
                    <option>left</option>
                    <option>center</option>
                    <option>right</option>
                  </select>
                </label>
                <label className="block text-xs">
                  Rotation °
                  <input
                    type="number"
                    min="-180"
                    max="180"
                    className="mt-1 w-full rounded border px-2 py-1.5"
                    value={selected.rotation}
                    onChange={(event) =>
                      updateText(selected.key, { rotation: event.target.value })
                    }
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="block text-xs">
                  Letter spacing
                  <input
                    type="number"
                    min="0"
                    max="12"
                    className="mt-1 w-full rounded border px-2 py-1.5"
                    value={
                      resolveFontAsset(selected.font).supportsLetterSpacing
                        ? selected.letterSpacing
                        : "0"
                    }
                    disabled={
                      !resolveFontAsset(selected.font).supportsLetterSpacing
                    }
                    onChange={(event) =>
                      updateText(selected.key, {
                        letterSpacing: event.target.value,
                      })
                    }
                  />
                  {!resolveFontAsset(selected.font).supportsLetterSpacing && (
                    <span className="mt-1 block text-[10px] text-slate-500">
                      Disabled for connected script lettering.
                    </span>
                  )}
                </label>
                <label className="block text-xs">
                  Line spacing
                  <input
                    type="number"
                    min="-10"
                    max="80"
                    className="mt-1 w-full rounded border px-2 py-1.5"
                    value={selected.lineSpacing}
                    onChange={(event) =>
                      updateText(selected.key, {
                        lineSpacing: event.target.value,
                      })
                    }
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="block text-xs">
                  Text box width %
                  <input
                    type="number"
                    min="12"
                    max="100"
                    className="mt-1 w-full rounded border px-2 py-1.5"
                    value={selected.boxWidth}
                    onChange={(event) =>
                      updateText(selected.key, { boxWidth: event.target.value })
                    }
                  />
                </label>
                <label className="block text-xs">
                  Box height %
                  <input
                    type="number"
                    min="5"
                    max="90"
                    className="mt-1 w-full rounded border px-2 py-1.5"
                    value={selected.boxHeight}
                    onChange={(event) =>
                      updateText(selected.key, {
                        boxHeight: event.target.value,
                      })
                    }
                  />
                </label>
              </div>
              <details className="rounded border p-2">
                <summary className="cursor-pointer text-xs font-semibold">
                  Outline, shadow & highlight
                </summary>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <label className="text-xs">
                    Stroke
                    <input
                      type="number"
                      min="0"
                      max="20"
                      className="mt-1 w-full rounded border px-2 py-1"
                      value={selected.strokeWidth}
                      onChange={(event) =>
                        updateText(selected.key, {
                          strokeWidth: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label className="text-xs">
                    Stroke color
                    <input
                      type="color"
                      className="mt-1 h-8 w-full"
                      value={selected.strokeColor}
                      onChange={(event) =>
                        updateText(selected.key, {
                          strokeColor: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label className="text-xs">
                    Shadow X
                    <input
                      type="number"
                      className="mt-1 w-full rounded border px-2 py-1"
                      value={selected.shadowX}
                      onChange={(event) =>
                        updateText(selected.key, {
                          shadowX: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label className="text-xs">
                    Shadow Y
                    <input
                      type="number"
                      className="mt-1 w-full rounded border px-2 py-1"
                      value={selected.shadowY}
                      onChange={(event) =>
                        updateText(selected.key, {
                          shadowY: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label className="text-xs">
                    Shadow color
                    <input
                      type="color"
                      className="mt-1 h-8 w-full"
                      value={selected.shadowColor}
                      onChange={(event) =>
                        updateText(selected.key, {
                          shadowColor: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label className="text-xs">
                    Highlight
                    <input
                      type="color"
                      className="mt-1 h-8 w-full"
                      value={selected.backgroundColor}
                      onChange={(event) =>
                        updateText(selected.key, {
                          backgroundColor: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label className="col-span-2 text-xs">
                    Highlight opacity
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      className="mt-2 w-full"
                      value={selected.backgroundOpacity}
                      onChange={(event) =>
                        updateText(selected.key, {
                          backgroundOpacity: event.target.value,
                        })
                      }
                    />
                  </label>
                </div>
              </details>
              <div className="space-y-3 rounded border p-2">
                <h4 className="text-xs font-semibold">Entrance</h4>
                <label className="block text-xs">
                  Entrance
                  <select
                    className="mt-1 w-full rounded border bg-white px-2 py-1.5"
                    value={selected.animation}
                    onChange={(event) =>
                      updateText(selected.key, {
                        animation: event.target
                          .value as TemplateTextDraft["animation"],
                        ...(event.target.value === "overshoot"
                          ? { animationEasing: "ease-out-back" as const }
                          : {}),
                      })
                    }
                  >
                    {entrances.map((value) => (
                      <option key={value} value={value}>
                        {titlePreset(value)}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="text-xs">
                    Start
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      max={Math.max(
                        0,
                        duration -
                          num(
                            selected.animationDuration,
                            1,
                            0.1,
                            maxStageDuration(duration),
                          ) -
                          (hasExitAnimation(selected)
                            ? num(
                                selected.exitDuration,
                                0.6,
                                0.1,
                                maxStageDuration(duration),
                              )
                            : 0),
                      )}
                      className="mt-1 w-full rounded border px-2 py-1"
                      value={selected.animationDelay}
                      onChange={(event) => {
                        const maxStart = Math.max(
                          0,
                          duration -
                            num(
                              selected.animationDuration,
                              1,
                              0.1,
                              maxStageDuration(duration),
                            ) -
                            (hasExitAnimation(selected)
                              ? num(
                                  selected.exitDuration,
                                  0.6,
                                  0.1,
                                  maxStageDuration(duration),
                                )
                              : 0),
                        );
                        updateText(selected.key, {
                          animationDelay: String(
                            Math.min(
                              maxStart,
                              Math.max(0, Number(event.target.value) || 0),
                            ),
                          ),
                        });
                      }}
                    />
                  </label>
                  <label className="text-xs">
                    Duration
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      max={Math.max(
                        0.1,
                        Math.min(
                          maxStageDuration(duration),
                          duration -
                            num(selected.animationDelay, 0, 0, duration) -
                            (hasExitAnimation(selected)
                              ? num(
                                  selected.exitDuration,
                                  0.6,
                                  0.1,
                                  maxStageDuration(duration),
                                )
                              : 0),
                        ),
                      )}
                      className="mt-1 w-full rounded border px-2 py-1"
                      value={selected.animationDuration}
                      onChange={(event) => {
                        const maxDuration = Math.max(
                          0.1,
                          Math.min(
                            maxStageDuration(duration),
                            duration -
                              num(selected.animationDelay, 0, 0, duration) -
                              (hasExitAnimation(selected)
                                ? num(
                                    selected.exitDuration,
                                    0.6,
                                    0.1,
                                    maxStageDuration(duration),
                                  )
                                : 0),
                          ),
                        );
                        updateText(selected.key, {
                          animationDuration: String(
                            Math.min(
                              maxDuration,
                              Math.max(0.1, Number(event.target.value) || 0.1),
                            ),
                          ),
                        });
                      }}
                    />
                  </label>
                </div>
                <label className="block text-xs">
                  Direction
                  <select
                    className="mt-1 w-full rounded border bg-white px-2 py-1"
                    value={selected.animationDirection}
                    onChange={(event) =>
                      updateText(selected.key, {
                        animationDirection: event.target
                          .value as TemplateTextDraft["animationDirection"],
                      })
                    }
                  >
                    <option value="left">From left</option>
                    <option value="right">From right</option>
                    <option value="top">From top</option>
                    <option value="bottom">From bottom</option>
                  </select>
                </label>
                <label className="block text-xs">
                  Entrance easing
                  <select
                    className="mt-1 w-full rounded border bg-white px-2 py-1"
                    value={selected.animationEasing}
                    onChange={(event) =>
                      updateText(selected.key, {
                        animationEasing: event.target
                          .value as TemplateTextDraft["animationEasing"],
                      })
                    }
                  >
                    <option value="ease-out">Smooth ease out</option>
                    <option value="ease-in">Ease in</option>
                    <option value="ease-in-out">Ease in and out</option>
                    <option value="ease-out-back">Gentle overshoot</option>
                    <option value="linear">Linear</option>
                  </select>
                </label>
                <div className="rounded border p-2">
                  <label className="block text-xs font-semibold">
                    Main motion
                    <select
                      className="mt-1 w-full rounded border bg-white px-2 py-1"
                      value={selected.emphasisAnimation}
                      onChange={(event) =>
                        updateText(selected.key, {
                          emphasisAnimation: event.target
                            .value as TemplateTextDraft["emphasisAnimation"],
                        })
                      }
                    >
                      <option value="none">None</option>
                      <option value="float">Gentle float</option>
                      <option value="pulse">Soft pulse</option>
                      <option value="drift">Slow horizontal drift</option>
                      <option value="rotate">Subtle rotation</option>
                    </select>
                  </label>
                  {selected.emphasisAnimation !== "none" && (
                    <label className="mt-2 block text-xs">
                      Intensity
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        className="mt-2 w-full"
                        value={selected.emphasisIntensity}
                        onChange={(event) =>
                          updateText(selected.key, {
                            emphasisIntensity: event.target.value,
                          })
                        }
                      />
                    </label>
                  )}
                </div>
                <h4 className="text-xs font-semibold">Exit</h4>
                <label className="block text-xs">
                  Exit preset
                  <select
                    className="mt-1 w-full rounded border bg-white px-2 py-1"
                    value={selected.exitAnimation}
                    onChange={(event) =>
                      updateText(selected.key, {
                        exitAnimation: event.target
                          .value as TemplateTextDraft["exitAnimation"],
                      })
                    }
                  >
                    {exits.map((value) => (
                      <option key={value} value={value}>
                        {titlePreset(value)}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="text-xs">
                    Exit starts
                    <input
                      type="number"
                      min={Math.min(
                        duration,
                        num(selected.animationDelay, 0, 0, duration) +
                          num(
                            selected.animationDuration,
                            1,
                            0.1,
                            maxStageDuration(duration),
                          ),
                      )}
                      step="0.1"
                      max={Math.max(
                        0,
                        duration -
                          num(
                            selected.exitDuration,
                            0.6,
                            0.1,
                            maxStageDuration(duration),
                          ),
                      )}
                      className="mt-1 w-full rounded border px-2 py-1"
                      value={
                        selected.exitStart ||
                        Math.max(
                          0,
                          duration - Number(selected.exitDuration || 0.6),
                        )
                      }
                      onChange={(event) => {
                        const minStart =
                          num(selected.animationDelay, 0, 0, duration) +
                          num(
                            selected.animationDuration,
                            1,
                            0.1,
                            maxStageDuration(duration),
                          );
                        const maxStart = Math.max(
                          minStart,
                          duration -
                            num(
                              selected.exitDuration,
                              0.6,
                              0.1,
                              maxStageDuration(duration),
                            ),
                        );
                        updateText(selected.key, {
                          exitStart: String(
                            Math.min(
                              maxStart,
                              Math.max(
                                minStart,
                                Number(event.target.value) || 0,
                              ),
                            ),
                          ),
                        });
                      }}
                    />
                  </label>
                  <label className="text-xs">
                    Exit duration
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      max={Math.max(
                        0.1,
                        Math.min(
                          maxStageDuration(duration),
                          duration -
                            num(
                              selected.exitStart,
                              duration -
                                num(
                                  selected.exitDuration,
                                  0.6,
                                  0.1,
                                  maxStageDuration(duration),
                                ),
                              0,
                              duration,
                            ),
                        ),
                      )}
                      className="mt-1 w-full rounded border px-2 py-1"
                      value={selected.exitDuration}
                      onChange={(event) => {
                        const maxExit = Math.max(
                          0.1,
                          Math.min(
                            maxStageDuration(duration),
                            duration -
                              num(
                                selected.exitStart,
                                duration -
                                  num(
                                    selected.exitDuration,
                                    0.6,
                                    0.1,
                                    maxStageDuration(duration),
                                  ),
                                0,
                                duration,
                              ),
                          ),
                        );
                        updateText(selected.key, {
                          exitDuration: String(
                            Math.min(
                              maxExit,
                              Math.max(0.1, Number(event.target.value) || 0.6),
                            ),
                          ),
                        });
                      }}
                    />
                  </label>
                </div>
                <label className="block text-xs">
                  Visible from
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    max={duration}
                    className="mt-1 w-full rounded border px-2 py-1"
                    value={selected.visibleStart}
                    onChange={(event) =>
                      updateText(selected.key, {
                        visibleStart: event.target.value,
                      })
                    }
                  />
                </label>
                <label className="block text-xs">
                  Visible until
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    max={duration}
                    className="mt-1 w-full rounded border px-2 py-1"
                    value={selected.visibleEnd || duration}
                    onChange={(event) =>
                      updateText(selected.key, {
                        visibleEnd: event.target.value,
                      })
                    }
                  />
                </label>
              </div>
              <label className="block text-xs">
                Exit easing
                <select
                  className="mt-1 w-full rounded border bg-white px-2 py-1"
                  value={selected.exitEasing}
                  onChange={(event) =>
                    updateText(selected.key, {
                      exitEasing: event.target
                        .value as TemplateTextDraft["exitEasing"],
                    })
                  }
                >
                  <option value="ease-out">Smooth ease out</option>
                  <option value="ease-in">Ease in</option>
                  <option value="ease-in-out">Ease in and out</option>
                  <option value="ease-out-back">Gentle overshoot</option>
                  <option value="linear">Linear</option>
                </select>
              </label>
              <div className="rounded border bg-slate-50 p-2">
                <div className="mb-1 flex justify-between text-[10px] text-slate-500">
                  <span>Scene timeline</span>
                  <span>{duration.toFixed(1)}s</span>
                </div>
                <div className="relative h-7 overflow-hidden rounded bg-slate-200">
                  {selected.animation !== "none" && (
                    <div
                      className="absolute inset-y-0 bg-amber-300"
                      style={{
                        left: `${(num(selected.animationDelay, 0, 0, duration) / duration) * 100}%`,
                        width: `${(num(selected.animationDuration, 1, 0.1, maxStageDuration(duration)) / duration) * 100}%`,
                      }}
                    />
                  )}
                  <div
                    className="absolute inset-y-1 rounded bg-violet-500/80"
                    style={{
                      left: `${(num(selected.visibleStart, 0, 0, duration) / duration) * 100}%`,
                      width: `${Math.max(0, ((num(selected.visibleEnd, duration, 0, duration) - num(selected.visibleStart, 0, 0, duration)) / duration) * 100)}%`,
                    }}
                  />
                  {hasExitAnimation(selected) && (
                    <div
                      className="absolute inset-y-0 bg-rose-400"
                      style={{
                        left: `${(num(selected.exitStart, duration - num(selected.exitDuration, 0.6, 0.1, maxStageDuration(duration)), 0, duration) / duration) * 100}%`,
                        width: `${(num(selected.exitDuration, 0.6, 0.1, maxStageDuration(duration)) / duration) * 100}%`,
                      }}
                    />
                  )}
                  <div
                    className="absolute inset-y-0 w-0.5 bg-slate-900"
                    style={{ left: `${(previewTime / duration) * 100}%` }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-[9px] text-slate-500">
                  <span>Entrance</span>
                  <span>Visible</span>
                  <span>Exit</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500">
              Select a text layer or click Add Text.
            </p>
          )}
        </aside>
      </div>
    </section>
  );
}
