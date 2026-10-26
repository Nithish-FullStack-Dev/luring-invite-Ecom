import { Suspense } from "react";
import PublishedContent from "@/component/cms/PublishedContent";
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div aria-busy="true" className="min-h-screen" />}>
      <PublishedContent>{children}</PublishedContent>
    </Suspense>
  );
}
