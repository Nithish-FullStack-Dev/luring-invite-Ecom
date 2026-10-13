// app\admin\(protected)\dashboard\page.tsx
export const instant = false;
import Link from "next/link";
import { requireAdmin } from "@/lib/cms/auth";
import { prisma } from "@/lib/prisma";
import Logout from "../../logout";
export default async function Dashboard() {
  const admin = await requireAdmin();
  const [all, published, sessions] = await Promise.all([
    prisma.cmsContent.count(),
    prisma.cmsContent.count({ where: { status: "PUBLISHED" } }),
    prisma.cmsSession.count({
      where: { adminId: admin.id, expiresAt: { gt: new Date() } },
    }),
  ]);
  return (
    <>
      <p className="cms-muted">WEBSITE ADMINISTRATION</p>
      <h1>Your content, in one place</h1>
      <p className="cms-muted">Keep your invitations website up to date.</p>
      <div className="cms-grid">
        {[
          ["Content entries", all],
          ["Published", published],
          ["Drafts", all - published],
        ].map(([label, number]) => (
          <div className="cms-card" key={label}>
            <p>{label}</p>
            <div className="cms-stat">{number}</div>
          </div>
        ))}
      </div>
      <div className="cms-card">
        <h2>Manage your website</h2>
        <p>
          Edit the hero, About section, contact details, navigation and footer.
          Drafts stay private; publishing makes your changes visible.
        </p>
        <Link className="cms-button cms-primary" href="/admin/content">
          Open content manager
        </Link>
      </div>
      <div className="cms-card">
        <h2>Account security</h2>
        <p>{sessions} active session(s). Sessions expire after eight hours.</p>
        <Logout all />
      </div>
    </>
  );
}
