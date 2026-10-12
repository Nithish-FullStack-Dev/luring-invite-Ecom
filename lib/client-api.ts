export const API_BASE = "/api";

export function apiUrl(endpoint: string): string {
  return `${API_BASE}/${endpoint.replace(/^\/+/, "")}`;
}

export function mediaUrl(value: unknown): string {
  let path = String(value ?? "").trim().replace(/\\/g, "/");
  if (!path) return "";
  if (/^(https?:)?\/\//i.test(path) || path.startsWith("data:")) return path;
  path = path.replace(/^\/+/, "");
  path = path.replace(/^luringwebsite\//, "");
  path = path.replace(/^api\//, "");
  if (!path.startsWith("media/")) {
    if (/^(uploads|templates|fonts|music|generated)\//.test(path)) path = `media/${path}`;
  }
  return `/${path.split("/").map((part) => encodeURIComponent(part)).join("/")}`;
}
