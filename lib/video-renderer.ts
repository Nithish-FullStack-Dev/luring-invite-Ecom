import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { normalizePublicPath, resolvePublicFile } from "@/lib/media";
import { normalizeNewlines, normalizeConfigForEditor } from "@/lib/template-config";

const execFileAsync = promisify(execFile);
const PROJECT_ROOT = process.cwd();
const PUBLIC_ROOT = path.join(PROJECT_ROOT, "public");
const FFMPEG = process.env.FFMPEG_PATH || "ffmpeg";
const MAX_RENDER_SECONDS = Math.max(30, Number(process.env.MAX_RENDER_SECONDS || 180));

type FrameInput = Record<string, unknown>;
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
};

function toProjectRelative(absPath: string): string {
  return path.relative(PROJECT_ROOT, absPath).split(path.sep).join("/");
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

function validPosition(value: unknown, axis: "x" | "y"): string {
  const raw = String(value ?? (axis === "x" ? "center" : "center")).trim();
  if (["center", "centre", "middle"].includes(raw.toLowerCase())) {
    return axis === "x" ? "(w-text_w)/2" : "(h-text_h)/2";
  }
  if (/^-?\d+(\.\d+)?$/.test(raw)) return raw;
  // Accept FFmpeg position expressions, not arbitrary filter syntax.
  if (/^[a-zA-Z0-9_ ()+*/.\-]+$/.test(raw) && /[wh]/i.test(raw)) return raw;
  return "0";
}

function validEnable(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  const raw = String(value).trim();
  if (raw.length > 160) return null;
  if (/^[a-zA-Z0-9_(),.+*/<>=! \-]+$/.test(raw)) return raw;
  return null;
}

function fontName(value: unknown): string {
  const name = path.basename(String(value ?? "DejaVuSans.ttf")).trim();
  const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const aliases: Record<string, string> = {
    chopinscriptregular: "chopinscript.ttf",
    chopinscript: "chopinscript.ttf",
    chopinscriptttf: "chopinscript.ttf",
    philosopherregular: "Philosopher-Regular.ttf",
    philosopherregularttf: "Philosopher-Regular.ttf",
    philosopher: "Philosopher-Regular.ttf",
    greatvibesregular: "GreatVibes-Regular.ttf",
    greatvibesregularttf: "GreatVibes-Regular.ttf",
    greatvibes: "GreatVibes-Regular.ttf",
    opensansregular: "OpenSans-Regular.ttf",
    opensansregularttf: "OpenSans-Regular.ttf",
    opensansbold: "OpenSans-Bold.ttf",
    opensansboldttf: "OpenSans-Bold.ttf",
    playfairdisplaybold: "PlayfairDisplay-Bold.ttf",
    playfairdisplayboldttf: "PlayfairDisplay-Bold.ttf",
    dejavusansttf: "DejaVuSans.ttf",
    dejavu: "DejaVuSans.ttf",
  };
  return aliases[normalized] || name;
}

function wrapLines(raw: string, fontSize: number): string {
  const maxChars = Math.max(10, Math.min(90, Math.floor(930 / (fontSize * 0.56))));
  const output: string[] = [];
  for (const sourceLine of normalizeNewlines(raw).split("\n")) {
    const words = sourceLine.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      output.push("");
      continue;
    }
    let line = "";
    for (const word of words) {
      if (!line) {
        line = word;
      } else if ((line + " " + word).length <= maxChars) {
        line += " " + word;
      } else {
        output.push(line);
        line = word;
      }
    }
    if (line) output.push(line);
  }
  return output.join("\n");
}

