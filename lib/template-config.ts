export type EditableTextConfig = {
  key: string;
  text: string;
  font?: string;
  fontFile?: string;
  fontSize?: number;
  fontColor?: string;
  color?: string;
  x?: string | number;
  y?: string | number;
  position?: { x?: string | number; y?: string | number };
  alignment?: string;
  enable?: string;
  alpha?: string;
  anim?: Record<string, unknown>;
  maxLength?: number;
  [key: string]: unknown;
};

export function normalizeNewlines(value: unknown): string {
  return String(value ?? "")
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\n")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
}

export function parseConfig(value: unknown): Record<string, any> {
  if (!value) return {};
  if (typeof value === "object" && !Array.isArray(value)) return value as Record<string, any>;
  if (typeof value === "string") {
    try {
      const result = JSON.parse(value);
      return result && typeof result === "object" ? result : {};
    } catch {
      return {};
    }
  }
  return {};
}

export function normalizeConfigForEditor(value: unknown): Record<string, any> {
  const config = parseConfig(value);
  if (Array.isArray(config.texts)) {
    return {
      ...config,
      texts: config.texts.map((item: any, index: number) => ({
        ...item,
        key: String(item.key ?? item.name ?? `Text ${index + 1}`),
        text: normalizeNewlines(item.text),
      })),
    };
  }

  // Older templates stored named objects: {intro: {type:"text", text:"..."}}.
  const legacyTexts = Object.entries(config)
    .filter(([, value]) => value && typeof value === "object" && ((value as any).type === "text" || "text" in (value as any)))
    .map(([key, value]) => ({
      key,
      ...(value as Record<string, unknown>),
      text: normalizeNewlines((value as any).text),
      fontColor: (value as any).fontColor ?? (value as any).color ?? "#000000",
      x: (value as any).x ?? "center",
      y: (value as any).y ?? "center",
      maxLength: 500,
    }));

  return { ...config, texts: legacyTexts };
}
