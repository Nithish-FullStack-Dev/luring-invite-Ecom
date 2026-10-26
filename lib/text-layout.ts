import { normalizeNewlines } from "@/lib/template-config";
import { graphemeUnits } from "@/lib/text-reveal";

/**
 * Shared deterministic wrapping for the CRM preview and FFmpeg. The frame
 * composition uses output pixels, so box width and font size stay in the same
 * coordinate space at both ends. Unbroken text wraps on grapheme boundaries
 * using script-aware width estimates; authored line breaks remain untouched.
 */
export function wrapInvitationText(raw: string, fontSize: number, boxWidth = 930) {
  const normalized = normalizeNewlines(raw);
  // A line break authored in the visual editor is part of its composition.
  // Keep it verbatim instead of reflowing a deliberately authored layout.
  if (normalized.includes("\n")) return normalized;
  const widthInEm = Math.max(1, boxWidth / Math.max(1, fontSize));
  const measure = (value: string) => graphemeUnits(value).reduce((total, cluster) => {
    if (/^\s+$/u.test(cluster)) return total + (/\t/u.test(cluster) ? 1.32 : 0.33);
    if (/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\p{Extended_Pictographic}]/u.test(cluster)) return total + 1;
    if (/^[\p{Mark}\u200c\u200d\ufe00-\ufe0f]+$/u.test(cluster)) return total;
    if (/[\p{Script=Devanagari}\p{Script=Bengali}\p{Script=Gurmukhi}\p{Script=Gujarati}\p{Script=Oriya}\p{Script=Tamil}\p{Script=Telugu}\p{Script=Kannada}\p{Script=Malayalam}\p{Script=Sinhala}\p{Script=Khmer}\p{Script=Myanmar}]/u.test(cluster)) return total + 0.92;
    if (/[\p{Script=Arabic}\p{Script=Hebrew}\p{Script=Thai}\p{Script=Lao}]/u.test(cluster)) return total + 0.72;
    if (/[ilI.,'`!:;|]/u.test(cluster)) return total + 0.3;
    if (/[MW@%&]/u.test(cluster)) return total + 0.86;
    return total + 0.57;
  }, 0);
  const output: string[] = [];
  let line = "";
  let pendingWhitespace = "";
  const appendWord = (word: string) => {
    let part = "";
    let partWidth = 0;
    for (const cluster of graphemeUnits(word)) {
      const clusterWidth = measure(cluster);
      if (part && partWidth + clusterWidth > widthInEm) {
        const nextLine = `${line}${pendingWhitespace}${part}`;
        if (line && measure(nextLine) > widthInEm) output.push(line);
        else if (line) output.push(line);
        else output.push(`${pendingWhitespace}${part}`);
        line = "";
        pendingWhitespace = "";
        part = "";
        partWidth = 0;
      }
      part += cluster;
      partWidth += clusterWidth;
    }
    if (!part) return;
    const nextLine = `${line}${pendingWhitespace}${part}`;
    if (line && measure(nextLine) > widthInEm) {
      output.push(line);
      line = part;
    } else {
      line = nextLine;
    }
    pendingWhitespace = "";
  };

  for (const token of normalized.match(/\s+|[^\s]+/gu) ?? []) {
    if (/^\s+$/u.test(token)) {
      pendingWhitespace += token;
      continue;
    }
    appendWord(token);
  }
  if (line || pendingWhitespace) output.push(line + pendingWhitespace);
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

