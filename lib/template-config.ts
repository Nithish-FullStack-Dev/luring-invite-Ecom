export type EditableTextConfig = {
  key: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
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
  customerEditable?: boolean;
  visible?: boolean;
  boxWidth?: number;
  boxHeight?: number;
  fontWeight?: number;
  italic?: boolean;
  letterSpacing?: number;
  lineSpacing?: number;
  opacity?: number;
  rotation?: number;
  strokeWidth?: number;
  strokeColor?: string;
  shadowX?: number;
  shadowY?: number;
  shadowColor?: string;
  backgroundColor?: string;
  backgroundOpacity?: number;
  backgroundPadding?: number;
  visibleStart?: number;
  visibleEnd?: number | null;
  enable?: string;
  alpha?: string;
  anim?: Record<string, unknown> & {
    type?: string;
    duration?: number;
    delay?: number;
    direction?: "left" | "right" | "top" | "bottom";
    easing?: "linear" | "ease-out" | "ease-in-out";
    entrance?: Record<string, unknown>;
    exit?: Record<string, unknown>;
    emphasis?: Record<string, unknown>;
  };
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function parseConfig(value: unknown): Record<string, unknown> {
  if (!value) return {};
  if (isRecord(value)) return value;
  if (typeof value === "string") {
    try {
      const result = JSON.parse(value);
      return isRecord(result) ? result : {};
    } catch {
      return {};
    }
  }
  return {};
}

export function fieldKeyFromLabel(value: unknown, fallback = "text"): string {
  const key = String(value ?? "")
    .normalize("NFKC")
    .trim()
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "_")
    .replace(/^_+|_+$/g, "");
  return key || fallback;
}

export function normalizeConfigForEditor(value: unknown): Record<string, unknown> {
  const config = parseConfig(value);
  if (Array.isArray(config.texts)) {
    return {
      ...config,
      texts: config.texts.map((rawItem, index) => {
        const item = isRecord(rawItem) ? rawItem : {};
        return {
        ...item,
        key: String(item.key ?? item.name ?? "").trim() || `text_${index + 1}`,
        label: String(item.label ?? item.name ?? item.key ?? "").trim() || `Text field ${index + 1}`,
        placeholder: String(item.placeholder ?? ""),
        required: item.required === true,
        text: normalizeNewlines(item.text),
        };
      }),
    };
  }

  // Older templates stored named objects: {intro: {type:"text", text:"..."}}.
  const legacyTexts = Object.entries(config)
    .filter(([, value]) => {
      const item = isRecord(value) ? value : {};
      return item.type === "text" || Object.hasOwn(item, "text");
    })
    .map(([key, value], index) => {
      const item = isRecord(value) ? value : {};
      return {
        ...item,
        key: String(key).trim() || `text_${index + 1}`,
        label: String(item.label ?? key).trim() || `Text field ${index + 1}`,
        placeholder: String(item.placeholder ?? ""),
        required: item.required === true,
        text: normalizeNewlines(item.text),
        fontColor: item.fontColor ?? item.color ?? "#000000",
        x: item.x ?? "center",
        y: item.y ?? "center",
        maxLength: 500,
      };
    });

  return { ...config, texts: legacyTexts };
}

export function hasUniqueTextKeys(value: unknown): boolean {
  const config = normalizeConfigForEditor(value);
  if (!Array.isArray(config.texts)) return true;
  const keys = config.texts.map((entry, index) => {
    const item = isRecord(entry) ? entry : {};
    return String(item.key ?? `text_${index + 1}`).trim();
  });
  return new Set(keys).size === keys.length;
}
