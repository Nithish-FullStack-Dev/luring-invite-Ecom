export type TextRevealMode = "letter" | "word";

function graphemes(value: string) {
  if (typeof Intl.Segmenter === "function") {
    return Array.from(
      new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(value),
      (part) => part.segment,
    );
  }
  return Array.from(value);
}

export function revealUnits(value: string, mode: TextRevealMode) {
  if (mode === "letter") return graphemes(value);
  if (typeof Intl.Segmenter !== "function") {
    return value.match(/\s+|[^\s]+/gu) ?? [];
  }

  const result: string[] = [];
  let current = "";
  let gap = "";
  for (const part of new Intl.Segmenter(undefined, { granularity: "word" }).segment(value)) {
    if (part.isWordLike) {
      if (current) result.push(current);
      current = `${gap}${part.segment}`;
      gap = "";
    } else if (/^\s+$/u.test(part.segment)) {
      gap += part.segment;
    } else if (current) {
      // Keep punctuation attached to the word that precedes it.
      current += part.segment;
    } else if (result.length) {
      result[result.length - 1] += part.segment;
    } else {
      current += part.segment;
    }
  }
  if (current) result.push(current + gap);
  else if (gap && result.length) result[result.length - 1] += gap;
  else if (gap) result.push(gap);
  return result.length ? result : graphemes(value);
}

export function revealPrefix(value: string, mode: TextRevealMode, progress: number) {
  const units = revealUnits(value, mode);
  const amount = Math.max(0, Math.min(units.length, Math.ceil(units.length * Math.max(0, Math.min(1, progress)))));
  return units.slice(0, amount).join("");
}

