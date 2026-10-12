import type { Category, Template, TemplateFrame, MusicTrack } from "@prisma/client";

export function serializeCategory(category: Category) {
  return { id: category.id, name: category.name, slug: category.slug, parentId: category.parentId };
}

export function serializeTemplate<T extends Template & { categories?: { category: Category }[]; frames?: TemplateFrame[] }>(template: T) {
  return {
    id: template.id,
    title: template.title,
    slug: template.slug,
    description: template.description,
    thumbnail: template.thumbnail,
    previewVideo: template.previewVideo,
    sourceVideo: template.sourceVideo,
    price: Number(template.price),
    durationSeconds: template.durationSeconds,
    categories: template.categories?.map((entry) => serializeCategory(entry.category)) ?? [],
    frames: template.frames?.map(serializeFrame) ?? [],
    createdAt: template.createdAt.toISOString(),
  };
}

export function serializeFrame(frame: TemplateFrame) {
  return {
    id: frame.id,
    templateId: frame.templateId,
    frameNumber: frame.frameNumber,
    title: frame.title,
    sourceVideo: frame.sourceVideo,
    previewImage: frame.previewImage,
    placeholderConfig: frame.placeholderConfig,
    durationSeconds: frame.durationSeconds,
  };
}

export function serializeMusic(track: MusicTrack) {
  return { id: track.id, title: track.title, path: track.path, duration: track.duration };
}
