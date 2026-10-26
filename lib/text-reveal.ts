export type TextRevealMode = "letter" | "word";

export function graphemeUnits(value: string) {
  if (typeof Intl.Segmenter === "function") {
    return Array.from(
      new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(value),
      (part) => part.segment,
    );
  }

  // Older runtimes still keep combining marks, variation selectors, emoji
  // modifiers, and ZWJ sequences with their base grapheme.
  const result: string[] = [];
  let joinNext = false;
  let regionalRun = 0;
  for (const point of Array.from(value)) {
    const code = point.codePointAt(0) ?? 0;
    const isMark = /\p{Mark}/u.test(point);
    const isVariation = (code >= 0xfe00 && code <= 0xfe0f) || (code >= 0xe0100 && code <= 0xe01ef);
    const isModifier = code >= 0x1f3fb && code <= 0x1f3ff;
    const isJoiner = code === 0x200d;
    const isRegional = code >= 0x1f1e6 && code <= 0x1f1ff;
    if (result.length && (isMark || isVariation || isModifier || joinNext || isJoiner || (isRegional && regionalRun % 2 === 1))) {
      result[result.length - 1] += point;
    } else {
      result.push(point);
    }
    joinNext = isJoiner;
    regionalRun = isRegional ? regionalRun + 1 : 0;
  }
  return result;
}

function graphemes(value: string) {
  return graphemeUnits(value);
}

export function revealUnits(value: string, mode: TextRevealMode) {
  if (mode === "letter") return graphemes(value);
  if (typeof Intl.Segmenter !== "function") {
    return value.match(/\s+|[^\s]+/gu) ?? [];
  }

  // Use the text's writing system so word-wise reveal respects dictionaries
  // and boundaries in languages that do not use Latin spaces in the same way.
  const locale = /[\u3040-\u30ff]/u.test(value)
    ? "ja"
    : /[\uac00-\ud7af]/u.test(value)
      ? "ko"
      : /[\u3400-\u9fff]/u.test(value)
        ? "zh"
        : /\p{Script=Arabic}/u.test(value)
          ? "ar"
          : /\p{Script=Hebrew}/u.test(value)
            ? "he"
            : /\p{Script=Devanagari}/u.test(value)
              ? "hi"
              : /\p{Script=Bengali}/u.test(value)
                ? "bn"
                : /\p{Script=Gurmukhi}/u.test(value)
                  ? "pa"
                  : /\p{Script=Gujarati}/u.test(value)
                    ? "gu"
                    : /\p{Script=Oriya}/u.test(value)
                      ? "or"
                      : /\p{Script=Tamil}/u.test(value)
                        ? "ta"
                        : /\p{Script=Telugu}/u.test(value)
                          ? "te"
                          : /\p{Script=Kannada}/u.test(value)
                            ? "kn"
                            : /\p{Script=Malayalam}/u.test(value)
                              ? "ml"
                              : /\p{Script=Thai}/u.test(value)
                                ? "th"
                                : /\p{Script=Khmer}/u.test(value)
                                  ? "km"
                                  : /\p{Script=Lao}/u.test(value)
                                    ? "lo"
                                    : /\p{Script=Myanmar}/u.test(value)
                                      ? "my"
                                      : undefined;
  const result: string[] = [];
  let current = "";
  let gap = "";
  for (const part of new Intl.Segmenter(locale, { granularity: "word" }).segment(value)) {
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

export function countGraphemes(value: string) {
  return graphemeUnits(value).length;
}

export function truncateGraphemes(value: string, maximum: number) {
  return graphemeUnits(value).slice(0, Math.max(0, maximum)).join("");
}

export function requiresComplexShaping(value: string) {
  return /[\p{Script=Arabic}\p{Script=Syriac}\p{Script=Thaana}\p{Script=Nko}\p{Script=Devanagari}\p{Script=Bengali}\p{Script=Gurmukhi}\p{Script=Gujarati}\p{Script=Oriya}\p{Script=Tamil}\p{Script=Telugu}\p{Script=Kannada}\p{Script=Malayalam}\p{Script=Sinhala}\p{Script=Khmer}\p{Script=Myanmar}\p{Script=Thai}\p{Script=Lao}]/u.test(value);
}

/** Letter spacing between joined/combining script glyphs breaks shaping. */
export function supportsTextLetterSpacing(value: string) {
  return !/[\p{Mark}]/u.test(value) && !requiresComplexShaping(value);
}