function ffmpegEscapeFilterPath(relativePath: string): string {
  // All paths are generated beneath public/media without colons or quotes.
  return relativePath.replace(/\\/g, "/").replace(/'/g, "\\'");
}

async function runFfmpeg(args: string[]): Promise<void> {
  try {
    await execFileAsync(FFMPEG, args, {
      cwd: PROJECT_ROOT,
      timeout: MAX_RENDER_SECONDS * 1000,
      maxBuffer: 20 * 1024 * 1024,
      windowsHide: true,
    });
  } catch (error: any) {
    const stderr = String(error?.stderr || error?.message || "FFmpeg failed.");
    throw new Error(stderr.slice(-6000));
  }
}

function getFrameTexts(configValue: unknown, frameInput: FrameInput): any[] {
  const config = normalizeConfigForEditor(configValue);
  const texts = Array.isArray(config.texts) ? config.texts : [];
  return texts.map((item: any, index: number) => ({
    ...item,
    text: normalizeNewlines(frameInput[`text_${index}`] ?? item.text),
  }));
}

async function buildFrameFilterScript(
  frame: RenderFrame,
  frameInput: FrameInput,
  workDirRelative: string,
  frameIndex: number,
): Promise<string> {
  const normalizedConfig = normalizeConfigForEditor(frame.placeholderConfig);
  const texts = getFrameTexts(normalizedConfig, frameInput);
  const filters: string[] = [
    "scale=1080:1920:force_original_aspect_ratio=decrease",
    "pad=1080:1920:(ow-iw)/2:(oh-ih)/2",
    "setsar=1",
    "fps=30",
  ];

  let textIndex = 0;
  for (const textConfig of texts) {
    const fontSize = Math.max(6, Math.min(240, Math.round(Number(textConfig.fontSize) || 40)));
    const wrapped = wrapLines(String(textConfig.text ?? ""), fontSize);
    if (!wrapped.trim()) continue;
    const lines = wrapped.split("\n");

    const font = fontName(textConfig.fontFile ?? textConfig.font);
    const fontCandidate = path.join(PUBLIC_ROOT, "media", "fonts", font);
    let actualFont = fontCandidate;
    try {
      await fs.access(fontCandidate);
    } catch {
      actualFont = path.join(PUBLIC_ROOT, "media", "fonts", "DejaVuSans.ttf");
    }
    const fontRelative = toProjectRelative(actualFont);

    const x = validPosition(textConfig.x ?? textConfig.position?.x, "x");
    const rawY = String(textConfig.y ?? textConfig.position?.y ?? "center").trim();
    let baseY = validPosition(rawY, "y");
    const isVerticalCenter = ["center", "centre", "middle", "(h-text_h)/2"].includes(rawY.toLowerCase());
    const lineSpacing = 8;
    if (isVerticalCenter) {
      const blockHeight = lines.length * fontSize + Math.max(0, lines.length - 1) * lineSpacing;
      baseY = `(h/2)-(${Math.round(blockHeight / 2)})`;
    }

    const color = colorForFfmpeg(textConfig.fontColor ?? textConfig.color);
    const legacyTiming =
      textConfig.start !== undefined && textConfig.end !== undefined
        ? `between(t,${Number(textConfig.start)},${Number(textConfig.end)})`
        : null;
    const enable = validEnable(textConfig.enable ?? legacyTiming);
    const alpha = validEnable(textConfig.alpha);

    // Draw each line separately so every line can be centered independently.
    // This avoids the visual left-alignment that drawtext applies to shorter
    // lines inside a multiline text block.
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      if (!line.trim()) continue;
      const textFileRelative = `${workDirRelative}/frame-${frameIndex}-text-${textIndex}-line-${lineIndex}.txt`;
      const textFileAbsolute = path.join(PROJECT_ROOT, textFileRelative);
      await fs.writeFile(textFileAbsolute, line, "utf8");

      const y = lineIndex === 0
        ? baseY
        : `${baseY}+(${lineIndex * (fontSize + lineSpacing)})`;
      const params = [
        `fontfile='${ffmpegEscapeFilterPath(fontRelative)}'`,
        `textfile='${ffmpegEscapeFilterPath(textFileRelative)}'`,
        "expansion=none",
        `x='${x}'`,
        `y='${y}'`,
        `fontsize=${fontSize}`,
        `fontcolor=${color}`,
      ];
      if (enable) params.push(`enable='${enable}'`);
      if (alpha && /^if\(/i.test(alpha)) params.push(`alpha='${alpha}'`);
      filters.push(`drawtext=${params.join(":")}`);
    }
    textIndex++;
  }

  filters.push("format=yuv420p");
  return `[0:v]${filters.join(",")}[vout]`;
}

export async function renderInvitation(options: GenerateOptions): Promise<{ outputPath: string; publicUrl: string }> {
  const jobId = crypto.randomUUID();
  const workDirRelative = `public/media/tmp/${jobId}`;
  const workDirAbsolute = path.join(PROJECT_ROOT, workDirRelative);
  const generatedDir = path.join(PUBLIC_ROOT, "media", "generated");
  await fs.mkdir(workDirAbsolute, { recursive: true });
  await fs.mkdir(generatedDir, { recursive: true });

  const renderedFrames: string[] = [];
  let finalAbsolute = path.join(generatedDir, `invitation-${jobId}.mp4`);
  const intermediateAbsolute = path.join(workDirAbsolute, "joined-no-audio.mp4");

  try {
    if (options.frames.length === 0) throw new Error("This template has no frames to render.");

    for (let index = 0; index < options.frames.length; index++) {
      const frame = options.frames[index];
      if (!frame.sourceVideo) {
        throw new Error(`Frame ${frame.frameNumber} has no source video path configured.`);
      }
      const inputAbsolute = resolvePublicFile(frame.sourceVideo);
      try {
        await fs.access(inputAbsolute);
      } catch {
        throw new Error(
          `Source video is missing for frame ${frame.frameNumber}: ${normalizePublicPath(frame.sourceVideo)}. Copy the original MP4 into public/${normalizePublicPath(frame.sourceVideo)} and retry.`
        );
      }

      const scriptRelative = `${workDirRelative}/frame-${index}.filter`;
      const scriptAbsolute = path.join(PROJECT_ROOT, scriptRelative);
      const outputAbsolute = path.join(workDirAbsolute, `frame-${index}.mp4`);
      const frameInput = options.framesData[String(frame.id)] || options.framesData[String(index)] || {};
      const filterScript = await buildFrameFilterScript(frame, frameInput, workDirRelative, index);
      await fs.writeFile(scriptAbsolute, filterScript, "utf8");

      const args = ["-y", "-i", inputAbsolute, "-filter_complex_script", scriptAbsolute, "-map", "[vout]", "-an"];
      if (frame.durationSeconds && frame.durationSeconds > 0) args.push("-t", String(frame.durationSeconds));
      args.push(
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "20",
        "-pix_fmt", "yuv420p", "-r", "30", "-movflags", "+faststart", outputAbsolute,
      );
      await runFfmpeg(args);
      renderedFrames.push(outputAbsolute);
    }

    const concatRelative = `${workDirRelative}/concat.txt`;
    const concatAbsolute = path.join(PROJECT_ROOT, concatRelative);
    const concatContent = renderedFrames
      .map((file) => `file '${normalizeAbsoluteForConcat(file)}'`)
      .join("\n");
    await fs.writeFile(concatAbsolute, concatContent, "utf8");

    await runFfmpeg([
      "-y", "-f", "concat", "-safe", "0", "-i", concatAbsolute,
      "-an", "-c:v", "libx264", "-preset", "veryfast", "-crf", "20",
      "-pix_fmt", "yuv420p", "-r", "30", "-movflags", "+faststart", intermediateAbsolute,
    ]);

    if (options.musicPath) {
      const musicAbsolute = resolvePublicFile(options.musicPath);
      try {
        await fs.access(musicAbsolute);
      } catch {
        throw new Error(`Selected background music file is missing: ${normalizePublicPath(options.musicPath)}`);
      }
      await runFfmpeg([
        "-y", "-i", intermediateAbsolute, "-stream_loop", "-1", "-i", musicAbsolute,
        "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
        "-shortest", "-movflags", "+faststart", finalAbsolute,
      ]);
    } else {
      await fs.rename(intermediateAbsolute, finalAbsolute);
    }

    return {
      outputPath: path.relative(PUBLIC_ROOT, finalAbsolute).split(path.sep).join("/"),
      publicUrl: "/media/generated/" + path.basename(finalAbsolute),
    };
  } finally {
    await fs.rm(workDirAbsolute, { recursive: true, force: true }).catch(() => undefined);
  }
}
