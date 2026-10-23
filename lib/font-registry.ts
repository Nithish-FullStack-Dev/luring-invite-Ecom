/**
 * Fonts exposed by the scene editor must also be readable by FFmpeg's
 * FreeType drawtext filter. Keep the browser URL and server font file paired
 * here so they cannot silently drift apart.
 */
export type RegisteredFont = {
  id: string;
  label: string;
  family: string;
  browserUrl: string;
  serverPath: string;
  format: "truetype" | "opentype";
  weight: number;
};

const registeredFiles = [
  ["AnandaBlackPersonalUse-Regular.ttf", "Ananda Black Personal Use", 400],
  ["bell-mt.ttf", "Bell MT", 400],
  ["bell-mt-bold.ttf", "Bell MT Bold", 700],
  ["Cardo-Regular.ttf", "Cardo", 400],
  ["Cardo-Bold.ttf", "Cardo Bold", 700],
  ["chopinscript.ttf", "Chopin Script", 400],
  ["DejaVuSans.ttf", "DejaVu Sans", 400],
  ["GreatVibes-Regular.ttf", "Great Vibes", 400],
  ["Massleave-Regular.ttf", "Massleave", 400],
  ["MinionPro-Regular.ttf", "Minion Pro", 400],
  ["MinionPro-Bold.ttf", "Minion Pro Bold", 700],
  ["Montserrat-Medium.ttf", "Montserrat Medium", 500],
  ["Montserrat-SemiBold.ttf", "Montserrat SemiBold", 600],
  ["Montserrat-Bold.ttf", "Montserrat Bold", 700],
  ["OpenSans-Regular.ttf", "Open Sans", 400],
  ["OpenSans-Bold.ttf", "Open Sans Bold", 700],
  ["Philosopher-Regular.ttf", "Philosopher", 400],
  ["Philosopher-Bold.ttf", "Philosopher Bold", 700],
  ["PlayfairDisplay-Bold.ttf", "Playfair Display Bold", 700],
  ["SheilaDemo.ttf", "Sheila Demo", 400],
] as const;

// Noto's script-specific OTFs are bundled so fallback does not depend on fonts
// installed on the machine running FFmpeg. Keep the originals and their OFL
// licenses under public/media/fonts/noto.
const notoFiles = [
  ["NotoSans-Regular.otf", "Noto Sans (Latin, Greek, Cyrillic)", "noto/noto-sans", "latin", 400],
  ["NotoSansArabic-Regular.otf", "Noto Sans Arabic", "noto/noto-sans-arabic", "arabic", 400],
  ["NotoNastaliqUrdu-Regular.otf", "Noto Nastaliq Urdu", "noto/noto-nastaliq-urdu", "urdu", 400],
  ["NotoSansArmenian-Regular.otf", "Noto Sans Armenian", "noto/noto-sans-armenian", "armenian", 400],
  ["NotoSansBengali-Regular.otf", "Noto Sans Bengali", "noto/noto-sans-bengali", "bengali", 400],
  ["NotoSansDevanagari-Regular.otf", "Noto Sans Devanagari", "noto/noto-sans-devanagari", "devanagari", 400],
  ["NotoSansEthiopic-Regular.otf", "Noto Sans Ethiopic", "noto/noto-sans-ethiopic", "ethiopic", 400],
  ["NotoSansGeorgian-Regular.otf", "Noto Sans Georgian", "noto/noto-sans-georgian", "georgian", 400],
  ["NotoSansGujarati-Regular.otf", "Noto Sans Gujarati", "noto/noto-sans-gujarati", "gujarati", 400],
  ["NotoSansGurmukhi-Regular.otf", "Noto Sans Gurmukhi", "noto/noto-sans-gurmukhi", "gurmukhi", 400],
  ["NotoSansHebrew-Regular.otf", "Noto Sans Hebrew", "noto/noto-sans-hebrew", "hebrew", 400],
  ["NotoSansKannada-Regular.otf", "Noto Sans Kannada", "noto/noto-sans-kannada", "kannada", 400],
  ["NotoSansKhmer-Regular.otf", "Noto Sans Khmer", "noto/noto-sans-khmer", "khmer", 400],
  ["NotoSansLao-Regular.otf", "Noto Sans Lao", "noto/noto-sans-lao", "lao", 400],
  ["NotoSansMalayalam-Regular.otf", "Noto Sans Malayalam", "noto/noto-sans-malayalam", "malayalam", 400],
  ["NotoSansMyanmar-Regular.otf", "Noto Sans Myanmar", "noto/noto-sans-myanmar", "myanmar", 400],
  ["NotoSansOriya-Regular.otf", "Noto Sans Odia", "noto/noto-sans-oriya", "oriya", 400],
  ["NotoSansSinhala-Regular.otf", "Noto Sans Sinhala", "noto/noto-sans-sinhala", "sinhala", 400],
  ["NotoSansTamil-Regular.otf", "Noto Sans Tamil", "noto/noto-sans-tamil", "tamil", 400],
  ["NotoSansTelugu-Regular.otf", "Noto Sans Telugu", "noto/noto-sans-telugu", "telugu", 400],
  ["NotoSansThai-Regular.otf", "Noto Sans Thai", "noto/noto-sans-thai", "thai", 400],
  ["NotoSansCJKsc-Regular.otf", "Noto Sans CJK Simplified Chinese", "noto/noto-sans-cjk-sc", "cjk-sc", 400],
  ["NotoSansCJKtc-Regular.otf", "Noto Sans CJK Traditional Chinese", "noto/noto-sans-cjk-tc", "cjk-tc", 400],
  ["NotoSansCJKjp-Regular.otf", "Noto Sans CJK Japanese", "noto/noto-sans-cjk-jp", "cjk-jp", 400],
  ["NotoSansCJKkr-Regular.otf", "Noto Sans CJK Korean", "noto/noto-sans-cjk-kr", "cjk-kr", 400],
] as const;

