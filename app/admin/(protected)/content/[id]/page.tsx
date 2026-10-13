// Authentication is checked on every request, without session-derived prefetch caching.
export const instant = false;
import { notFound } from "next/navigation";
import Link from "next/link";
import ExistingEditor from "./existing";
import { z } from "zod";
import { requireAdmin } from "@/lib/cms/auth";
import { defaults } from "@/data/cms";
import { keySchema } from "@/lib/cms/schema";
import Editor from "./editor";
export default async function Edit({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ key?: string; saved?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const query = await searchParams;
  if (id !== "new") {
    if (!z.string().cuid().safeParse(id).success) notFound();
    return <ExistingEditor key={id} id={id} saved={query.saved === "1"} />;
  }
  const key = keySchema.safeParse(query.key);
  if (!key.success) notFound();
  return (
    <>
      <Link href="/admin/content">← All content</Link>
      <h1>Create {key.data}</h1>
      <p className="cms-muted">
        Text is rendered safely. Use relative paths or HTTPS URLs for links.
      </p>
      <Editor
        key={key.data}
        entry={{
          title: key.data[0].toUpperCase() + key.data.slice(1),
          key: key.data,
          version: 0,
          content: defaults[key.data],
          status: "DRAFT",
        }}
      />
    </>
  );
}
