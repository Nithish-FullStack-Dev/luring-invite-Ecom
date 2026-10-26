/** Small OpenType cmap reader used to reject missing glyphs before rendering. */
type Cmap = { hasGlyph(codePoint: number): boolean };

function cmapFor(input: Uint8Array): Cmap {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const requireBytes = (offset: number, length: number) => {
    if (offset < 0 || offset + length > view.byteLength) {
      throw new Error("Font file has a truncated OpenType table.");
    }
  };
  requireBytes(0, 12);
  const tableCount = view.getUint16(4);
  requireBytes(12, tableCount * 16);
  let cmapOffset = -1;
  for (let index = 0; index < tableCount; index++) {
    const record = 12 + index * 16;
    if (
      view.getUint8(record) === 0x63 &&
      view.getUint8(record + 1) === 0x6d &&
      view.getUint8(record + 2) === 0x61 &&
      view.getUint8(record + 3) === 0x70
    ) {
      cmapOffset = view.getUint32(record + 8);
      break;
    }
  }
  if (cmapOffset < 0) throw new Error("Font file has no Unicode cmap table.");
  requireBytes(cmapOffset, 4);
  const encodingCount = view.getUint16(cmapOffset + 2);
  requireBytes(cmapOffset + 4, encodingCount * 8);
  const subtables: Array<{ offset: number; format: number; score: number }> = [];
  for (let index = 0; index < encodingCount; index++) {
    const record = cmapOffset + 4 + index * 8;
    const platform = view.getUint16(record);
    const encoding = view.getUint16(record + 2);
    const offset = cmapOffset + view.getUint32(record + 4);
    requireBytes(offset, 2);
    const format = view.getUint16(offset);
    if (format !== 4 && format !== 12 && format !== 13) continue;
    const score = format === 12 || format === 13
      ? 30 + (platform === 0 ? 3 : encoding === 10 ? 2 : 0)
      : 20 + (platform === 0 ? 3 : encoding === 1 ? 2 : 0);
    subtables.push({ offset, format, score });
  }
  subtables.sort((left, right) => right.score - left.score);

  const format12 = subtables.find(({ format }) => format === 12 || format === 13);
  if (format12) {
    const { offset, format } = format12;
    requireBytes(offset, 16);
    const groupCount = view.getUint32(offset + 12);
    requireBytes(offset + 16, groupCount * 12);
    const groups: Array<[number, number, number]> = [];
    for (let index = 0; index < groupCount; index++) {
      const groupOffset = offset + 16 + index * 12;
      groups.push([
        view.getUint32(groupOffset),
        view.getUint32(groupOffset + 4),
        view.getUint32(groupOffset + 8),
      ]);
    }
    return {
      hasGlyph(codePoint) {
        let low = 0;
        let high = groups.length - 1;
        while (low <= high) {
          const middle = (low + high) >> 1;
          const [start, end, glyph] = groups[middle];
          if (codePoint < start) high = middle - 1;
          else if (codePoint > end) low = middle + 1;
          else return format === 13 ? glyph !== 0 : glyph + codePoint - start !== 0;
        }
        return false;
      },
    };
  }

  const format4 = subtables.find(({ format }) => format === 4);
  if (format4) {
    const { offset } = format4;
    requireBytes(offset, 14);
    const length = view.getUint16(offset + 2);
    requireBytes(offset, length);
    const segmentCount = view.getUint16(offset + 6) / 2;
    const endStart = offset + 14;
    const startStart = endStart + segmentCount * 2 + 2;
    const deltaStart = startStart + segmentCount * 2;
    const rangeStart = deltaStart + segmentCount * 2;
    const segments: Array<[number, number, number, number]> = [];
    for (let index = 0; index < segmentCount; index++) {
      segments.push([
        view.getUint16(startStart + index * 2),
        view.getUint16(endStart + index * 2),
        view.getInt16(deltaStart + index * 2),
        view.getUint16(rangeStart + index * 2),
      ]);
    }
    return {
      hasGlyph(codePoint) {
        if (codePoint > 0xffff) return false;
        const index = segments.findIndex(([, end]) => codePoint <= end);
        if (index < 0) return false;
        const [start, end, delta, range] = segments[index];
        if (codePoint < start || codePoint > end) return false;
        if (!range) return ((codePoint + delta) & 0xffff) !== 0;
        const rangeWord = rangeStart + index * 2;
        const glyphAddress = rangeWord + range + (codePoint - start) * 2;
        if (glyphAddress + 2 > offset + length) return false;
        const glyph = view.getUint16(glyphAddress);
        return glyph !== 0 && ((glyph + delta) & 0xffff) !== 0;
      },
    };
  }
  throw new Error("Font file has no supported Unicode cmap table.");
}

