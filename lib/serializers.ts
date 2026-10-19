import type { Category, Template, TemplateFrame, MusicTrack } from "@prisma/client";
import { normalizeConfigForEditor } from "@/lib/template-config";

export function serializeCategory(category: Category) {
  return { id: category.id, name: category.name, slug: category.slug, parentId: category.parentId };
}

export function serializeTemplate<
  T extends Template & {
    categories?: { category: Category }[];
    frames?: TemplateFrame[];
    musicTracks?: MusicTrack[];
  },
>(template: T, includeAdminConfig = false) {
  return {
    id: template.id,
    title: template.title,
    slug: template.slug,
    description: template.description,
    thumbnail: template.thumbnail,
    previewVideo: template.previewVideo,
    sourceVideo: template.sourceVideo,
    active: template.active,
    musicConfigured: template.musicConfigured,
    musicTracks: template.musicTracks?.map((track) =>
      includeAdminConfig ? serializeMusic(track) : serializeCustomerMusic(track),
    ) ?? [],
    price: Number(template.price),
    durationSeconds: template.durationSeconds,
    categories: template.categories?.map((entry) => serializeCategory(entry.category)) ?? [],
    frames: template.frames?.map((frame) => serializeFrame(frame, includeAdminConfig)) ?? [],
    createdAt: template.createdAt.toISOString(),
  };
}

export function serializeFrame(frame: TemplateFrame, includeAdminConfig = false) {
  const base = {
    id: frame.id,
    templateId: frame.templateId,
    frameNumber: frame.frameNumber,
    title: frame.title,
    previewImage: frame.previewImage,
    durationSeconds: frame.durationSeconds,
  };
  if (includeAdminConfig) {
    return { ...base, sourceVideo: frame.sourceVideo, placeholderConfig: frame.placeholderConfig };
  }
  return {
    ...base,
    placeholderConfig: serializeCustomerTextConfig(frame.placeholderConfig),
  };
}

export function serializeCustomerTextConfig(value: unknown) {
  const config = normalizeConfigForEditor(value);
  return {
    texts: (Array.isArray(config.texts) ? config.texts : []).filter((rawText) => {
      const text = rawText && typeof rawText === "object" && !Array.isArray(rawText)
        ? rawText as Record<string, unknown>
        : {};
      return text.customerEditable !== false && text.visible !== false;
    }).map((rawText, index) => {
      const text = rawText && typeof rawText === "object" && !Array.isArray(rawText)
        ? rawText as Record<string, unknown>
        : {};
      return {
        key: String(text.key ?? `text_${index + 1}`),
        label: String(text.label ?? text.name ?? text.key ?? `Text field ${index + 1}`),
        placeholder: String(text.placeholder ?? ""),
        required: text.required === true,
        text: String(text.text ?? ""),
        maxLength: Number(text.maxLength) || 500,
      };
    }),
  };
}

export function serializeCustomerMusic(track: MusicTrack) {
  return { id: track.id, title: track.title, duration: track.duration };
}

export function serializeMusic(track: MusicTrack) {
  return {
    id: track.id,
    title: track.title,
    path: track.path,
    duration: track.duration,
    enabled: track.enabled,
  };
}
