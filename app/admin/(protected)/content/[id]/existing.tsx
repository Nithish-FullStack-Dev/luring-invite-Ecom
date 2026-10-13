"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { cmsRequest } from "@/lib/cms/client";
import type { ContentEntry } from "@/lib/cms/contracts";
import Editor from "./editor";
export default function ExistingEditor({
  id,
  saved,
}: {
  id: string;
  saved: boolean;
}) {
  const [entry, setEntry] = useState<ContentEntry | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    cmsRequest<ContentEntry>("/api/content/" + encodeURIComponent(id))
      .then((value) => {
        if (active) setEntry(value);
      })
      .catch((reason) => {
        if (active)
          setError(
            reason instanceof Error
              ? reason.message
              : "Unable to load content.",
          );
      });
    return () => {
      active = false;
    };
  }, [id]);
  if (error)
    return (
      <p className="cms-error" role="alert">
        {error}
      </p>
    );
  if (!entry)
    return (
      <p className="cms-card" aria-busy="true">
        Loading content…
      </p>
    );
  return (
    <>
      <Link href="/admin/content">← All content</Link>
      <h1>Edit {entry.key}</h1>
      <p className="cms-muted">
        Text is rendered safely. Use relative paths or HTTPS URLs for links.
      </p>
      {saved && (
        <p className="cms-success" role="status">
          Changes saved.{" "}
          {entry.status === "PUBLISHED"
            ? "Published content is now available on the website."
            : "This section is private; the website uses its original copy."}
        </p>
      )}
      <Editor key={entry.version} entry={entry} onSaved={setEntry} />
    </>
  );
}