/** Read the typographic family name so Fontconfig/Pango and FFmpeg resolve the
 * same bundled face instead of relying on the filename as a family alias. */
export function readFontFamilyName(input: Uint8Array): string | null {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (view.byteLength < 12) return null;
  const tableCount = view.getUint16(4);
  if (12 + tableCount * 16 > view.byteLength) return null;
  let nameOffset = -1;
  let nameLength = 0;
  for (let index = 0; index < tableCount; index++) {
    const record = 12 + index * 16;
    if (view.getUint32(record) === 0x6e616d65) {
      nameOffset = view.getUint32(record + 8);
      nameLength = view.getUint32(record + 12);
      break;
    }
  }
  if (nameOffset < 0 || nameOffset + nameLength > view.byteLength || nameLength < 6) return null;
  const count = view.getUint16(nameOffset + 2);
  const storageOffset = nameOffset + view.getUint16(nameOffset + 4);
  if (nameOffset + 6 + count * 12 > nameOffset + nameLength) return null;
  const names: Array<{ score: number; value: string }> = [];
  for (let index = 0; index < count; index++) {
    const record = nameOffset + 6 + index * 12;
    const platform = view.getUint16(record);
    const encoding = view.getUint16(record + 2);
    const language = view.getUint16(record + 4);
    const nameId = view.getUint16(record + 6);
    if (nameId !== 16 && nameId !== 1) continue;
    const length = view.getUint16(record + 8);
    const offset = storageOffset + view.getUint16(record + 10);
    if (offset + length > nameOffset + nameLength || offset + length > view.byteLength) continue;
    let value = "";
    if (platform === 0 || platform === 3) {
      for (let cursor = 0; cursor + 1 < length; cursor += 2) {
        value += String.fromCharCode(view.getUint16(offset + cursor));
      }
    } else {
      value = new TextDecoder("windows-1252").decode(bytes.subarray(offset, offset + length));
    }
    value = value.replace(/\0/g, "").trim();
    if (value) names.push({
      score: (nameId === 16 ? 10 : 0) + (platform === 3 ? 4 : platform === 0 ? 3 : 0) + (language === 0x0409 || language === 0 ? 1 : 0) + (encoding === 10 ? 1 : 0),
      value,
    });
  }
  names.sort((left, right) => right.score - left.score);
  return names[0]?.value ?? null;
}

function isNonRenderingControl(codePoint: number) {
  return codePoint === 0x09 || codePoint === 0x0a || codePoint === 0x0d ||
    codePoint === 0x200c || codePoint === 0x200d || codePoint === 0x2060 ||
    codePoint === 0xfeff || (codePoint >= 0xfe00 && codePoint <= 0xfe0f) ||
    (codePoint >= 0xe0100 && codePoint <= 0xe01ef) ||
    (codePoint >= 0x202a && codePoint <= 0x202e) ||
    (codePoint >= 0x2066 && codePoint <= 0x2069);
}

export function createFontGlyphChecker(input: Uint8Array) {
  const cmap = cmapFor(input);
  return (text: string, limit = Number.POSITIVE_INFINITY) => {
    const missing: number[] = [];
    const seen = new Set<number>();
    for (const character of String(text ?? "")) {
      const codePoint = character.codePointAt(0) ?? 0;
      if (isNonRenderingControl(codePoint) || seen.has(codePoint)) continue;
      seen.add(codePoint);
      if (!cmap.hasGlyph(codePoint)) {
        missing.push(codePoint);
        if (missing.length >= limit) break;
      }
    }
    return missing;
  };
}

export function missingFontGlyphs(input: Uint8Array, text: string, limit = Number.POSITIVE_INFINITY) {
  return createFontGlyphChecker(input)(text, limit);
}

export function formatMissingCodePoints(codePoints: number[], limit = 12) {
  const shown = codePoints.slice(0, limit).map((value) => `U+${value.toString(16).toUpperCase().padStart(4, "0")}`);
  const omitted = codePoints.length - shown.length;
  return `${shown.join(", ")}${omitted > 0 ? ` and ${omitted} more` : ""}`;
}
