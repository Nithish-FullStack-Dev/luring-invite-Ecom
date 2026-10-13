import type { ApiResult } from "./contracts";
export async function cmsRequest<T>(url: string, method = "GET", body?: unknown): Promise<T> {
  const response = await fetch(url, { method, credentials: "same-origin", cache: "no-store",
    ...(body === undefined ? {} : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }) });
  const result = await response.json() as ApiResult<T>;
  if (!response.ok || result.error !== undefined) throw new Error(result.error ?? "The CMS is unavailable. Please try again later.");
  return result.data as T;
}
