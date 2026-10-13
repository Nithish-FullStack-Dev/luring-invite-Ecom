import { z } from "zod";
const text = (max: number) => z.string().trim().min(1).max(max);
export const emailSchema = z.string().trim().toLowerCase().email().max(254);
export const passwordSchema = z.string().min(15, "Use at least 15 characters.").max(128);
export const linkSchema = text(2048).refine((value) => {
  if (/[\s\\\u0000-\u001f]/.test(value)) return false;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password; }
  catch { return false; }
}, "Use a site-relative path or HTTPS URL without credentials.");
const link = z.object({ label: text(80), url: linkSchema }).strict();
export const contentSchemas = {
  hero: z.object({ heading: text(200), description: text(1500) }).strict(),
  about: z.object({ heading: text(200), description: text(1500), paragraphs: z.array(text(4000)).min(1).max(12) }).strict(),
  contact: z.object({ phone: z.string().regex(/^\+?[0-9 ()-]{7,30}$/), email: emailSchema, location: text(300), hours: text(150), whatsapp: z.string().regex(/^[0-9]{7,15}$/) }).strict(),
  navigation: z.object({ links: z.array(link).min(1).max(12) }).strict(),
  footer: z.object({ text: text(1500), copyright: text(300), socialLinks: z.array(link).max(10) }).strict(),
};
export type ContentKey = keyof typeof contentSchemas;
export type ContentMap = { [K in ContentKey]: z.infer<(typeof contentSchemas)[K]> };
export type PublicContent = Partial<ContentMap>;
export const contentKeys = Object.keys(contentSchemas) as ContentKey[];
export const keySchema = z.enum(["hero", "about", "contact", "navigation", "footer"]);
export const entrySchema = z.object({
  id: z.string().cuid().optional(), title: text(200), key: keySchema,
  status: z.enum(["DRAFT", "PUBLISHED"]), version: z.coerce.number().int().nonnegative(), content: z.unknown(),
}).strict();
export function parseContent<K extends ContentKey>(key: K, value: unknown): ContentMap[K] {
  return contentSchemas[key].parse(value) as ContentMap[K];
}
