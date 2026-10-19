import { normalizeNewlines } from "@/lib/template-config";

/**
 * Shared deterministic wrapping for the CRM preview and FFmpeg. The frame
 * composition uses output pixels, so box width and font size stay in the same
 * coordinate space at both ends of the pipeline.
 */
export function wrapInvitationText(raw: string, fontSize: number, boxWidth = 930) {
  const normalized = normalizeNewlines(raw);
  // A line break authored in the visual editor is part of its composition.
  // Keep it verbatim instead of reflowing the line with a font-agnostic
  // character estimate that can differ from FreeType's actual glyph widths.
  if (normalized.includes("\n")) return normalized;
  const maxChars = Math.max(10, Math.min(180, Math.floor(boxWidth / (fontSize * 0.56))));
  const output: string[] = [];
  for (const sourceLine of normalized.split("\n")) {
    const words = sourceLine.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      output.push("");
      continue;
    }
    let line = "";
    for (const word of words) {
      if (!line) line = word;
      else if ((line + " " + word).length <= maxChars) line += ` ${word}`;
      else {
        output.push(line);
        line = word;
      }
    }
    if (line) output.push(line);
  }
  return output.join("\n");
}

/**
 * Convert stored composition coordinates to a percentage of the actual output
 * canvas. Legacy numeric coordinates are output pixels; percentage strings
 * are already normalized. The editor uses this at render and pointer time so
 * resizing the displayed canvas cannot change the saved composition position.
 */
export function compositionPositionPercent(
  value: unknown,
  compositionDimension: number,
  fallback = 50,
  axis: "x" | "y" = "x",
) {
  const raw = String(value ?? "center").trim().toLowerCase();
  if (["center", "centre", "middle"].includes(raw)) return 50;
  if (axis === "x" && raw === "left") return 0;
  if (axis === "x" && raw === "right") return 100;
  const parsed = raw.endsWith("%") ? Number(raw.slice(0, -1)) : Number(raw);
  if (!Number.isFinite(parsed)) return fallback;
  const percent = raw.endsWith("%")
    ? parsed
    : (parsed / Math.max(2, compositionDimension)) * 100;
  return percent;
}

/** Resolve the editor's anchor point into the composition's pixel space. */
export function compositionPositionPixels(
  value: unknown,
  compositionDimension: number,
  fallback = 50,
  axis: "x" | "y" = "x",
) {
  return (
    (compositionPositionPercent(
      value,
      compositionDimension,
      fallback,
      axis,
    ) /
      100) *
    Math.max(2, compositionDimension)
  );
}

