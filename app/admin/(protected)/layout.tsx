// app\admin\(protected)\layout.tsx
import { requireAdmin } from "@/lib/cms/auth";
import AdminSidebar from "./admin-sidebar";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return <AdminSidebar adminEmail={admin.email}>{children}</AdminSidebar>;
}