const notoRegistry: RegisteredFont[] = notoFiles.map(([file, label, family]) => ({
  id: `noto/${file}`,
  label,
  family,
  browserUrl: `/media/fonts/noto/${file}`,
  serverPath: `public/media/fonts/noto/${file}`,
  format: "opentype",
  weight: 400,
}));

export const FONT_REGISTRY: RegisteredFont[] = [...registeredFiles.map(
  ([file, label, weight]) => ({
    id: file,
    label,
    family: normalizedName(file),
    browserUrl: `/media/fonts/${file}`,
    serverPath: `public/media/fonts/${file}`,
    format: "truetype" as const,
    weight,
  }),
), ...notoRegistry];

export type ResolvedFont = {
  id: string;
  label: string;
  family: string;
  browserUrl: string;
  format: "truetype" | "opentype" | "woff" | "woff2";
  serverPath: string | null;
  renderable: boolean;
  supportsLetterSpacing: boolean;
};

function normalizedName(value: string) {
  return value.replace(/\\/g, "/").split("/").pop()!.replace(/\.(ttf|otf|woff2?)$/i, "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function normalizePublicFontPath(value: string) {
  const clean = value.replace(/\\/g, "/").replace(/^\/+/, "");
  const withoutPublic = clean.replace(/^public\//i, "");
  if (withoutPublic.startsWith("media/fonts/")) return withoutPublic;
  if (withoutPublic.startsWith("fonts/snell/")) return withoutPublic;
  if (withoutPublic.startsWith("fonts/")) return `media/${withoutPublic}`;
  return `media/fonts/${withoutPublic.split("/").pop()}`;
}

export function resolveFontAsset(value: unknown): ResolvedFont {
  const raw = String(value ?? "DejaVuSans.ttf").trim() || "DejaVuSans.ttf";
  const key = normalizedName(raw);
  const registered = FONT_REGISTRY.find((font) => normalizedName(font.id) === key);
  if (registered) {
    return {
      id: registered.id,
      label: registered.label,
      family: registered.family,
      browserUrl: registered.browserUrl,
      format: registered.format,
      serverPath: registered.serverPath,
      renderable: true,
      supportsLetterSpacing: !/(chopin|vibes|ananda|massleave|sheila)/i.test(registered.id),
    };
  }

  const legacyAliases: Record<string, string> = {
    anandablackpersonaluse: "AnandaBlackPersonalUse-Regular.ttf",
    bellmt: "bell-mt.ttf",
    cardo: "Cardo-Regular.ttf",
    dejavusans: "DejaVuSans.ttf",
    dejavu: "DejaVuSans.ttf",
    greatvibes: "GreatVibes-Regular.ttf",
    minionpro: "MinionPro-Regular.ttf",
    montserrat: "Montserrat-Medium.ttf",
    opensans: "OpenSans-Regular.ttf",
    philosopher: "Philosopher-Regular.ttf",
    playfairdisplay: "PlayfairDisplay-Bold.ttf",
    sheila: "SheilaDemo.ttf",
  };
  const legacy = legacyAliases[key];
  if (legacy) return resolveFontAsset(legacy);

  // Older templates may refer to the WOFF copy of Chopin Script. A real TTF
  // copy is already in public/media/fonts, so resolve the legacy alias to it.
  if (key === "chopinscript" || key === "chopinscriptttf") {
    const font = FONT_REGISTRY.find((item) => item.id === "chopinscript.ttf")!;
    return { ...font, renderable: true, supportsLetterSpacing: false };
  }

  // Snell is present only as WOFF/WOFF2. The browser can preview it, but the
  // bundled FFmpeg build cannot decode it through FreeType and silently uses
  // a system fallback. Keep it identifiable so the renderer can report this.
  if (key === "snellroundhandscript" || key === "snellroundhandscriptregular") {
    return {
      id: "SnellRoundhand-Script.woff2",
      label: "Snell Roundhand Script (browser only)",
      family: "snell-roundhand-script",
      browserUrl: "/fonts/snell/SnellRoundhand-Script.woff2",
      format: "woff2",
      serverPath: null,
      renderable: false,
      supportsLetterSpacing: false,
    };
  }

  const publicPath = normalizePublicFontPath(raw);
  const extension = publicPath.split(".").pop()?.toLowerCase();
  const supported = extension === "ttf" || extension === "otf";
  const browserFormat: ResolvedFont["format"] = extension === "otf"
    ? "opentype"
    : extension === "woff"
      ? "woff"
      : extension === "woff2"
        ? "woff2"
        : "truetype";
  const safePath = publicPath.split("/").some((part) => part === "..") ? null : `public/${publicPath}`;
  const file = publicPath.split("/").pop() || raw;
  return {
    id: publicPath,
    label: file.replace(/\.(ttf|otf|woff2?)$/i, "").replace(/[-_]/g, " "),
    family: `custom-${normalizedName(file)}`,
    browserUrl: `/${publicPath}`,
    format: browserFormat,
    serverPath: supported ? safePath : null,
    renderable: supported && Boolean(safePath),
    supportsLetterSpacing: supported && !/(script|cursive|calligraphy|vibes|ananda|massleave|sheila)/i.test(file),
  };
}

const SCRIPT_FONTS: Array<[RegExp, string]> = [
  [/\p{Script=Arabic}/u, "noto/NotoSansArabic-Regular.otf"],
  [/\p{Script=Armenian}/u, "noto/NotoSansArmenian-Regular.otf"],
  [/\p{Script=Bengali}/u, "noto/NotoSansBengali-Regular.otf"],
  [/\p{Script=Devanagari}/u, "noto/NotoSansDevanagari-Regular.otf"],
  [/\p{Script=Ethiopic}/u, "noto/NotoSansEthiopic-Regular.otf"],
  [/\p{Script=Georgian}/u, "noto/NotoSansGeorgian-Regular.otf"],
  [/\p{Script=Gujarati}/u, "noto/NotoSansGujarati-Regular.otf"],
  [/\p{Script=Gurmukhi}/u, "noto/NotoSansGurmukhi-Regular.otf"],
  [/\p{Script=Hebrew}/u, "noto/NotoSansHebrew-Regular.otf"],
  [/\p{Script=Kannada}/u, "noto/NotoSansKannada-Regular.otf"],
  [/\p{Script=Khmer}/u, "noto/NotoSansKhmer-Regular.otf"],
  [/\p{Script=Lao}/u, "noto/NotoSansLao-Regular.otf"],
  [/\p{Script=Malayalam}/u, "noto/NotoSansMalayalam-Regular.otf"],
  [/\p{Script=Myanmar}/u, "noto/NotoSansMyanmar-Regular.otf"],
  [/\p{Script=Oriya}/u, "noto/NotoSansOriya-Regular.otf"],
  [/\p{Script=Sinhala}/u, "noto/NotoSansSinhala-Regular.otf"],
  [/\p{Script=Tamil}/u, "noto/NotoSansTamil-Regular.otf"],
  [/\p{Script=Telugu}/u, "noto/NotoSansTelugu-Regular.otf"],
  [/\p{Script=Thai}/u, "noto/NotoSansThai-Regular.otf"],
  [/\p{Script=Greek}/u, "noto/NotoSans-Regular.otf"],
  [/\p{Script=Cyrillic}/u, "noto/NotoSans-Regular.otf"],
];

function scriptsInText(value: string) {
  const result = new Set<string>();
  if (/\p{Script=Arabic}/u.test(value)) {
    result.add(/[\u0679\u0688\u0691\u0698\u06a9\u06af\u06be\u06c1\u06c3\u06cc\u06d2\u06d3\u06f0-\u06f9]/u.test(value)
      ? "noto/NotoNastaliqUrdu-Regular.otf"
      : "noto/NotoSansArabic-Regular.otf");
  }
  if (/[\u3040-\u30ff]/u.test(value)) result.add("noto/NotoSansCJKjp-Regular.otf");
  if (/[\uac00-\ud7af]/u.test(value)) result.add("noto/NotoSansCJKkr-Regular.otf");
  if (/[\u3100-\u312f\u31a0-\u31bf]/u.test(value)) result.add("noto/NotoSansCJKtc-Regular.otf");
  // Han-only text defaults to Simplified Chinese; admins can pick the JP, TC,
  // or KR registry entry when the surrounding language requires that locale.
  if (/[\u3400-\u9fff]/u.test(value) && !/[\u3040-\u30ff\uac00-\ud7af]/u.test(value)) {
    result.add("noto/NotoSansCJKsc-Regular.otf");
  }
  for (const [pattern, font] of SCRIPT_FONTS) {
    if (pattern.test(value)) result.add(font);
  }
  if (/[\p{Script=Latin}\p{Script=Greek}\p{Script=Cyrillic}]/u.test(value)) {
    result.add("noto/NotoSans-Regular.otf");
  }
  return Array.from(result);
}

/** Ordered server/browser fallback choices, with the selected design font first. */
export function resolveFontFallbackSequence(value: unknown, text = ""): ResolvedFont[] {
  const preferred = resolveFontAsset(value);
  const ids = [preferred.id, ...scriptsInText(String(text ?? ""))];
  return Array.from(new Set(ids)).map(resolveFontAsset);
}

export function fontFamilyForEditor(value: unknown, weight?: unknown) {
  const font = resolveFontAsset(value);
  const selectedPath = font.renderable ? serverFontPath(value, weight) : font.serverPath;
  const variant = selectedPath
    ? FONT_REGISTRY.find((item) => item.serverPath === selectedPath)
    : undefined;
  return `luring-${variant?.family ?? font.family}`;
}

/** CSS family list with the selected design face first and detected-script
 * fallbacks after it. Browser shaping then uses the right face per glyph run. */
export function fontFamilyStackForEditor(value: unknown, text: string, weight?: unknown, allowedIds?: string[]) {
  const allowed = allowedIds ? new Set(allowedIds) : null;
  const families = resolveFontFallbackSequence(value, text)
    .filter((font) => !allowed || allowed.has(font.id))
    .filter((font) => font.renderable)
    .map((font) => `"${fontFamilyForEditor(font.id, font.id === resolveFontAsset(value).id ? weight : 400)}"`)
    .filter((font, index, values) => values.indexOf(font) === index);
  return `${families.length ? families.join(", ") : '"luring-dejavusans"'}, sans-serif`;
}

export function browserFontFaceCss(values: unknown[]) {
  const assets = new Map<string, ResolvedFont>();
  for (const font of FONT_REGISTRY) {
    const resolved = resolveFontAsset(font.id);
    assets.set(`${resolved.family}:${resolved.browserUrl}`, resolved);
  }
  for (const value of values) {
    const resolved = resolveFontAsset(value);
    assets.set(`${resolved.family}:${resolved.browserUrl}`, resolved);
  }
  return Array.from(assets.values()).map((font) => {
    const weight = FONT_REGISTRY.find((item) => item.browserUrl === font.browserUrl)?.weight ?? 400;
    return `@font-face{font-family:'luring-${font.family}';src:url('${font.browserUrl}') format('${font.format}');font-style:normal;font-weight:${weight};font-display:block}`;
  }).join("\n");
}

export function serverFontPath(value: unknown, weight?: unknown) {
  const base = resolveFontAsset(value);
  if (!base.renderable || !base.serverPath) {
    throw new Error(`Font "${base.label}" has no FFmpeg-compatible TTF/OTF asset. Select a font listed as renderable in the CRM or upload a TTF/OTF copy.`);
  }
  const requestedWeight = Number(weight);
  if (requestedWeight >= 600) {
    const boldVariant: Record<string, string> = {
      "bell-mt.ttf": "bell-mt-bold.ttf",
      "Cardo-Regular.ttf": "Cardo-Bold.ttf",
      "MinionPro-Regular.ttf": "MinionPro-Bold.ttf",
      "Montserrat-Medium.ttf": requestedWeight >= 700 ? "Montserrat-Bold.ttf" : "Montserrat-SemiBold.ttf",
      "OpenSans-Regular.ttf": "OpenSans-Bold.ttf",
      "Philosopher-Regular.ttf": "Philosopher-Bold.ttf",
    };
    const variant = boldVariant[base.id];
    if (variant) return `public/media/fonts/${variant}`;
  }
  return base.serverPath;
}
