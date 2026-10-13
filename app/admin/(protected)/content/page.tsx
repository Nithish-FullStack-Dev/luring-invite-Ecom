export const instant = false;
import { requireAdmin } from "@/lib/cms/auth";
import Listing from "./listing";
export default async function Content({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  await requireAdmin();
  const query = await searchParams;
  const q = typeof query.q === "string" ? query.q.slice(0, 200) : "";
  const status =
    query.status === "PUBLISHED" || query.status === "DRAFT"
      ? query.status
      : undefined;
  return <Listing key={q + ":" + status} q={q} status={status} />;
}
