import {
  hasUniqueTextKeys,
  normalizeConfigForEditor,
} from "@/lib/template-config";
import { resolveFontAsset } from "@/lib/font-registry";
import { templateCategoryForSlug } from "@/lib/template-categories";

export type AnimationPreset =
  | "none"
  | "fade-in"
  | "fade-in-out"
  | "slide-in"
  | "slide-fade"
  | "rise-in"
  | "slide-in-out"
  | "zoom-in"
  | "zoom-in-out"
  | "scale-fade"
  | "soft-pop"
  | "cinematic-title"
  | "rotate-in"
  | "overshoot"
  | "fade-out"
  | "slide-out"
  | "zoom-out"
  | "rotate-out"
  | "typewriter"
  | "character-reveal"
  | "word-reveal"
  | "character-pop"
  | "float"
  | "pulse";

export type TemplateTextDraft = {
  key: string;
  label: string;
  placeholder: string;
  required: boolean;
  text: string;
  font: string;
  fontSize: string;
  fontColor: string;
  x: string;
  y: string;
  alignment: string;
  maxLength: string;
  customerEditable: boolean;
  visible: boolean;
  boxWidth: string;
  boxHeight: string;
  fontWeight: string;
  italic: boolean;
  letterSpacing: string;
  lineSpacing: string;
  opacity: string;
  rotation: string;
  strokeWidth: string;
  strokeColor: string;
  shadowX: string;
  shadowY: string;
  shadowColor: string;
  backgroundColor: string;
  backgroundOpacity: string;
  backgroundPadding: string;
  visibleStart: string;
  visibleEnd: string;
  animation: AnimationPreset;
  animationDuration: string;
  animationDelay: string;
  animationDirection: "left" | "right" | "top" | "bottom";
  animationEasing:
    | "linear"
    | "ease-in"
    | "ease-out"
    | "ease-in-out"
    | "ease-out-back";
  exitAnimation: AnimationPreset;
  exitDuration: string;
  exitStart: string;
  exitEasing:
    | "linear"
    | "ease-in"
    | "ease-out"
    | "ease-in-out"
    | "ease-out-back";
  emphasisAnimation: "none" | "float" | "pulse" | "drift" | "rotate";
  emphasisIntensity: string;
  extra: Record<string, unknown>;
  animationExtra: Record<string, unknown>;
};

export type TemplateFrameDraft = {
  title: string;
  sourceVideo: string;
  previewImage: string;
  durationSeconds: string;
  texts: TemplateTextDraft[];
  backgroundFit: "contain" | "cover" | "fill";
  focalX: string;
  focalY: string;
  configExtras: Record<string, unknown>;
};

