import "server-only";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { assertOrigin } from "./security";
import { CmsError } from "./errors";
import type { ApiResult } from "./contracts";

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export function json<T>(data: T, status = 200) {
  return NextResponse.json<ApiResult<T>>({ data }, { status, headers: {
    "Cache-Control": "private, no-store", Vary: "Cookie", "X-Content-Type-Options": "nosniff",
  } });
}
export async function api(operation: () => Promise<Response>): Promise<Response> {
  try { return await operation(); }
  catch (error) {
    let status = 503, message = "The CMS is unavailable. Please try again later.";
    if (error instanceof HttpError || error instanceof CmsError) { status = error.status; message = error.message; }
    else if (error instanceof ZodError) { status = 400; message = error.issues.map(i => i.path.join(".") + ": " + i.message).join("; "); }
    return NextResponse.json({ error: message }, { status, headers: {
      "Cache-Control": "private, no-store", Vary: "Cookie", "X-Content-Type-Options": "nosniff",
    } });
  }
}
export function mutation(request: Request) {
  try { assertOrigin(request.headers.get("origin"), process.env.CMS_ORIGIN, process.env.NODE_ENV === "production"); }
  catch { throw new HttpError(403, "Request origin rejected."); }
}
// Route Handlers do not inherit the old Server Action body limit.
export async function readJson(request: Request): Promise<unknown> {
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json")
    throw new HttpError(415, "Use application/json.");
  const limit = 128 * 1024;
  if (Number(request.headers.get("content-length")) > limit) throw new HttpError(413, "Request is too large.");
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "Enter valid JSON.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) { await reader.cancel(); throw new HttpError(413, "Request is too large."); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { throw new HttpError(400, "Enter valid JSON. Check commas and quotation marks."); }
}
