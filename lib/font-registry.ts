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
  format: "truetype";
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

export const FONT_REGISTRY: RegisteredFont[] = registeredFiles.map(
  ([file, label, weight]) => ({
    id: file,
    label,
    family: normalizedName(file),
    browserUrl: `/media/fonts/${file}`,
    serverPath: `public/media/fonts/${file}`,
    format: "truetype",
    weight,
  }),
);

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
      format: "truetype",
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

export function fontFamilyForEditor(value: unknown, weight?: unknown) {
  const font = resolveFontAsset(value);
  const selectedPath = font.renderable ? serverFontPath(value, weight) : font.serverPath;
  const variant = selectedPath
    ? FONT_REGISTRY.find((item) => item.serverPath === selectedPath)
    : undefined;
  return `luring-${variant?.family ?? font.family}`;
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