export type TemplateSavePayload = {
  title: string;
  slug: string;
  description: string;
  categorySlug?: string | null;
  price: number;
  durationSeconds: number;
  thumbnail: string;
  previewVideo: string | null;
  sourceVideo: string | null;
  active: boolean;
  musicConfigured: boolean;
  musicTrackIds: string[];
  frames: Array<{
    frameNumber: number;
    title: string;
    sourceVideo: string;
    previewImage: string | null;
    durationSeconds: number | null;
    placeholderConfig: Record<string, unknown>;
  }>;
  music?: { title: string; path: string; duration: number | null } | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export const blankText = (
  key = "event_name",
  label = "Event Name",
): TemplateTextDraft => ({
  key,
  label,
  placeholder: "Enter invitation text...",
  required: false,
  text: "",
  font: "DejaVuSans",
  fontSize: "48",
  fontColor: "#ffffff",
  x: "50%",
  y: "50%",
  alignment: "center",
  maxLength: "100",
  customerEditable: true,
  visible: true,
  boxWidth: "90",
  boxHeight: "20",
  fontWeight: "400",
  italic: false,
  letterSpacing: "0",
  lineSpacing: "8",
  opacity: "1",
  rotation: "0",
  strokeWidth: "0",
  strokeColor: "#000000",
  shadowX: "0",
  shadowY: "0",
  shadowColor: "#000000",
  backgroundColor: "#000000",
  backgroundOpacity: "0",
  backgroundPadding: "8",
  visibleStart: "0",
  visibleEnd: "",
  animation: "none",
  animationDuration: "1",
  animationDelay: "0",
  animationDirection: "bottom",
  animationEasing: "ease-out",
  exitAnimation: "none",
  exitDuration: "0.6",
  exitStart: "",
  exitEasing: "ease-out",
  emphasisAnimation: "none",
  emphasisIntensity: "0.45",
  extra: {},
  animationExtra: {},
});

export const blankFrame = (number: number): TemplateFrameDraft => ({
  title: `Frame ${number}`,
  sourceVideo: "",
  previewImage: "",
  durationSeconds: "5",
  texts: [blankText("event_name", "Event Name")],
  backgroundFit: "contain",
  focalX: "50",
  focalY: "50",
  configExtras: {},
});

export function textDraftFromConfig(
  value: unknown,
  index: number,
): TemplateTextDraft {
  const item = isRecord(value) ? value : {};
  const {
    key,
    name,
    label,
    placeholder,
    required,
    text,
    font,
    fontFile,
    fontSize,
    fontColor,
    color,
    x,
    y,
    position,
    alignment,
    maxLength,
    anim,
    customerEditable,
    visible,
    boxWidth,
    boxHeight,
    fontWeight,
    italic,
    letterSpacing,
    lineSpacing,
    opacity,
    rotation,
    strokeWidth,
    strokeColor,
    shadowX,
    shadowY,
    shadowColor,
    backgroundColor,
    backgroundOpacity,
    backgroundPadding,
    visibleStart,
    visibleEnd,
    ...extra
  } = item;
  const rawAnim = isRecord(anim) ? anim : {};
  const supported: AnimationPreset[] = [
    "fade-in",
    "fade-in-out",
    "slide-in",
    "slide-fade",
    "rise-in",
    "slide-in-out",
    "zoom-in",
    "zoom-in-out",
    "scale-fade",
    "soft-pop",
    "cinematic-title",
    "rotate-in",
    "overshoot",
    "fade-out",
    "slide-out",
    "zoom-out",
    "rotate-out",
    "typewriter",
    "character-reveal",
    "word-reveal",
    "character-pop",
    "float",
    "pulse",
  ];
  const {
    type,
    duration,
    delay,
    direction,
    easing,
    entrance,
    exit,
    emphasis,
    ...animationExtra
  } = rawAnim;
  const entranceStage = isRecord(entrance) ? entrance : {};
  const exitStage = isRecord(exit) ? exit : {};
  const emphasisStage = isRecord(emphasis) ? emphasis : {};
  const savedPosition = isRecord(position) ? position : {};
  const rawEntrance = String(entranceStage.type ?? type ?? "none");
  const entrancePreset =
    rawEntrance === "fade-in-out"
      ? "fade-in"
      : rawEntrance === "slide-in-out"
        ? "slide-in"
        : rawEntrance === "zoom-in-out"
          ? "zoom-in"
          : rawEntrance;
  const legacyExit =
    rawEntrance === "fade-in-out"
      ? "fade-out"
      : rawEntrance === "slide-in-out"
        ? "slide-out"
        : rawEntrance === "zoom-in-out"
          ? "zoom-out"
          : "none";
  const rawExit = String(exitStage.type ?? legacyExit);
  const exitPreset =
    rawExit === "fade-in-out"
      ? "fade-out"
      : rawExit === "slide-in-out"
        ? "slide-out"
        : rawExit === "zoom-in-out"
          ? "zoom-out"
          : rawExit;
  return {
    key: String(key ?? name ?? `text_${index + 1}`),
    label: String(label ?? name ?? key ?? `Text field ${index + 1}`),
    placeholder: String(placeholder ?? ""),
    required: required === true,
    text: String(text ?? ""),
    font: resolveFontAsset(fontFile ?? font ?? "DejaVuSans.ttf").id,
    fontSize: String(fontSize ?? 48),
    fontColor: String(fontColor ?? color ?? "#ffffff"),
    x: String(x ?? savedPosition.x ?? "50%"),
    y: String(y ?? savedPosition.y ?? "50%"),
    alignment: String(alignment ?? "center"),
    maxLength: String(maxLength ?? 100),
    customerEditable: customerEditable !== false,
    visible: visible !== false,
    boxWidth: String(boxWidth ?? 90),
    boxHeight: String(boxHeight ?? 20),
    fontWeight: String(fontWeight ?? 400),
    italic: italic === true,
    letterSpacing: String(letterSpacing ?? 0),
    lineSpacing: String(lineSpacing ?? 8),
    opacity: String(opacity ?? 1),
    rotation: String(rotation ?? 0),
    strokeWidth: String(strokeWidth ?? 0),
    strokeColor: String(strokeColor ?? "#000000"),
    shadowX: String(shadowX ?? 0),
    shadowY: String(shadowY ?? 0),
    shadowColor: String(shadowColor ?? "#000000"),
    backgroundColor: String(backgroundColor ?? "#000000"),
    backgroundOpacity: String(backgroundOpacity ?? 0),
    backgroundPadding: String(backgroundPadding ?? 8),
    visibleStart: String(visibleStart ?? 0),
    visibleEnd: String(visibleEnd ?? ""),
    animation: supported.includes(entrancePreset as AnimationPreset)
      ? (entrancePreset as AnimationPreset)
      : "none",
    animationDuration: String(entranceStage.duration ?? duration ?? 1),
    animationDelay: String(
      entranceStage.start ?? entranceStage.delay ?? delay ?? 0,
    ),
    animationDirection: ["left", "right", "top", "bottom"].includes(
      String(entranceStage.direction ?? direction),
    )
      ? (String(
          entranceStage.direction ?? direction,
        ) as TemplateTextDraft["animationDirection"])
      : "bottom",
    animationEasing: [
      "linear",
      "ease-in",
      "ease-out",
      "ease-in-out",
      "ease-out-back",
    ].includes(String(entranceStage.easing ?? easing))
      ? (String(
          entranceStage.easing ?? easing,
        ) as TemplateTextDraft["animationEasing"])
      : "ease-out",
    exitAnimation: supported.includes(exitPreset as AnimationPreset)
      ? (exitPreset as AnimationPreset)
      : "none",
    exitDuration: String(exitStage.duration ?? 0.6),
    exitStart: String(exitStage.start ?? exitStage.delay ?? ""),
    exitEasing: [
      "linear",
      "ease-in",
      "ease-out",
      "ease-in-out",
      "ease-out-back",
    ].includes(String(exitStage.easing))
      ? (String(exitStage.easing) as TemplateTextDraft["exitEasing"])
      : "ease-out",
    emphasisAnimation: ["float", "pulse", "drift", "rotate"].includes(
      String(emphasisStage.type),
    )
      ? (String(emphasisStage.type) as TemplateTextDraft["emphasisAnimation"])
      : "none",
    emphasisIntensity: String(emphasisStage.intensity ?? 0.45),
    extra,
    animationExtra,
  };
}

export function frameDraftFromConfig(
  value: unknown,
  index: number,
): TemplateFrameDraft {
  const frame = isRecord(value) ? value : {};
  const raw = frame.placeholderConfig ?? frame.legacyPlaceholderConfig ?? {};
  const normalized = normalizeConfigForEditor(raw);
  const { texts, backgroundFit, focalX, focalY, ...configExtras } = normalized;
  const textDrafts = Array.isArray(texts) ? texts.map(textDraftFromConfig) : [];
  return {
    title: String(frame?.title ?? `Frame ${index + 1}`),
    sourceVideo: String(frame?.sourceVideo ?? ""),
    previewImage: String(frame?.previewImage ?? ""),
    durationSeconds: String(frame?.durationSeconds ?? 5),
    texts: textDrafts.length ? textDrafts : [blankText()],
    backgroundFit: ["cover", "fill"].includes(String(backgroundFit))
      ? (String(backgroundFit) as TemplateFrameDraft["backgroundFit"])
      : "contain",
    focalX: String(focalX ?? 50),
    focalY: String(focalY ?? 50),
    configExtras,
  };
}

export function frameConfigFromDraft(frame: TemplateFrameDraft) {
  return {
    ...frame.configExtras,
    backgroundFit: frame.backgroundFit,
    focalX: Number(frame.focalX || 50),
    focalY: Number(frame.focalY || 50),
    texts: frame.texts.map((item) => ({
      ...item.extra,
      key: item.key.trim() || "text",
      label: item.label.trim() || item.key.trim() || "Text",
      placeholder: item.placeholder,
      required: item.required,
      text: item.text,
      font: resolveFontAsset(item.font || "DejaVuSans.ttf").id,
      fontSize: Number(item.fontSize || 48),
      fontColor: item.fontColor || "#ffffff",
      x: item.x || "50%",
      y: item.y || "50%",
      alignment: item.alignment || "center",
      maxLength: Number(item.maxLength || 100),
      customerEditable: item.customerEditable,
      visible: item.visible,
      boxWidth: Number(item.boxWidth || 90),
      boxHeight: Number(item.boxHeight || 20),
      fontWeight: Number(item.fontWeight || 400),
      italic: item.italic,
      letterSpacing: Number(item.letterSpacing || 0),
      lineSpacing: Number(item.lineSpacing || 8),
      opacity: Number(item.opacity || 1),
      rotation: Number(item.rotation || 0),
      strokeWidth: Number(item.strokeWidth || 0),
      strokeColor: item.strokeColor || "#000000",
      shadowX: Number(item.shadowX || 0),
      shadowY: Number(item.shadowY || 0),
      shadowColor: item.shadowColor || "#000000",
      backgroundColor: item.backgroundColor || "#000000",
      backgroundOpacity: Number(item.backgroundOpacity || 0),
      backgroundPadding: Number(item.backgroundPadding || 8),
      visibleStart: Number(item.visibleStart || 0),
      visibleEnd: item.visibleEnd === "" ? null : Number(item.visibleEnd),
      ...(item.animation !== "none" ||
      item.exitAnimation !== "none" ||
      item.emphasisAnimation !== "none"
        ? {
            anim: {
              ...item.animationExtra,
              type: item.animation,
              duration: Number(item.animationDuration || 1),
              delay: Number(item.animationDelay || 0),
              direction: item.animationDirection,
              easing: item.animationEasing,
              entrance: {
                type: item.animation,
                duration: Number(item.animationDuration || 1),
                start: Number(item.animationDelay || 0),
                direction: item.animationDirection,
                easing: item.animationEasing,
              },
              ...(item.exitAnimation !== "none"
                ? {
                    exit: {
                      type: item.exitAnimation,
                      duration: Number(item.exitDuration || 0.6),
                      start: Number(
                        item.exitStart ||
                          Math.max(
                            0,
                            Number(frame.durationSeconds || 5) -
                              Number(item.exitDuration || 0.6),
                          ),
                      ),
                      direction: item.animationDirection,
                      easing: item.exitEasing,
                    },
                  }
                : {}),
              ...(item.emphasisAnimation !== "none"
                ? {
                    emphasis: {
                      type: item.emphasisAnimation,
                      intensity: Number(item.emphasisIntensity || 0.45),
                    },
                  }
                : {}),
            },
          }
        : {}),
    })),
  };
}

export function templateSavePayload(input: {
  title: string;
  slug: string;
  description: string;
  categorySlug?: string | null;
  price: string;
  durationSeconds: string;
  thumbnail: string;
  previewVideo: string;
  sourceVideo: string;
  active: boolean;
  frames: TemplateFrameDraft[];
  musicTrackIds: string[];
  music?: TemplateSavePayload["music"];
}): TemplateSavePayload {
  return {
    title: input.title.trim(),
    slug: input.slug.trim(),
    description: input.description.trim(),
    ...(input.categorySlug !== undefined
      ? { categorySlug: input.categorySlug || null }
      : {}),
    price: Number(input.price || 0),
    durationSeconds: Number(input.durationSeconds || 0),
    thumbnail: input.thumbnail,
    previewVideo: input.previewVideo || null,
    sourceVideo: input.sourceVideo || null,
    active: input.active,
    musicConfigured: true,
    musicTrackIds: [...new Set(input.musicTrackIds)],
    frames: input.frames.map((frame, index) => ({
      frameNumber: index + 1,
      title: frame.title.trim() || `Frame ${index + 1}`,
      sourceVideo: frame.sourceVideo,
      previewImage: frame.previewImage || null,
      durationSeconds: Number(frame.durationSeconds || 0) || null,
      placeholderConfig: frameConfigFromDraft(frame),
    })),
    ...(input.music ? { music: input.music } : {}),
  };
}

export function parseTemplateJson(value: string): TemplateSavePayload {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch (error) {
    throw new Error(
      `Invalid JSON: ${error instanceof Error ? error.message : "check commas and quotes."}`,
    );
  }
  if (!isRecord(parsed)) {
    throw new Error("Template JSON must be an object.");
  }
  const frames = parsed.frames;
  if (!Array.isArray(frames) || frames.length === 0) {
    throw new Error("Add at least one frame in the JSON configuration.");
  }
  if (typeof parsed.title !== "string" || !parsed.title.trim()) {
    throw new Error("Template title is required.");
  }
  if (typeof parsed.thumbnail !== "string" || !parsed.thumbnail.trim()) {
    throw new Error("Template thumbnail path is required.");
  }
  const normalizedFrames = frames.map((value, index) => {
    const frame = isRecord(value) ? value : {};
    if (typeof frame.sourceVideo !== "string" || !frame.sourceVideo.trim()) {
      throw new Error(`Frame ${index + 1} requires a source video path.`);
    }
    if (!isRecord(frame.placeholderConfig)) {
      throw new Error(`Frame ${index + 1} has invalid placeholderConfig.`);
    }
    if (!hasUniqueTextKeys(frame.placeholderConfig)) {
      throw new Error(`Frame ${index + 1} has duplicate editable field keys.`);
    }
    return {
      ...frame,
      sourceVideo: frame.sourceVideo.trim(),
      placeholderConfig: frame.placeholderConfig,
    };
  });
  if (
    parsed.musicTrackIds !== undefined &&
    (!Array.isArray(parsed.musicTrackIds) ||
      parsed.musicTrackIds.some((id) => typeof id !== "string"))
  ) {
    throw new Error("musicTrackIds must be an array of track IDs.");
  }
  if (!Number.isFinite(Number(parsed.price)) || Number(parsed.price) < 0) {
    throw new Error("Price must be zero or greater.");
  }
  if (
    !Number.isInteger(Number(parsed.durationSeconds)) ||
    Number(parsed.durationSeconds) < 1
  ) {
    throw new Error("Template duration must be a positive number of seconds.");
  }
  const importedMusicIds = Array.isArray(parsed.musicTrackIds)
    ? parsed.musicTrackIds.filter((id): id is string => typeof id === "string")
    : Array.isArray(parsed.musicTracks)
      ? parsed.musicTracks.flatMap((track) =>
          isRecord(track) && typeof track.id === "string" ? [track.id] : [],
        )
      : [];
  const importedCategory =
    parsed.categorySlug === null || parsed.categorySlug === ""
      ? null
      : templateCategoryForSlug(parsed.categorySlug);
  if (
    parsed.categorySlug !== undefined &&
    parsed.categorySlug !== null &&
    parsed.categorySlug !== "" &&
    !importedCategory
  ) {
    throw new Error("Select a valid template category.");
  }
  return {
    ...parsed,
    price: Number(parsed.price),
    durationSeconds: Number(parsed.durationSeconds),
    slug: typeof parsed.slug === "string" ? parsed.slug : "",
    categorySlug: importedCategory?.slug ?? null,
    musicConfigured: true,
    active: parsed.active !== false,
    frames: normalizedFrames as TemplateSavePayload["frames"],
    musicTrackIds: [...new Set(importedMusicIds)],
  } as TemplateSavePayload;
}
