"use client";
import { useActionState, useState, useSyncExternalStore } from "react";
import type { ContentKey } from "@/lib/cms/schema";
import { useRouter } from "next/navigation";
import { cmsRequest } from "@/lib/cms/client";
import type { ContentEntry } from "@/lib/cms/contracts";
async function save(
  _state: { error?: string },
  form: FormData,
  navigate: (url: string) => void,
  onSaved?: (entry: ContentEntry) => void,
) {
  try {
    const id = String(form.get("id") || "");
    const content = JSON.parse(String(form.get("content")));
    const body = {
      title: form.get("title"),
      version: Number(form.get("version")),
      status: form.get("status"),
      content,
      ...(!id ? { key: form.get("key") } : {}),
    };
    const entry = await cmsRequest<ContentEntry>(
      id ? "/api/content/" + encodeURIComponent(id) : "/api/content",
      id ? "PATCH" : "POST",
      body,
    );
    onSaved?.(entry);
    navigate("/admin/content/" + entry.id + "?saved=1");
    return {};
  } catch (error) {
    return {
      error:
        error instanceof SyntaxError
          ? "Enter valid JSON. Check commas and quotation marks."
          : error instanceof Error
            ? error.message
            : "Unable to save. Please try again.",
    };
  }
}
type Entry = {
  id?: string;
  title: string;
  key: ContentKey;
  version: number;
  content: unknown;
  status: string;
};
const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;
export default function Editor({
  entry,
  onSaved,
}: {
  entry: Entry;
  onSaved?: (entry: ContentEntry) => void;
}) {
  const hydrated = useSyncExternalStore(
    subscribe,
    clientSnapshot,
    serverSnapshot,
  );
  const router = useRouter();
  const [state, action, pending] = useActionState(
    (state: { error?: string }, form: FormData) =>
      save(
        state,
        form,
        (url) => {
          router.replace(url);
          router.refresh();
        },
        onSaved,
      ),
    {},
  );
  const [content, setContent] = useState(
    JSON.stringify(entry.content, null, 2),
  );
  return (
    <form action={action} className="cms-card">
      <input type="hidden" name="id" value={entry.id ?? ""} />
      <input type="hidden" name="key" value={entry.key} />
      <input type="hidden" name="version" value={entry.version} />
      <span className="cms-badge">{entry.status}</span>
      <label htmlFor="title">Title (admin label)</label>
      <input
        name="title"
        id="title"
        defaultValue={entry.title}
        required
        maxLength={200}
      />
      <label htmlFor="content">Structured content</label>
      <p id="content-help" className="cms-muted">
        Edit the text inside quotation marks. Keep field names unchanged. Add
        paragraphs or links by following the existing JSON structure. No HTML is
        needed.
      </p>
      <textarea
        id="content"
        name="content"
        value={content}
        readOnly={!hydrated}
        onChange={(e) => setContent(e.target.value)}
        rows={20}
        required
        maxLength={60000}
        spellCheck={false}
        aria-describedby="content-help"
      />
      <p className="cms-muted">
        Saving a published entry as a draft also unpublishes it. The website
        then shows its original static copy.
      </p>
      {state.error && (
        <p role="alert" className="cms-error">
          {state.error}
        </p>
      )}
      <div className="cms-actions">
        <button name="status" value="DRAFT" disabled={pending || !hydrated}>
          {pending
            ? "Saving…"
            : entry.status === "PUBLISHED"
              ? "Save draft & unpublish"
              : "Save draft"}
        </button>
        <button
          name="status"
          value="PUBLISHED"
          className="cms-primary"
          disabled={pending || !hydrated}
        >
          {pending ? "Saving…" : "Publish changes"}
        </button>
      </div>
    </form>
  );
}
