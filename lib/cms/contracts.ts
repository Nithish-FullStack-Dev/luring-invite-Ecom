import type { ContentKey } from "./schema";
export type AdminIdentity = { id: string; email: string };
export type ContentEntry = {
  id: string; title: string; key: ContentKey; type: string;
  status: "DRAFT" | "PUBLISHED"; version: number; content: unknown;
  createdAt: string; updatedAt: string;
};
export type ContentList = { entries: ContentEntry[]; missing: ContentKey[] };
export type ApiResult<T> = { data: T; error?: never } | { error: string; data?: never };
