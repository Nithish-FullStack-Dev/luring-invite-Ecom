import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";
import { normalizePublicPath, resolvePublicFile } from "@/lib/media";
import {
  normalizeNewlines,
  normalizeConfigForEditor,
} from "@/lib/template-config";
import { easeProgress, ffmpegProgress, ffmpegTransitionName, resolveSceneTransition, resolveTextMotion, timeForEasedProgress } from "@/lib/text-motion";
import {
  resolveFontAsset,
  resolveFontFallbackSequence,
  serverFontPath,
} from "@/lib/font-registry";
import { requiresComplexShaping, revealPrefix, revealUnits, supportsTextLetterSpacing } from "@/lib/text-reveal";
import { createFontGlyphChecker, formatMissingCodePoints, readFontFamilyName } from "@/lib/font-glyphs";
import { escapeSvgText, renderShapedSvgSequence, shapedTextSequenceDirectory } from "@/lib/shaped-text";
import {
  compositionPositionPixels,
  wrapInvitationText,
} from "@/lib/text-layout";

const execFileAsync = promisify(execFile);
const PROJECT_ROOT = process.cwd();
const PUBLIC_ROOT = path.join(PROJECT_ROOT, "public");
const PRIVATE_STORAGE_ROOT = path.join(PROJECT_ROOT, "storage");
const FFMPEG = process.env.FFMPEG_PATH || "ffmpeg";
const FFPROBE = process.env.FFPROBE_PATH || "ffprobe";
const fontCoverageCache = new Map<string, ReturnType<typeof createFontGlyphChecker>>();
let shapingCapabilities: Promise<{ harfbuzz: boolean; fribidi: boolean; drawtextOption: boolean }> | null = null;
const MAX_RENDER_SECONDS = Math.max(
  30,
  Number(process.env.MAX_RENDER_SECONDS || 180),
);

type FrameInput = Record<string, unknown>;
type RendererTextConfig = Record<string, unknown> & {
  key?: unknown;
  text?: unknown;
  font?: unknown;
  fontFile?: unknown;
  fontSize?: unknown;
  fontColor?: unknown;
  color?: unknown;
  x?: unknown;
  y?: unknown;
  position?: { x?: unknown; y?: unknown } | null;
  alignment?: unknown;
  anim?: unknown;
  enable?: unknown;
  start?: unknown;
  end?: unknown;
  alpha?: unknown;
};
type RenderFrame = {
  id: number | string;
  frameNumber: number;
  title: string | null;
  sourceVideo: string | null;
  previewImage: string | null;
  placeholderConfig: unknown;
  durationSeconds: number | null;
};

type GenerateOptions = {
  templateId: number;
  templateTitle: string;
  frames: RenderFrame[];
  framesData: Record<string, FrameInput>;
  musicPath?: string | null;
  watermark?: boolean;
};
type CanvasSize = { width: number; height: number };

