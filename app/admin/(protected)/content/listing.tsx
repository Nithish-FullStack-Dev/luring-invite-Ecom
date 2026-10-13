"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { cmsRequest } from "@/lib/cms/client";
import type { ContentList } from "@/lib/cms/contracts";
export default function Listing({ q, status }: { q: string; status?: string }) {
  const [result, setResult] = useState<ContentList | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    const query = new URLSearchParams({ q, ...(status ? { status } : {}) });
    cmsRequest<ContentList>("/api/content?" + query)
      .then((value) => {
        if (active) setResult(value);
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
  }, [q, status]);
  if (error)
    return (
      <p className="cms-error" role="alert">
        {error}
      </p>
    );
  if (!result)
    return (
      <p className="cms-card" aria-busy="true">
        Loading content…
      </p>
    );
  const { entries, missing } = result;
  return (
    <>
      <h1>Website content</h1>
      <p className="cms-muted">
        Five editable sections, using your existing website copy.
      </p>
      {missing.length > 0 && (
        <div className="cms-card">
          <h2>Create a section</h2>
          <div className="cms-actions">
            {missing.map((key) => (
              <Link
                className="cms-button"
                href={"/admin/content/new?key=" + key}
                key={key}
              >
                + {key}
              </Link>
            ))}
          </div>
        </div>
      )}
      <form className="cms-filters">
        <label>
          Search
          <input name="q" defaultValue={q} placeholder="Search titles" />
        </label>
        <label>
          Status
          <select name="status" defaultValue={status ?? ""}>
            <option value="">All statuses</option>
            <option>DRAFT</option>
            <option>PUBLISHED</option>
          </select>
        </label>
        <button>Filter</button>
      </form>
      <div className="cms-card" style={{ overflowX: "auto" }}>
        {entries.length ? (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Section</th>
                <th>Status</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td>
                    <Link href={"/admin/content/" + entry.id}>
                      {entry.title} →
                    </Link>
                  </td>
                  <td>{entry.key}</td>
                  <td>
                    <span className="cms-badge">{entry.status}</span>
                  </td>
                  <td>{entry.updatedAt.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>
            No content matches. Create a section above or clear your filters.
          </p>
        )}
      </div>
    </>
  );
}
