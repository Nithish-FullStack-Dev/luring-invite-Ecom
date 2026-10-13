import { getPublishedContent } from "@/lib/cms/public";
import { PublicContentProvider } from "./PublicContentProvider";
export default async function PublishedContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = await getPublishedContent();
  return (
    <PublicContentProvider content={content}>{children}</PublicContentProvider>
  );
}