async function createPreviewWatermark(filePath: string, canvas: CanvasSize) {
  const fontSize = Math.max(30, Math.round(Math.min(canvas.width, canvas.height) * 0.055));
  const columnGap = Math.max(190, Math.round(canvas.width * 0.34));
  const rowGap = Math.max(115, Math.round(canvas.height * 0.13));
  const labels: string[] = [];
  for (let y = -canvas.height; y < canvas.height * 2; y += rowGap) {
    for (let x = -canvas.width; x < canvas.width * 2; x += columnGap) {
      labels.push(`<text x="${x}" y="${y}" fill="white" fill-opacity="0.23" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="800">outrightsluringinvite</text>`);
    }
  }
  const svg = `<svg width="${canvas.width}" height="${canvas.height}" xmlns="http://www.w3.org/2000/svg"><g transform="rotate(-25 ${canvas.width / 2} ${canvas.height / 2})">${labels.join("")}</g></svg>`;
  await sharp(Buffer.from(svg)).png().toFile(filePath);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function normalizeAbsoluteForConcat(absPath: string): string {
  // FFmpeg concat demuxer accepts forward-slash paths on Windows.
  return path.resolve(absPath).replace(/\\/g, "/").replace(/'/g, "'\\''");
}

function colorForFfmpeg(value: unknown): string {
  const input = String(value ?? "#000000").trim();
  if (/^#[0-9a-fA-F]{6}$/.test(input)) return `0x${input.slice(1)}`;
  if (/^[0-9a-fA-F]{6}$/.test(input)) return `0x${input}`;
  if (/^0x[0-9a-fA-F]{6,8}$/.test(input)) return input;
  if (/^[a-zA-Z]{1,30}$/.test(input)) return input.toLowerCase();
  return "black";
}

function validPosition(
  value: unknown,
  axis: "x" | "y",
  alignment: "left" | "center" | "right" = "center",
  compositionDimension: number,
): string {
  const anchor = compositionPositionPixels(
    value,
    compositionDimension,
    50,
    axis,
  );
  if (axis !== "x" || alignment === "left") return String(anchor);
  if (alignment === "right") return `(${anchor}-text_w)`;
  return `(${anchor}-text_w/2)`;
}

function validEnable(value: unknown): string | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const raw = String(value).trim();
  const normalized = raw.toLowerCase();

  // FFmpeg does not accept the JavaScript boolean string "true".
  // Omit enable entirely when the text should always be visible.
  if (normalized === "true") return null;

  // FFmpeg expression 0 disables the filter.
  if (normalized === "false") return "0";

  if (raw.length > 160) return null;

  if (/^[a-zA-Z0-9_(),.+*/<>=! \-]+$/.test(raw)) {
    return raw;
  }

  return null;
}

function applyLetterSpacing(value: string, pixels: number, fontSize: number): string {
  if (!supportsTextLetterSpacing(value)) return value;
  const hairSpaceWidth = Math.max(1, fontSize * 0.1);
  const count = Math.min(6, Math.max(0, Math.round(pixels / hairSpaceWidth)));
  if (!count) return value;
  const spacer = "\u200a".repeat(count);
  const characters = typeof Intl.Segmenter === "function"
    ? Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(value), (part) => part.segment)
    : Array.from(value);
  return characters.join(spacer);
}

function ffmpegEscapeFilterPath(relativePath: string): string {
  // All paths are generated beneath public/media without colons or quotes.
  return relativePath.replace(/\\/g, "/").replace(/'/g, "\\'");
}

function characterClasses(value: string) {
  return Array.from(new Set(Array.from(value).map((character) => {
    const code = character.codePointAt(0) ?? 0;
    if (/^\s+$/u.test(character)) return "space";
    if (/\p{Script=Arabic}/u.test(character)) return "arabic";
    if (/\p{Script=Devanagari}/u.test(character)) return "devanagari";
    if (/\p{Script=Bengali}/u.test(character)) return "bengali";
    if (/\p{Script=Gurmukhi}/u.test(character)) return "gurmukhi";
    if (/\p{Script=Gujarati}/u.test(character)) return "gujarati";
    if (/\p{Script=Oriya}/u.test(character)) return "oriya";
    if (/\p{Script=Tamil}/u.test(character)) return "tamil";
    if (/\p{Script=Telugu}/u.test(character)) return "telugu";
    if (/\p{Script=Kannada}/u.test(character)) return "kannada";
    if (/\p{Script=Malayalam}/u.test(character)) return "malayalam";
    if (/\p{Script=Sinhala}/u.test(character)) return "sinhala";
    if (/\p{Script=Thai}/u.test(character)) return "thai";
    if (/\p{Script=Hebrew}/u.test(character)) return "hebrew";
    if (/\p{Script=Greek}/u.test(character)) return "greek";
    if (/\p{Script=Cyrillic}/u.test(character)) return "cyrillic";
    if (/\p{Script=Han}/u.test(character)) return "han";
    if (/\p{Script=Hiragana}/u.test(character)) return "hiragana";
    if (/\p{Script=Katakana}/u.test(character)) return "katakana";
    if (/\p{Script=Hangul}/u.test(character)) return "hangul";
    if (/\p{Mark}/u.test(character)) return "mark";
    if (code >= 0x1f300 && code <= 0x1faff) return "emoji";
    return "latin";
  })));
}

export async function resolveTextRenderFont(fontValue: unknown, text: string, weight: unknown = 400) {
  const preferredFont = resolveFontAsset(fontValue);
  const sequence = resolveFontFallbackSequence(fontValue, text);
  const textSample = String(text ?? "");
  let bestMissing: number[] | null = null;
  let bestFont = preferredFont;
  let lastFontIssue = "";
  const checkedFonts: Array<{
    font: ReturnType<typeof resolveFontAsset>;
    path: string;
    filePath: string;
    missing: number[];
    family: string;
  }> = [];
  for (const candidate of sequence) {
    if (!candidate.serverPath || !candidate.renderable) continue;
    let relativePath: string;
    try {
      relativePath = serverFontPath(candidate.id, candidate.id === preferredFont.id ? weight : 400);
    } catch (error) {
      lastFontIssue = error instanceof Error ? error.message : String(error);
      continue;
    }
    const fontPath = path.resolve(PROJECT_ROOT, relativePath);
    let checker = fontCoverageCache.get(fontPath);
    let missing: number[];
    try {
      await fs.access(fontPath);
      if (!checker) {
        checker = createFontGlyphChecker(await fs.readFile(fontPath));
        fontCoverageCache.set(fontPath, checker);
      }
      missing = checker(textSample);
    } catch (error) {
      lastFontIssue = error instanceof Error ? error.message : String(error);
      continue;
    }
    if (missing.length === 0) {
      return {
        font: candidate,
        path: relativePath,
        filePath: fontPath,
        supportsAllGlyphs: true,
        familyStack: [readFontFamilyName(await fs.readFile(fontPath)) || candidate.label],
        useShapedOverlay: candidate.id === "noto/NotoNastaliqUrdu-Regular.otf",
      };
    }
    checkedFonts.push({
      font: candidate,
      path: relativePath,
      filePath: fontPath,
      missing,
      family: readFontFamilyName(await fs.readFile(fontPath)) || candidate.label,
    });
    if (!bestMissing || missing.length < bestMissing.length) {
      bestMissing = missing;
      bestFont = candidate;
    }
  }

  const codePoints = Array.from(new Set(Array.from(textSample, (character) => character.codePointAt(0) ?? 0)));
  const unionMissing = codePoints.filter((codePoint) =>
    checkedFonts.every(({ missing }) => missing.includes(codePoint))
  );
  if (checkedFonts.length && unionMissing.length === 0) {
    const primary = checkedFonts.find(({ font }) => font.id === preferredFont.id) ?? checkedFonts[0];
    return {
      font: primary.font,
      path: primary.path,
      filePath: primary.filePath,
      supportsAllGlyphs: false,
      familyStack: checkedFonts.map(({ family }) => family),
      fallbackFonts: checkedFonts.map(({ font }) => font),
    };
  }

  const scriptNames = characterClasses(textSample)
    .filter((name) => name !== "space" && name !== "latin")
    .join(", ") || "this text";
  const unresolved = unionMissing.length ? unionMissing : (bestMissing ?? []);
  const missing = unresolved.length
    ? ` Missing glyphs: ${formatMissingCodePoints(unresolved)}.`
    : " No compatible font file is installed.";
  const offered = sequence.filter((font) => font.renderable).map((font) => font.label).join(", ");
  throw new Error(
    `No installed font can render all characters in ${scriptNames}.${missing} Selected font: ${preferredFont.label}; closest match: ${bestFont.label}. Checked: ${offered || "none"}.${lastFontIssue ? ` Font check detail: ${lastFontIssue}` : ""} Upload a valid TTF/OTF font containing these glyphs, then retry.`,
  );
}

async function verifyFfmpegTextShaping(text: string) {
  if (!requiresComplexShaping(text)) return;
  if (!shapingCapabilities) {
    shapingCapabilities = (async () => {
      const [help, build] = await Promise.all([
        execFileAsync(FFMPEG, ["-hide_banner", "-h", "filter=drawtext"], {
          cwd: PROJECT_ROOT, timeout: 15000, maxBuffer: 1024 * 1024, windowsHide: true,
        }),
        execFileAsync(FFMPEG, ["-hide_banner", "-buildconf"], {
          cwd: PROJECT_ROOT, timeout: 15000, maxBuffer: 1024 * 1024, windowsHide: true,
        }),
      ]);
      const helpOutput = `${help.stdout}\n${help.stderr}`;
      const buildOutput = `${build.stdout}\n${build.stderr}`;
      return {
        drawtextOption: /\btext_shaping\s+</i.test(helpOutput),
        harfbuzz: /--enable-libharfbuzz\b/i.test(buildOutput),
        fribidi: /--enable-libfribidi\b/i.test(buildOutput),
      };
    })().catch((error) => {
      shapingCapabilities = null;
      throw error;
    });
  }
  const capabilities = await shapingCapabilities;
  const rtl = /[\p{Script=Arabic}\p{Script=Hebrew}\p{Script=Syriac}\p{Script=Thaana}\p{Script=Nko}]/u.test(text);
  if (!capabilities.drawtextOption || !capabilities.harfbuzz || (rtl && !capabilities.fribidi)) {
    const required = rtl ? "HarfBuzz, FriBidi, and drawtext text_shaping" : "HarfBuzz and drawtext text_shaping";
    throw new Error(
      `This FFmpeg installation cannot shape the requested complex script. Video rendering requires ${required}. Install an FFmpeg build with those features and retry.`,
    );
  }
}

async function runFfmpeg(args: string[]): Promise<void> {
  try {
    await execFileAsync(FFMPEG, args, {
      cwd: PROJECT_ROOT,
      timeout: MAX_RENDER_SECONDS * 1000,
      maxBuffer: 20 * 1024 * 1024,
      windowsHide: true,
    });
  } catch (error: unknown) {
    const stderrValue = isRecord(error) ? error.stderr : undefined;
    const stderr = String(
      stderrValue || (error instanceof Error ? error.message : "FFmpeg failed."),
    );
    throw new Error(stderr.slice(-6000));
  }
}

type VideoMetadata = { width: number; height: number; duration: number | null };

async function probeVideo(filePath: string): Promise<VideoMetadata> {
  try {
    const { stdout } = await execFileAsync(
      FFPROBE,
      [
        "-v", "error", "-select_streams", "v:0",
        "-show_entries", "stream=width,height,duration",
        "-show_entries", "format=duration", "-of", "json", filePath,
      ],
      { cwd: PROJECT_ROOT, timeout: 15000, maxBuffer: 1024 * 1024, windowsHide: true },
    );
    const result = JSON.parse(stdout);
    const stream = result.streams?.[0] ?? {};
    const duration = Number(stream.duration ?? result.format?.duration);
    return {
      width: Math.max(2, Number(stream.width) || 1080),
      height: Math.max(2, Number(stream.height) || 1920),
      duration: Number.isFinite(duration) && duration > 0 ? duration : null,
    };
  } catch {
    return { width: 1080, height: 1920, duration: null };
  }
}

function outputCanvas(metadata: VideoMetadata): CanvasSize {
  const factor = Math.min(1080 / metadata.width, 1920 / metadata.height);
  const even = (value: number) => Math.max(2, Math.round(value / 2) * 2);
  return {
    width: even(metadata.width * factor),
    height: even(metadata.height * factor),
  };
}

function getFrameTexts(configValue: unknown, frameInput: FrameInput): RendererTextConfig[] {
  const config = normalizeConfigForEditor(configValue);
  const texts = Array.isArray(config.texts) ? config.texts : [];
  return texts.filter((value) => !isRecord(value) || value.visible !== false).map((value, index) => {
    const item = isRecord(value) ? value : {};
    return {
      ...item,
      text: normalizeNewlines(
        frameInput[String(item.key ?? `text_${index}`)] ??
          frameInput[`text_${index}`] ??
          item.text,
      ),
    };
  });
}

type ShapedTextLayer = {
  config: RendererTextConfig;
  familyStack: string[];
  lines: string[];
  fontSize: number;
  boxWidth: number;
  boxHeight: number;
  alignment: "left" | "center" | "right";
  letterSpacing: number;
};

function svgColor(value: unknown, fallback: string) {
  const color = String(value ?? fallback).trim();
  return /^(#[\da-f]{3,8}|[a-z]{1,30}|rgba?\([\d.% ,]+\))$/i.test(color) ? color : fallback;
}

function renderMotionTextConfig(config: RendererTextConfig) {
  if (isRecord(config.anim)) return config.anim;
  const entranceType = String(config.animation ?? "none");
  return {
    type: entranceType,
    entrance: {
      type: entranceType,
      start: config.animationDelay,
      duration: config.animationDuration,
      direction: config.animationDirection,
      easing: config.animationEasing,
    },
    exit: {
      type: config.exitAnimation,
      start: config.exitStart,
      duration: config.exitDuration,
      easing: config.exitEasing,
    },
    emphasis: {
      type: config.emphasisAnimation,
      intensity: config.emphasisIntensity,
    },
  };
}

function shapedTextMotion(layer: ShapedTextLayer, time: number, sceneDuration: number, canvas: CanvasSize) {
  const config = layer.config;
  const animation = resolveTextMotion(renderMotionTextConfig(config), sceneDuration);
  const { type, duration, delay, direction, easing, exitType, exitDuration, exitStart, exitEasing, emphasisType, intensity } = animation;
  const visibleStart = finiteSeconds(config.visibleStart, 0, 0, sceneDuration);
  const visibleEnd = config.visibleEnd === null || config.visibleEnd === ""
    ? sceneDuration
    : finiteSeconds(config.visibleEnd, sceneDuration, visibleStart, sceneDuration);
  let opacity = finiteSeconds(config.opacity, 1, 0, 1);
  let dx = 0;
  let dy = 0;
  let scale = 1;
  let rotation = finiteSeconds(config.rotation, 0, -180, 180);
  const progress = (from: number, span: number, ease = easing) =>
    easeProgress((time - from) / Math.max(0.1, span), ease);
  const inProgress = progress(delay, duration);
  const fadedEntrance = ["fade-in", "slide-fade", "rise-in", "zoom-in", "scale-fade", "soft-pop", "cinematic-title", "rotate-in", "overshoot"].includes(type);
  if (fadedEntrance) opacity *= progress(delay, duration);
  if (type === "slide-in" || type === "slide-fade") {
    if (direction === "left") dx = -(1 - inProgress) * layer.boxWidth;
    else if (direction === "right") dx = (1 - inProgress) * canvas.width;
    else if (direction === "top") dy = -(1 - inProgress) * layer.boxHeight;
    else dy = (1 - inProgress) * canvas.height;
  }
  if (type === "rise-in") dy += (1 - inProgress) * 30;
  if (type === "zoom-in") scale = 0.86 + 0.14 * inProgress;
  if (type === "scale-fade" || type === "overshoot") scale = 0.76 + 0.24 * inProgress;
  if (type === "soft-pop") scale = 0.9 + 0.1 * inProgress;
  if (type === "cinematic-title") {
    scale = 0.94 + 0.06 * inProgress;
    dy += (1 - inProgress) * 36;
  }
  if (type === "rotate-in") {
    rotation += (1 - inProgress) * 10;
    if (time < delay + duration) scale = 0.96 + 0.04 * inProgress;
  }
  const isReveal = ["typewriter", "character-reveal", "word-reveal", "character-pop"].includes(type);
  const revealMode = type === "word-reveal" ? "word" : "letter";
  const revealedLines = isReveal
    ? layer.lines.map((line) => revealPrefix(line, revealMode, progress(delay, duration)))
    : layer.lines;
  if (isReveal) {
    if (time < delay) opacity = 0;
    if (type === "character-pop") {
      const allUnits = layer.lines.flatMap((line) => revealUnits(line, "letter"));
      if (allUnits.length) {
        const current = Math.max(0, Math.min(allUnits.length, Math.ceil(allUnits.length * progress(delay, duration))));
        const inSettle = Math.max(0.01, Math.min(0.16, duration / Math.max(1, allUnits.length)));
        const settled = current === 0 ? 0 : easeProgress(Math.min(1, (time - delay - ((current - 1) / allUnits.length) * duration) / inSettle), "ease-out");
        scale *= 0.72 + 0.28 * settled;
        opacity *= settled;
      }
    }
  }
  const isFadingExit = ["fade-out", "zoom-out", "rotate-out"].includes(exitType);
  const outProgress = time > exitStart ? progress(exitStart, exitDuration, exitEasing) : 0;
  if (exitType !== "none" && time > exitStart) {
    if (isFadingExit) opacity *= 1 - outProgress;
    if (exitType === "zoom-out") scale *= 1 - 0.14 * outProgress;
    if (exitType === "slide-out") {
      if (direction === "left") dx = -outProgress * layer.boxWidth;
      else if (direction === "right") dx = outProgress * canvas.width;
      else if (direction === "top") dy = -outProgress * layer.boxHeight;
      else dy = outProgress * canvas.height;
    }
    if (exitType === "rotate-out") rotation += 10 * outProgress;
  }
  if (emphasisType === "float") dy += Math.sin(time * 2.1) * 12 * intensity;
  if (emphasisType === "drift") dx += Math.sin(time * 0.45) * 18 * intensity;
  if (emphasisType === "pulse") scale *= 1 + Math.sin(time * 2.2) * 0.025 * intensity;
  if (emphasisType === "rotate") rotation += Math.sin(time * 1.3) * 3 * intensity;
  if (time < visibleStart || time > visibleEnd) opacity = 0;
  return { opacity: Math.max(0, Math.min(1, opacity)), dx, dy, scale, rotation, revealedLines };
}

function shapedTextSvg(layers: ShapedTextLayer[], time: number, sceneDuration: number, canvas: CanvasSize) {
  const definitions: string[] = [];
  const contents = layers.map((layer, layerIndex) => {
    const config = layer.config;
    const motion = shapedTextMotion(layer, time, sceneDuration, canvas);
    const rawX = config.x ?? config.position?.x;
    const rawY = config.y ?? config.position?.y ?? "center";
    const anchorX = compositionPositionPixels(rawX, canvas.width, 50, "x");
    const anchorY = compositionPositionPixels(rawY, canvas.height, 50, "y");
    const left = layer.alignment === "left" ? anchorX : layer.alignment === "right" ? anchorX - layer.boxWidth : anchorX - layer.boxWidth / 2;
    const top = anchorY - layer.boxHeight / 2;
    const centerX = left + layer.boxWidth / 2;
    const centerY = top + layer.boxHeight / 2;
    const letterSpacing = layer.letterSpacing;
    const weight = Math.max(100, Math.min(900, Number(config.fontWeight) || 400));
    const color = svgColor(config.fontColor ?? config.color, "#000000");
    const strokeWidth = finiteSeconds(config.strokeWidth, 0, 0, 20);
    const stroke = svgColor(config.strokeColor, color);
    const backgroundOpacity = finiteSeconds(config.backgroundOpacity, 0, 0, 1);
    const background = svgColor(config.backgroundColor, "#000000");
    const padding = finiteSeconds(config.backgroundPadding, 8, 0, 60);
    const lineHeight = Math.max(1, layer.fontSize + finiteSeconds(config.lineSpacing, 8, -10, 80));
    const firstStrong = Array.from(layer.lines.join("\n")).find((character) => /[\p{Letter}\p{Number}]/u.test(character));
    const isRtl = Boolean(firstStrong && /[\p{Script=Arabic}\p{Script=Hebrew}\p{Script=Syriac}\p{Script=Thaana}\p{Script=Nko}]/u.test(firstStrong));
    const anchor = layer.alignment === "center" ? "middle"
      : layer.alignment === "left" ? (isRtl ? "end" : "start")
        : (isRtl ? "start" : "end");
    const x = layer.alignment === "left" ? left : layer.alignment === "right" ? left + layer.boxWidth : centerX;
    const textLines = motion.revealedLines.map((line, index) => {
      if (!line.length) return "";
      const y = centerY + (index - (layer.lines.length - 1) / 2) * lineHeight;
      return `<text x="${x.toFixed(3)}" y="${y.toFixed(3)}" text-anchor="${anchor}" dominant-baseline="central" font-family="${escapeSvgText(layer.familyStack.join(", "))}" font-size="${layer.fontSize}" font-weight="${weight}" font-style="${config.italic === true ? "italic" : "normal"}" letter-spacing="${letterSpacing}" fill="${color}" stroke="${strokeWidth ? stroke : "none"}" stroke-width="${strokeWidth}" stroke-linejoin="round" paint-order="stroke fill" direction="${isRtl ? "rtl" : "ltr"}" unicode-bidi="plaintext">${escapeSvgText(line)}</text>`;
    }).join("");
    const bg = backgroundOpacity > 0
      ? `<rect x="${(left - padding).toFixed(3)}" y="${(top - padding).toFixed(3)}" width="${(layer.boxWidth + padding * 2).toFixed(3)}" height="${(layer.boxHeight + padding * 2).toFixed(3)}" fill="${background}" fill-opacity="${backgroundOpacity.toFixed(3)}"/>`
      : "";
    const shadowX = finiteSeconds(config.shadowX, 0, -40, 40);
    const shadowY = finiteSeconds(config.shadowY, 0, -40, 40);
    const shadow = shadowX || shadowY
      ? `filter="url(#shadow-${layerIndex})"`
      : "";
    const shadowDef = shadowX || shadowY
      ? `<filter id="shadow-${layerIndex}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur in="SourceAlpha" stdDeviation="${Math.max(0.1, finiteSeconds(config.shadowBlur, 2, 0, 40))}"/><feOffset dx="${shadowX}" dy="${shadowY}" result="offsetblur"/><feFlood flood-color="${svgColor(config.shadowColor, "#000000")}" flood-opacity="${finiteSeconds(config.shadowOpacity, 0.5, 0, 1)}"/><feComposite in2="offsetblur" operator="in"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>`
      : "";
    if (shadowDef) definitions.push(shadowDef);
    const transform = `translate(${(motion.dx + centerX).toFixed(3)} ${(motion.dy + centerY).toFixed(3)}) rotate(${motion.rotation.toFixed(3)}) scale(${motion.scale.toFixed(5)}) translate(${-centerX.toFixed(3)} ${-centerY.toFixed(3)})`;
    return `${shadowDef}<g transform="${transform}" opacity="${motion.opacity.toFixed(4)}" ${shadow}>${bg}${textLines}</g>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}"><defs>${definitions.join("")}</defs>${contents}</svg>`;
}

async function rasterizeShapedTextLayerSequence(
  layers: ShapedTextLayer[],
  workDirRelative: string,
  sceneDuration: number,
  canvas: CanvasSize,
) {
  if (!layers.length) return null;
  const directory = shapedTextSequenceDirectory(path.join(PROJECT_ROOT, workDirRelative));
  return renderShapedSvgSequence(
    (frame) => shapedTextSvg(layers, frame / 30, sceneDuration, canvas),
    directory,
    Math.max(1, Math.ceil(sceneDuration * 30)),
  );
}

async function buildFrameFilterScript(
  frame: RenderFrame,
  frameInput: FrameInput,
  workDirRelative: string,
  frameIndex: number,
  canvas: CanvasSize,
  sceneDuration: number,
): Promise<{ filterScript: string; overlaySequence: string | null }> {
  const normalizedConfig = normalizeConfigForEditor(frame.placeholderConfig);
  const texts = getFrameTexts(normalizedConfig, frameInput);
  const fit = ["cover", "fill"].includes(String(normalizedConfig.backgroundFit))
    ? String(normalizedConfig.backgroundFit)
    : "contain";
  const focalX = finiteSeconds(normalizedConfig.focalX, 50, 0, 100) / 100;
  const focalY = finiteSeconds(normalizedConfig.focalY, 50, 0, 100) / 100;
  let filters: string[] = fit === "fill"
    ? [`scale=${canvas.width}:${canvas.height}`, "setsar=1", "fps=30"]
    : fit === "cover"
      ? [
          `scale=${canvas.width}:${canvas.height}:force_original_aspect_ratio=increase`,
          `crop=${canvas.width}:${canvas.height}:(iw-${canvas.width})*${focalX.toFixed(4)}:(ih-${canvas.height})*${focalY.toFixed(4)}`,
          "setsar=1", "fps=30",
        ]
      : [
          `scale=${canvas.width}:${canvas.height}:force_original_aspect_ratio=decrease`,
          `pad=${canvas.width}:${canvas.height}:(ow-iw)/2:(oh-ih)/2`,
          "setsar=1", "fps=30",
        ];
  filters.unshift("setpts=PTS-STARTPTS");
  const graphParts: string[] = [];
  const shapedLayers: ShapedTextLayer[] = [];
  let chainInput = "[0:v]";
  let chainIndex = 0;

  let textIndex = 0;
  for (const textConfig of texts) {
    const fontSize = Math.max(
      6,
      Math.min(240, Math.round(Number(textConfig.fontSize) || 40)),
    );
    const boxWidth = finiteSeconds(textConfig.boxWidth, 90, 10, 100) / 100;
    const wrapped = wrapInvitationText(String(textConfig.text ?? ""), fontSize, canvas.width * boxWidth);
    if (!wrapped.trim()) continue;
    const lines = wrapped.split("\n");
    const rawAlignment = String(textConfig.alignment ?? "center").toLowerCase();
    const alignment: "left" | "center" | "right" =
      rawAlignment === "left" || rawAlignment === "right" ? rawAlignment : "center";

    const fontValue = textConfig.fontFile ?? textConfig.font ?? "DejaVuSans.ttf";
    const sourceText = String(textConfig.text ?? "");
    const renderFont = await resolveTextRenderFont(fontValue, sourceText, textConfig.fontWeight);
    const resolvedFont = renderFont.font;
    const fontRelative = renderFont.path ?? serverFontPath(fontValue, textConfig.fontWeight);
    const actualFont = renderFont.filePath ?? path.resolve(PROJECT_ROOT, fontRelative);
    if (!renderFont.supportsAllGlyphs || renderFont.useShapedOverlay) {
      const letterSpacing = resolvedFont.supportsLetterSpacing && supportsTextLetterSpacing(sourceText)
        ? finiteSeconds(textConfig.letterSpacing, 0, 0, 12)
        : 0;
      shapedLayers.push({
        config: textConfig,
        familyStack: renderFont.familyStack,
        lines,
        fontSize,
        boxWidth: Math.max(80, Math.round(canvas.width * boxWidth)),
        boxHeight: Math.max(60, Math.round(canvas.height * finiteSeconds(textConfig.boxHeight, 20, 5, 90) / 100)),
        alignment,
        letterSpacing,
      });
      textIndex++;
      continue;
    }
    await verifyFfmpegTextShaping(sourceText);
    try {
      await fs.access(actualFont);
    } catch {
      throw new Error(`Font asset for "${resolvedFont.label}" is missing at ${fontRelative}. Upload a TTF/OTF font or select one of the installed CRM fonts.`);
    }
    let glyphChecker = fontCoverageCache.get(actualFont);
    if (!glyphChecker) {
      glyphChecker = createFontGlyphChecker(await fs.readFile(actualFont));
      fontCoverageCache.set(actualFont, glyphChecker);
    }
    const missingGlyphs = glyphChecker(sourceText, 20);
    if (missingGlyphs.length) {
      const fallbackFonts = resolveFontFallbackSequence(fontValue)
        .map((font) => font.label)
        .join(", ");
      throw new Error(
        `Font "${resolvedFont.label}" does not contain ${formatMissingCodePoints(missingGlyphs)} used by this text. Available fallback fonts: ${fallbackFonts}. Choose a Unicode-capable font or upload a valid TTF/OTF file with the required glyphs.`,
      );
    }

    const x = validPosition(
      textConfig.x ?? textConfig.position?.x,
      "x",
      alignment,
      canvas.width,
    );
    const rawY = String(
      textConfig.y ?? textConfig.position?.y ?? "center",
    ).trim();
    const yAnchor = compositionPositionPixels(
      rawY,
      canvas.height,
      50,
      "y",
    );
    const lineSpacing = finiteSeconds(textConfig.lineSpacing, 8, -10, 80);
    const blockHeight =
      lines.length * fontSize + Math.max(0, lines.length - 1) * lineSpacing;
    const baseY = `(${yAnchor}-${Math.round(blockHeight / 2)})`;

    const color = colorForFfmpeg(textConfig.fontColor ?? textConfig.color);
    const textOpacity = finiteSeconds(textConfig.opacity, 1, 0, 1);
    const strokeWidth = Math.round(finiteSeconds(textConfig.strokeWidth, 0, 0, 20));
    const strokeColor = colorForFfmpeg(textConfig.strokeColor);
    const shadowX = Math.round(finiteSeconds(textConfig.shadowX, 0, -40, 40));
    const shadowY = Math.round(finiteSeconds(textConfig.shadowY, 0, -40, 40));
    const shadowColor = colorForFfmpeg(textConfig.shadowColor);
    const backgroundOpacity = finiteSeconds(textConfig.backgroundOpacity, 0, 0, 1);
    const backgroundColor = colorForFfmpeg(textConfig.backgroundColor);
    const backgroundPadding = Math.round(finiteSeconds(textConfig.backgroundPadding, 8, 0, 60));
    const letterSpacing = resolvedFont.supportsLetterSpacing && supportsTextLetterSpacing(sourceText)
      ? finiteSeconds(textConfig.letterSpacing, 0, 0, 12)
      : 0;
    const legacyTiming =
      textConfig.start !== undefined && textConfig.end !== undefined
        ? `between(t,${Number(textConfig.start)},${Number(textConfig.end)})`
        : null;
    const visibleStart = finiteSeconds(textConfig.visibleStart, 0, 0, sceneDuration);
    const visibleEnd = textConfig.visibleEnd === null || textConfig.visibleEnd === ""
      ? sceneDuration
      : finiteSeconds(textConfig.visibleEnd, sceneDuration, visibleStart, sceneDuration);
    const timeEnable = `between(t,${visibleStart.toFixed(3)},${visibleEnd.toFixed(3)})`;
    const legacyEnable = validEnable(textConfig.enable ?? legacyTiming);
    const enable = legacyEnable ? `(${legacyEnable})*(${timeEnable})` : timeEnable;
    const animation = getTextAnimation(textConfig.anim, sceneDuration);
    const alpha = validEnable(textConfig.alpha);
    const rotation = finiteSeconds(textConfig.rotation, 0, -180, 180);
    const isRotated = Math.abs(rotation) > 0.05;
    const isTextReveal = animation.type === "typewriter" || animation.type === "character-reveal" || animation.type === "word-reveal" || animation.type === "character-pop";
    const characterPopProgress = animation.type === "character-pop"
      ? characterPopProgressExpression(lines, animation, sceneDuration)
      : "1";
    const usesLayer = isRotated || textConfig.italic === true || animation.type === "rotate-in" || animation.exitType === "rotate-out" || animation.emphasisType === "rotate";
    const layerWidth = Math.max(80, Math.round(canvas.width * boxWidth));
    const layerHeight = Math.max(60, Math.round(canvas.height * finiteSeconds(textConfig.boxHeight, 20, 5, 90) / 100));
    const rotatedFilters: string[] = [];
    const rotatedBg = `rotbg_${frameIndex}_${textIndex}`;
    const rotatedOut = `rotout_${frameIndex}_${textIndex}`;
    if (usesLayer) {
      graphParts.push(`${chainInput}${filters.length ? filters.join(",") : "null"}[base_${chainIndex}]`);
      chainInput = `[base_${chainIndex}]`;
      chainIndex++;
      filters = [];
      graphParts.push(`color=c=black@0.0:s=${layerWidth}x${layerHeight}:r=30:d=${sceneDuration},format=rgba[${rotatedBg}]`);
    }

    const finishRotatedLayer = () => {
      if (!usesLayer) return;
      const rotatedLabel = `${rotatedOut}_layer`;
      const rotateEntranceProgress = easedProgress(animation.delay, animation.duration, animation.easing);
      const rotateExitProgress = easedProgress(animation.exitStart, animation.exitDuration, animation.exitEasing);
      const baseAngle = rotation * Math.PI / 180;
      const rotateIn = animation.type === "rotate-in" ? `(1-${rotateEntranceProgress})*0.174533` : "0";
      const rotateOut = animation.exitType === "rotate-out" ? `if(lt(t,${animation.exitStart.toFixed(3)}),0,(${rotateExitProgress})*0.174533)` : "0";
      const mainRotate = animation.emphasisType === "rotate" ? `+sin(t*1.3)*0.05236*${animation.intensity.toFixed(3)}*between(t,${visibleStart.toFixed(3)},${visibleEnd.toFixed(3)})` : "";
      const angleExpr = `${baseAngle.toFixed(6)}+(${rotateIn})+(${rotateOut})${mainRotate}`;
      const animatedRotation = animation.type === "rotate-in" || animation.exitType === "rotate-out" || animation.emphasisType === "rotate";
      const rotateOutW = animatedRotation ? `ceil(hypot(iw,ih))` : "rotw(iw)";
      const rotateOutH = animatedRotation ? `ceil(hypot(iw,ih))` : "roth(ih)";
      const italicFilter = textConfig.italic === true ? ",shear=shx=0.2:c=black@0.0" : "";
      graphParts.push(`[${rotatedBg}]${rotatedFilters.join(",")}${italicFilter},rotate=a='${angleExpr}':c=black@0.0:ow='${rotateOutW}':oh='${rotateOutH}':bilinear=1,format=rgba[${rotatedLabel}]`);
      const positionAnchor = (raw: unknown, axis: "x" | "y") => {
        const dimension = axis === "x" ? canvas.width : canvas.height;
        return String(compositionPositionPixels(raw, dimension, 50, axis));
      };
      const anchorX = positionAnchor(textConfig.x ?? textConfig.position?.x, "x");
      const anchorY = positionAnchor(textConfig.y ?? textConfig.position?.y, "y");
      const rotationExtents = animatedRotation ? Math.ceil(Math.hypot(layerWidth, layerHeight)) : layerWidth;
      const alignOffset = alignment === "left" ? 0 : alignment === "right" ? layerWidth : layerWidth / 2;
      const targetX = `(${anchorX})-(${alignOffset})+(${(layerWidth - rotationExtents) / 2})`;
      const targetY = `(${anchorY})-overlay_h/2`;
      let layerX = targetX;
      let layerY = targetY;
      const isSlideEntrance = animation.type === "slide-in";
      const exitIsSlide = animation.exitType === "slide-out";
      const isSlideExitOnly = !isSlideEntrance && exitIsSlide;
      const start = animation.delay;
      const enterEnd = start + animation.duration;
      const enterProgress = easedProgress(start, animation.duration, animation.easing);
      const exitStart = animation.exitStart;
      const exitProgress = easedProgress(exitStart, animation.exitDuration, animation.exitEasing);
      const offX = animation.direction === "left" ? "-overlay_w" : "main_w";
      const offY = animation.direction === "top" ? "-overlay_h" : "main_h";
      const horizontal = animation.direction === "left" || animation.direction === "right";
      const target = horizontal ? targetX : targetY;
      const from = horizontal ? offX : offY;
      if (isSlideEntrance) {
        const entrance = `if(lt(t,${start.toFixed(3)}),${from},if(lt(t,${enterEnd.toFixed(3)}),${from}+((${target})-(${from}))*(${enterProgress}),${target}))`;
        const motion = exitIsSlide
          ? `if(lt(t,${start.toFixed(3)}),${from},if(lt(t,${enterEnd.toFixed(3)}),${from}+((${target})-(${from}))*(${enterProgress}),if(lt(t,${exitStart.toFixed(3)}),${target},(${target})+((${from})-(${target}))*(${exitProgress}))))`
          : entrance;
        if (horizontal) layerX = motion; else layerY = motion;
      } else if (isSlideExitOnly) {
        const motion = `if(lt(t,${exitStart.toFixed(3)}),${target},(${target})+((${from})-(${target}))*(${exitProgress}))`;
        if (horizontal) layerX = motion; else layerY = motion;
      }
      if (animation.type === "cinematic-title") {
        const cinematicY = `if(lt(t,${start.toFixed(3)}),(${targetY})+36,if(lt(t,${enterEnd.toFixed(3)}),(${targetY})+36*(1-(${enterProgress})),${targetY}))`;
        layerY = cinematicY;
      }
      if (animation.emphasisType === "float") layerY = `(${layerY})+12*${animation.intensity.toFixed(3)}*sin(t*2.1)*between(t,${visibleStart.toFixed(3)},${visibleEnd.toFixed(3)})`;
      if (animation.emphasisType === "drift") layerX = `(${layerX})+18*${animation.intensity.toFixed(3)}*sin(t*0.45)*between(t,${visibleStart.toFixed(3)},${visibleEnd.toFixed(3)})`;
      graphParts.push(`${chainInput}[${rotatedLabel}]overlay=x='${layerX}':y='${layerY}':format=auto[base_${chainIndex}]`);
      chainInput = `[base_${chainIndex}]`;
      chainIndex++;
    };

    // Draw each line separately so every line can be centered independently.
    // This avoids the visual left-alignment that drawtext applies to shorter
    // lines inside a multiline text block.
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      if (!line.trim()) continue;

      const y =
        lineIndex === 0
          ? baseY
          : `${baseY}+(${lineIndex * (fontSize + lineSpacing)})`;
      const localBlockHeight = lines.length * fontSize + Math.max(0, lines.length - 1) * lineSpacing;
      const localY = `(h-${localBlockHeight})/2+${lineIndex * (fontSize + lineSpacing)}`;
      const localX = alignment === "left" ? "0" : alignment === "right" ? "w-text_w" : "(w-text_w)/2";
      const outputFilters = usesLayer ? rotatedFilters : filters;

      const writeTextFile = async (suffix: string, value: string) => {
        const relative = `${workDirRelative}/frame-${frameIndex}-text-${textIndex}-line-${lineIndex}-${suffix}.txt`;
        const source = letterSpacing > 0 ? applyLetterSpacing(value, letterSpacing, fontSize) : value;
        await fs.writeFile(path.join(PROJECT_ROOT, relative), source, "utf8");
        return relative;
      };

      const makeParams = (
        textFileRelative: string,
        xExpr: string,
        yExpr: string,
        sizeExpr: string,
      ) => {
        const scaledLineSpacing = `((${lineSpacing})*(${sizeExpr})/${fontSize})`;
        const scaledBlockHeight = `(${lines.length}*(${sizeExpr})+${Math.max(0, lines.length - 1)}*${scaledLineSpacing})`;
        const drawY = sizeExpr !== String(fontSize)
          ? usesLayer
            ? `(h-${scaledBlockHeight})/2+${lineIndex}*((${sizeExpr})+${scaledLineSpacing})`
            : `(${yAnchor}-${scaledBlockHeight}/2)+${lineIndex}*((${sizeExpr})+${scaledLineSpacing})`
          : yExpr;
        const params = [
          `fontfile='${ffmpegEscapeFilterPath(fontRelative)}'`,
          `textfile='${ffmpegEscapeFilterPath(textFileRelative)}'`,
          "expansion=none",
          "text_shaping=1",
          `x='${xExpr}'`,
          `y='${drawY}'`,
          `fontsize='${sizeExpr}'`,
          `fontcolor=${color}`,
          // The saved x/y are anchor points. FFmpeg's fix_bounds=1 silently
          // clamps over-wide glyph runs to a text-box edge and shifts them.
          "fix_bounds=0",
        ];
        if (strokeWidth > 0) params.push(`borderw=${strokeWidth}`, `bordercolor=${strokeColor}`);
        if (shadowX !== 0 || shadowY !== 0) params.push(`shadowx=${shadowX}`, `shadowy=${shadowY}`, `shadowcolor=${shadowColor}`);
        if (backgroundOpacity > 0) {
          params.push("box=1", `boxcolor=${backgroundColor}@${backgroundOpacity.toFixed(3)}`, `boxborderw=${backgroundPadding}`);
        }
        return params;
      };

      // Prefix stages keep the whole revealed portion together so FreeType can
      // shape connected script glyphs and ligatures on every reveal step.
      if (isTextReveal) {
        const mode = animation.type === "word-reveal" ? "word" : "letter";
        const units = revealUnits(line, mode);
        const exitFade = ["fade-out", "zoom-out", "rotate-out"].includes(animation.exitType)
          ? `if(lt(t,${animation.exitStart.toFixed(3)}),1,if(lt(t,${(animation.exitStart + animation.exitDuration).toFixed(3)}),1-(${easedProgress(animation.exitStart, animation.exitDuration, animation.exitEasing)}),0))`
          : null;
        const sizeParts: string[] = [];
        if (animation.exitType === "zoom-out") {
          sizeParts.push(`if(lt(t,${animation.exitStart.toFixed(3)}),1,1-0.14*(${easedProgress(animation.exitStart, animation.exitDuration, animation.exitEasing)}))`);
        }
        if (animation.emphasisType === "pulse") {
          sizeParts.push(`1+0.025*${animation.intensity.toFixed(3)}*sin(t*2.2)`);
        }
        const revealSize = sizeParts.length ? `max(6,${fontSize}*(${sizeParts.join("*")}))` : String(fontSize);
        let prefix = "";
        for (let unitIndex = 0; unitIndex < units.length; unitIndex++) {
          prefix += units[unitIndex];
          const stageStart = timeForEasedProgress(animation.delay, animation.duration, animation.easing, unitIndex / units.length);
          const stageEnd = unitIndex === units.length - 1
            ? sceneDuration + 0.01
            : timeForEasedProgress(animation.delay, animation.duration, animation.easing, (unitIndex + 1) / units.length);
          const prefixFile = await writeTextFile(`reveal-${mode}-${unitIndex}`, prefix);
          let revealX = usesLayer ? localX : x;
          let revealY = usesLayer ? localY : y;
          const revealSlide = animation.exitType === "slide-out";
          if (revealSlide && !usesLayer) {
            const from = animation.direction === "left" ? "-text_w" : animation.direction === "right" ? "w" : animation.direction === "top" ? "-text_h" : "h";
            const horizontal = animation.direction === "left" || animation.direction === "right";
            const target = horizontal ? revealX : revealY;
            const offscreen = horizontal ? (animation.direction === "left" ? "-text_w" : "w") : (animation.direction === "top" ? "-text_h" : "h");
            const exitProgress = easedProgress(animation.exitStart, animation.exitDuration, animation.exitEasing);
            const motion = `if(lt(t,${animation.exitStart.toFixed(3)}),${target},(${target})+((${offscreen})-(${target}))*(${exitProgress}))`;
            if (horizontal) revealX = motion;
            else revealY = motion;
          }
          const params = makeParams(
            prefixFile,
            revealX,
            revealY,
            animation.type === "character-pop"
              ? `max(6,${fontSize}*(0.72+0.28*(${characterPopProgress})))`
              : revealSize,
          );
          const startCheck = unitIndex === 0 ? "gt" : "gte";
          const stageEnable = `${startCheck}(t,${stageStart.toFixed(6)})*lt(t,${stageEnd.toFixed(6)})`;
          params.push(`enable='(${enable})*(${stageEnable})'`);
          const alphaExpressions = [
            animation.type === "character-pop"
              ? `(${characterPopProgress})`
              : "",
            exitFade ? `(${exitFade})` : "",
            alpha && /^if\(/i.test(alpha) ? `(${alpha})` : "",
            textOpacity < 1 ? textOpacity.toFixed(3) : "",
          ].filter(Boolean);
          if (alphaExpressions.length) params.push(`alpha='${alphaExpressions.join("*")}'`);
          outputFilters.push(`drawtext=${params.join(":")}`);
        }
        continue;
      }
      const textFileRelative = await writeTextFile("text", line);
      let animatedX = x;
      let animatedY = y;
      let animatedSize = String(fontSize);
      let animatedAlpha: string | null = null;
      const start = animation.delay;
      const enterEnd = start + animation.duration;
      const exitStart = animation.exitStart;
      const exitEnd = exitStart + animation.exitDuration;
      const inProgress = easedProgress(start, animation.duration, animation.easing);
      const outProgress = easedProgress(exitStart, animation.exitDuration, animation.exitEasing);
      const exitType = animation.exitType;
      const exitFade = ["fade-out", "zoom-out", "rotate-out"].includes(exitType);
      const exitSlide = exitType === "slide-out";
      const exitZoom = exitType === "zoom-out";
      const fadeIn = `if(lt(t,${start.toFixed(3)}),0,if(lt(t,${enterEnd.toFixed(3)}),${inProgress},1))`;
      const exitFadeExpr = `if(lt(t,${exitStart.toFixed(3)}),1,if(lt(t,${exitEnd.toFixed(3)}),1-(${outProgress}),0))`;
      const entersWithFade = ["fade-in", "slide-fade", "rise-in", "soft-pop", "zoom-in", "scale-fade", "cinematic-title", "rotate-in", "overshoot"].includes(animation.type);
      const entranceAlpha = entersWithFade ? fadeIn : "1";
      const combinedFade = exitFade ? `(${entranceAlpha})*(${exitFadeExpr})` : entersWithFade ? entranceAlpha : null;

      if (animation.type === "fade-in") {
        animatedAlpha = combinedFade;
      } else if (animation.type === "slide-in" || animation.type === "slide-fade") {
        const fromX = animation.direction === "left" ? "-text_w" : animation.direction === "right" ? "w" : x;
        const fromY = animation.direction === "top" ? "-text_h" : animation.direction === "bottom" ? "h" : y;
        const movesX = animation.direction === "left" || animation.direction === "right";
        const target = movesX ? x : y;
        const from = movesX ? fromX : fromY;
        const entrance = `if(lt(t,${start.toFixed(3)}),${from},if(lt(t,${enterEnd.toFixed(3)}),${from}+((${target})-(${from}))*(${inProgress}),${target}))`;
        const position = exitSlide
          ? `if(lt(t,${start.toFixed(3)}),${from},if(lt(t,${enterEnd.toFixed(3)}),${from}+((${target})-(${from}))*(${inProgress}),if(lt(t,${exitStart.toFixed(3)}),${target},(${target})+((${from})-(${target}))*(${outProgress}))))`
          : entrance;
        if (movesX) animatedX = position;
        else animatedY = position;
        animatedAlpha = combinedFade;
      } else if (["zoom-in", "scale-fade", "soft-pop", "cinematic-title", "overshoot"].includes(animation.type)) {
        const initialScale = animation.type === "scale-fade" || animation.type === "overshoot" ? 0.76 : animation.type === "soft-pop" ? 0.9 : animation.type === "cinematic-title" ? 0.94 : 0.86;
        const scaleExpr = `${initialScale}+${(1 - initialScale).toFixed(3)}*(${inProgress})`;
        const enteringSize = `if(lt(t,${start.toFixed(3)}),${initialScale},if(lt(t,${enterEnd.toFixed(3)}),${scaleExpr},1))`;
        const sizeExpr = exitZoom
          ? `if(lt(t,${start.toFixed(3)}),${initialScale},if(lt(t,${enterEnd.toFixed(3)}),${scaleExpr},if(lt(t,${exitStart.toFixed(3)}),1,1-0.14*(${outProgress}))))`
          : enteringSize;
        animatedSize = `max(6,${fontSize}*(${sizeExpr}))`;
        animatedAlpha = combinedFade;
      } else if (animation.type === "rise-in") {
        animatedY = `if(lt(t,${start.toFixed(3)}),(${y})+30,if(lt(t,${enterEnd.toFixed(3)}),(${y})+30*(1-(${inProgress})),${y}))`;
        animatedAlpha = combinedFade;
      } else if (animation.type === "rotate-in") {
        const rotateScale = `if(lt(t,${start.toFixed(3)}),0.96,if(lt(t,${enterEnd.toFixed(3)}),0.96+0.04*(${inProgress}),1))`;
        animatedSize = `max(6,${fontSize}*(${rotateScale}))`;
        animatedAlpha = combinedFade;
      } else if (exitSlide) {
        const from = animation.direction === "left" ? "-text_w" : animation.direction === "right" ? "w" : animation.direction === "top" ? "-text_h" : "h";
        const target = animation.direction === "left" || animation.direction === "right" ? x : y;
        const outPosition = `if(lt(t,${exitStart.toFixed(3)}),${target},(${target})+((${from})-(${target}))*(${outProgress}))`;
        if (animation.direction === "left" || animation.direction === "right") animatedX = outPosition;
        else animatedY = outPosition;
      } else if (exitZoom) {
        animatedSize = `max(6,${fontSize}*(1-0.14*(${outProgress})))`;
        animatedAlpha = exitFadeExpr;
      }
      if (exitZoom && !["zoom-in", "scale-fade", "soft-pop", "cinematic-title", "overshoot"].includes(animation.type)) {
        const entranceScale = animation.type === "rotate-in"
          ? `if(lt(t,${start.toFixed(3)}),0.96,if(lt(t,${enterEnd.toFixed(3)}),0.96+0.04*(${inProgress}),1))`
          : "1";
        animatedSize = `max(6,${fontSize}*(${entranceScale})*(if(lt(t,${exitStart.toFixed(3)}),1,1-0.14*(${outProgress}))))`;
        animatedAlpha = animatedAlpha ?? exitFadeExpr;
      }
      if (!animatedAlpha && exitFade) animatedAlpha = exitFadeExpr;

      const emphasisEnd = Math.max(visibleStart, visibleEnd);
      if (animation.emphasisType === "float") {
        animatedY = `(${animatedY})+12*${animation.intensity.toFixed(3)}*sin(t*2.1)*between(t,${visibleStart.toFixed(3)},${emphasisEnd.toFixed(3)})`;
      } else if (animation.emphasisType === "pulse") {
        animatedSize = `max(6,(${animatedSize})*(1+0.025*${animation.intensity.toFixed(3)}*sin(t*2.2)))`;
      }

      const params = makeParams(
        textFileRelative,
        usesLayer ? localX : animatedX,
        usesLayer ? localY : animatedY,
        animatedSize,
      );
      if (enable) params.push(`enable='${enable}'`);
      const alphaExpressions = [
        animatedAlpha ? `(${animatedAlpha})` : "",
        alpha && /^if\(/i.test(alpha) ? `(${alpha})` : "",
        textOpacity < 1 ? textOpacity.toFixed(3) : "",
      ].filter(Boolean);
      if (alphaExpressions.length) params.push(`alpha='${alphaExpressions.join("*")}'`);
      outputFilters.push(`drawtext=${params.join(":")}`);
    }
    finishRotatedLayer();
    textIndex++;
  }

  const overlaySequence = await rasterizeShapedTextLayerSequence(shapedLayers, workDirRelative, sceneDuration, canvas);
  if (overlaySequence) {
    const baseLabel = `base_shaped_${frameIndex}`;
    const shapedLabel = `text_shaped_${frameIndex}`;
    graphParts.push(`${chainInput}${filters.length ? `${filters.join(",")},` : ""}format=yuv420p[${baseLabel}]`);
    graphParts.push(`[1:v]setpts=PTS-STARTPTS,fps=30,format=rgba[${shapedLabel}]`);
    graphParts.push(`[${baseLabel}][${shapedLabel}]overlay=x=0:y=0:format=auto:repeatlast=0:eof_action=pass:shortest=0,format=yuv420p[vout]`);
  } else if (graphParts.length === 0) {
    filters.push("format=yuv420p");
    return { filterScript: `[0:v]${filters.join(",")}[vout]`, overlaySequence: null };
  } else {
    graphParts.push(`${chainInput}${filters.length ? `${filters.join(",")},` : ""}format=yuv420p[vout]`);
  }
  return { filterScript: graphParts.join(";\n"), overlaySequence };
}

function finiteSeconds(
  value: unknown,
  fallback: number,
  min: number,
  max: number,
): number {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

function getTextAnimation(value: unknown, sceneDuration: number) {
  return resolveTextMotion(value, sceneDuration);
}

function easedProgress(start: number, duration: number, easing: string) {
  return ffmpegProgress(start, duration, easing as Parameters<typeof ffmpegProgress>[2]);
}

function characterPopProgressExpression(
  lines: string[],
  animation: ReturnType<typeof resolveTextMotion>,
  sceneDuration: number,
) {
  const lineExpressions = lines.filter((line) => line.length > 0).map((line) => {
    const units = revealUnits(line, "letter");
    let expression = "1";
    for (let index = units.length - 1; index >= 0; index--) {
      const start = timeForEasedProgress(animation.delay, animation.duration, animation.easing, index / units.length);
      const end = index === units.length - 1
        ? sceneDuration + 0.01
        : timeForEasedProgress(animation.delay, animation.duration, animation.easing, (index + 1) / units.length);
      const settle = Math.max(0.01, Math.min(0.16, end - start));
      expression = `if(lt(t,${start.toFixed(6)}),0,if(lt(t,${end.toFixed(6)}),(${easedProgress(start, settle, "ease-out")}),(${expression})))`;
    }
    return `(${expression})`;
  });
  return lineExpressions.length ? `(${lineExpressions.join("+")})/${lineExpressions.length}` : "1";
}

export async function renderInvitation(
  options: GenerateOptions,
): Promise<{ outputPath: string; publicUrl: string | null }> {
  const jobId = crypto.randomUUID();
  const workDirRelative = `storage/tmp/${jobId}`;
  const workDirAbsolute = path.join(PROJECT_ROOT, workDirRelative);
  const generatedDir = path.join(PUBLIC_ROOT, "media", "generated");
  const privateGeneratedDir = path.join(PRIVATE_STORAGE_ROOT, "generated");
  await fs.mkdir(workDirAbsolute, { recursive: true });
  await fs.mkdir(generatedDir, { recursive: true });
  await fs.mkdir(privateGeneratedDir, { recursive: true });

  const renderedFrames: string[] = [];
  const renderedDurations: number[] = [];
  const preview = options.watermark !== false;
  const finalAbsolute = path.join(preview ? generatedDir : privateGeneratedDir, `${preview ? "preview" : "invitation"}-${jobId}.mp4`);
  const assembledAbsolute = path.join(workDirAbsolute, "assembled.mp4");
  const intermediateAbsolute = path.join(
    workDirAbsolute,
    "joined-no-audio.mp4",
  );

  try {
    if (options.frames.length === 0)
      throw new Error("This template has no frames to render.");

    const firstFrame = options.frames[0];
    if (!firstFrame.sourceVideo) {
      throw new Error(`Frame ${firstFrame.frameNumber} has no source video path configured.`);
    }
    const firstVideoPath = resolvePublicFile(firstFrame.sourceVideo);
    try {
      await fs.access(firstVideoPath);
    } catch {
      throw new Error(`Source video is missing for frame ${firstFrame.frameNumber}: ${normalizePublicPath(firstFrame.sourceVideo)}.`);
    }
    const firstMetadata = await probeVideo(firstVideoPath);
    const canvas = outputCanvas(firstMetadata);

    for (let index = 0; index < options.frames.length; index++) {
      const frame = options.frames[index];
      if (!frame.sourceVideo) {
        throw new Error(
          `Frame ${frame.frameNumber} has no source video path configured.`,
        );
      }
      const inputAbsolute = resolvePublicFile(frame.sourceVideo);
      try {
        await fs.access(inputAbsolute);
      } catch {
        throw new Error(
          `Source video is missing for frame ${frame.frameNumber}: ${normalizePublicPath(frame.sourceVideo)}. Copy the original MP4 into public/${normalizePublicPath(frame.sourceVideo)} and retry.`,
        );
      }
      const isStillImage = /\.(avif|gif|jpe?g|png|webp)$/i.test(inputAbsolute);
      const metadata = index === 0 ? firstMetadata : await probeVideo(inputAbsolute);
      const configuredDuration = Number(frame.durationSeconds);
      const sceneDuration = Number.isFinite(configuredDuration) && configuredDuration > 0
        ? isStillImage ? configuredDuration : Math.min(configuredDuration, metadata.duration ?? configuredDuration)
        : metadata.duration ?? 5;

      const scriptRelative = `${workDirRelative}/frame-${index}.filter`;
      const scriptAbsolute = path.join(PROJECT_ROOT, scriptRelative);
      const outputAbsolute = path.join(workDirAbsolute, `frame-${index}.mp4`);
      const frameInput =
        options.framesData[String(frame.id)] ||
        options.framesData[String(index)] ||
        {};
      const builtFilter = await buildFrameFilterScript(
        frame,
        frameInput,
        workDirRelative,
        index,
        canvas,
        sceneDuration,
      );
      await fs.writeFile(scriptAbsolute, builtFilter.filterScript, "utf8");

      const args = [
        "-y",
        ...(isStillImage ? ["-loop", "1", "-framerate", "30", "-t", String(sceneDuration)] : []),
        "-i",
        inputAbsolute,
        ...(builtFilter.overlaySequence
          ? ["-framerate", "30", "-start_number", "0", "-i", builtFilter.overlaySequence]
          : []),
        "-filter_complex_script",
        scriptAbsolute,
        "-map",
        "[vout]",
        "-an",
      ];
      if (frame.durationSeconds && frame.durationSeconds > 0)
        args.push("-t", String(frame.durationSeconds));
      args.push(
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "20",
        "-pix_fmt",
        "yuv420p",
        "-r",
        "30",
        "-movflags",
        "+faststart",
        outputAbsolute,
      );
      await runFfmpeg(args);
      renderedFrames.push(outputAbsolute);
      renderedDurations.push(sceneDuration);
    }

    const transitionPairs = options.frames.slice(0, -1).map((frame, index) => {
      const config = normalizeConfigForEditor(frame.placeholderConfig);
      const maxDuration = Math.max(0.1, Math.min(renderedDurations[index], renderedDurations[index + 1]) * 0.45);
      return resolveSceneTransition(config.transitionToNext, maxDuration);
    });
    const hasTransitions = transitionPairs.some((transition) => transition.type !== "hard-cut");
    if (renderedFrames.length === 1 || !hasTransitions) {
      const concatRelative = `${workDirRelative}/concat.txt`;
      const concatAbsolute = path.join(PROJECT_ROOT, concatRelative);
      const concatContent = renderedFrames
        .map((file) => `file '${normalizeAbsoluteForConcat(file)}'`)
        .join("\n");
      await fs.writeFile(concatAbsolute, concatContent, "utf8");
      await runFfmpeg([
        "-y", "-f", "concat", "-safe", "0", "-i", concatAbsolute, "-an",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p", "-r", "30", "-movflags", "+faststart", intermediateAbsolute,
      ]);
    } else {
      const graph: string[] = renderedFrames.map((_, index) => `[${index}:v]settb=AVTB,setpts=PTS-STARTPTS,fps=30,format=yuv420p[s${index}]`);
      let current = "s0";
      let timelineDuration = renderedDurations[0] || 5;
      for (let index = 1; index < renderedFrames.length; index++) {
        const transition = transitionPairs[index - 1];
        const output = `joined${index}`;
        const next = `s${index}`;
        if (transition.type === "hard-cut") {
          graph.push(`[${current}][${next}]concat=n=2:v=1:a=0,settb=AVTB,setpts=PTS-STARTPTS,fps=30[${output}]`);
          timelineDuration += renderedDurations[index];
        } else {
          const name = ffmpegTransitionName(transition);
          const overlap = Math.min(transition.duration, timelineDuration, renderedDurations[index]);
          const offset = Math.max(0, timelineDuration - overlap);
          graph.push(`[${current}][${next}]xfade=transition=${name}:duration=${overlap.toFixed(6)}:offset=${offset.toFixed(6)},settb=AVTB,setpts=PTS-STARTPTS,fps=30[${output}]`);
          timelineDuration += renderedDurations[index] - overlap;
        }
        current = output;
      }
      graph.push(`[${current}]format=yuv420p[vout]`);
      const scriptRelative = `${workDirRelative}/transitions.filter`;
      const scriptAbsolute = path.join(PROJECT_ROOT, scriptRelative);
      await fs.writeFile(scriptAbsolute, graph.join(";\n"), "utf8");
      const args = ["-y", ...renderedFrames.flatMap((file) => ["-i", file]), "-filter_complex_script", scriptAbsolute, "-map", "[vout]", "-an", "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p", "-r", "30", "-movflags", "+faststart", intermediateAbsolute];
      await runFfmpeg(args);
    }

    if (options.musicPath) {
      const musicAbsolute = resolvePublicFile(options.musicPath);
      try {
        await fs.access(musicAbsolute);
      } catch {
        throw new Error(
          `Selected background music file is missing: ${normalizePublicPath(options.musicPath)}`,
        );
      }
      await runFfmpeg([
        "-y",
        "-i",
        intermediateAbsolute,
        "-stream_loop",
        "-1",
        "-i",
        musicAbsolute,
        "-map",
        "0:v:0",
        "-map",
        "1:a:0",
        "-c:v",
        "copy",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-shortest",
        "-movflags",
        "+faststart",
        assembledAbsolute,
      ]);
    } else {
      await fs.rename(intermediateAbsolute, assembledAbsolute);
    }

    if (preview) {
      const watermarkAbsolute = path.join(workDirAbsolute, "watermark.png");
      await createPreviewWatermark(watermarkAbsolute, canvas);
      await runFfmpeg([
        "-y", "-i", assembledAbsolute, "-loop", "1", "-i", watermarkAbsolute,
        "-filter_complex", "[0:v][1:v]overlay=0:0:format=auto[v]",
        "-map", "[v]", "-map", "0:a?", "-c:v", "libx264", "-preset", "veryfast",
        "-crf", "20", "-c:a", "copy", "-shortest", "-movflags", "+faststart", finalAbsolute,
      ]);
    } else {
      await fs.rename(assembledAbsolute, finalAbsolute);
    }

    return {
      outputPath: path.relative(preview ? PUBLIC_ROOT : PROJECT_ROOT, finalAbsolute)
        .split(path.sep)
        .join("/"),
      publicUrl: preview ? "/media/generated/" + path.basename(finalAbsolute) : null,
    };
  } finally {
    await fs
      .rm(workDirAbsolute, { recursive: true, force: true })
      .catch(() => undefined);
  }
}
