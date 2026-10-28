import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  FileText,
  FolderOpen,
  Layers3,
  Music2,
  ShieldCheck,
  Video,
  XCircle,
} from "lucide-react";

import { requireAdmin } from "@/lib/cms/auth";
import { prisma } from "@/lib/prisma";
import Logout from "../../logout";

export const instant = false;

const numberFormatter = new Intl.NumberFormat("en-IN");

function formatNumber(value: number) {
  return numberFormatter.format(value);
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

const statusStyles: Record<string, string> = {
  PUBLISHED: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  DRAFT: "bg-amber-50 text-amber-700 ring-amber-600/15",
  PENDING: "bg-amber-50 text-amber-700 ring-amber-600/15",
  PROCESSING: "bg-blue-50 text-blue-700 ring-blue-600/15",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  FAILED: "bg-red-50 text-red-700 ring-red-600/15",
};

function StatusBadge({ status }: { status: string }) {
  const styles =
    statusStyles[status] ?? "bg-gray-50 text-gray-600 ring-gray-200";

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${styles}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

type StatCardProps = {
  label: string;
  value: number;
  description: string;
  icon: typeof FileText;
  iconClass: string;
  href?: string;
};

function StatCard({
  label,
  value,
  description,
  icon: Icon,
  iconClass,
  href,
}: StatCardProps) {
  const content = (
    <div className="group flex h-full min-w-0 flex-col justify-between gap-4 rounded-2xl border border-[#ece5f0] bg-white p-4 transition-all duration-200 hover:border-[#d6b9e6] hover:shadow-[0_8px_28px_rgba(75,40,95,0.07)] sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-[#796c83] sm:text-sm">
            {label}
          </p>

          <p className="mt-2 text-2xl font-semibold tracking-tight text-[#281e30] sm:mt-3 sm:text-3xl">
            {formatNumber(value)}
          </p>
        </div>

        <span
          className={`grid size-9 shrink-0 place-items-center rounded-xl sm:size-10 ${iconClass}`}
        >
          <Icon className="size-[18px]" aria-hidden="true" />
        </span>
      </div>

      <div className="flex min-w-0 items-end justify-between gap-2">
        <p className="min-w-0 text-[11px] leading-5 text-[#93879d] sm:text-xs">
          {description}
        </p>

        {href && (
          <ArrowUpRight
            className="size-4 shrink-0 text-[#a86dcd] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );

  if (!href) return content;

  return (
    <Link
      href={href}
      className="block h-full min-w-0 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a86dcd]"
    >
      {content}
    </Link>
  );
}

function PanelHeading({
  icon: Icon,
  title,
  description,
  iconClass = "bg-[#f5eff9] text-[#9257b7]",
}: {
  icon: typeof Activity;
  title: string;
  description: string;
  iconClass?: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span
        className={`grid size-10 shrink-0 place-items-center rounded-xl ${iconClass}`}
      >
        <Icon className="size-[18px]" aria-hidden="true" />
      </span>

      <div className="min-w-0">
        <h2 className="text-sm font-semibold tracking-tight text-[#281e30] sm:text-base">
          {title}
        </h2>
        <p className="mt-1 text-xs leading-5 text-[#93879d]">{description}</p>
      </div>
    </div>
  );
}

export default async function Dashboard() {
  const admin = await requireAdmin();

  const [
    totalContent,
    publishedContent,
    draftContent,
    totalTemplates,
    activeTemplates,
    inactiveTemplates,
    totalJobs,
    pendingJobs,
    processingJobs,
    completedJobs,
    failedJobs,
    totalMusic,
    enabledMusic,
    categoryCount,
    activeSessions,
    recentJobs,
  ] = await Promise.all([
    prisma.cmsContent.count(),
    prisma.cmsContent.count({ where: { status: "PUBLISHED" } }),
    prisma.cmsContent.count({ where: { status: "DRAFT" } }),

    prisma.template.count(),
    prisma.template.count({ where: { active: true } }),
    prisma.template.count({ where: { active: false } }),

    prisma.videoJob.count(),
    prisma.videoJob.count({ where: { status: "PENDING" } }),
    prisma.videoJob.count({ where: { status: "PROCESSING" } }),
    prisma.videoJob.count({ where: { status: "COMPLETED" } }),
    prisma.videoJob.count({ where: { status: "FAILED" } }),

    prisma.musicTrack.count(),
    prisma.musicTrack.count({ where: { enabled: true } }),
    prisma.category.count(),

    prisma.cmsSession.count({
      where: {
        adminId: admin.id,
        expiresAt: { gt: new Date() },
      },
    }),

    prisma.videoJob.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        status: true,
        createdAt: true,
        template: {
          select: { title: true },
        },
      },
    }),
  ]);

  const publishedPercentage =
    totalContent > 0 ? Math.round((publishedContent / totalContent) * 100) : 0;

  const stats: StatCardProps[] = [
    {
      label: "Total content",
      value: totalContent,
      description: "Website content entries",
      icon: FileText,
      iconClass: "bg-purple-50 text-purple-700",
      href: "/admin/content",
    },
    {
      label: "Published",
      value: publishedContent,
      description: `${publishedPercentage}% of all content`,
      icon: CheckCircle2,
      iconClass: "bg-emerald-50 text-emerald-700",
      href: "/admin/content",
    },
    {
      label: "Drafts",
      value: draftContent,
      description: "Awaiting publication",
      icon: Clock3,
      iconClass: "bg-amber-50 text-amber-700",
      href: "/admin/content",
    },
    {
      label: "Templates",
      value: totalTemplates,
      description: `${activeTemplates} active · ${inactiveTemplates} inactive`,
      icon: Layers3,
      iconClass: "bg-blue-50 text-blue-700",
      href: "/admin/templates",
    },
    {
      label: "Video jobs",
      value: totalJobs,
      description: `${pendingJobs} pending · ${processingJobs} processing`,
      icon: Video,
      iconClass: "bg-indigo-50 text-indigo-700",
    },
    {
      label: "Music tracks",
      value: totalMusic,
      description: `${enabledMusic} enabled tracks`,
      icon: Music2,
      iconClass: "bg-pink-50 text-pink-700",
    },
  ];

  const jobMetrics = [
    {
      label: "Pending",
      value: pendingJobs,
      color: "bg-amber-50 text-amber-900",
      labelColor: "text-amber-800",
    },
    {
      label: "Processing",
      value: processingJobs,
      color: "bg-blue-50 text-blue-900",
      labelColor: "text-blue-800",
    },
    {
      label: "Completed",
      value: completedJobs,
      color: "bg-emerald-50 text-emerald-900",
      labelColor: "text-emerald-800",
    },
    {
      label: "Failed",
      value: failedJobs,
      color: "bg-red-50 text-red-900",
      labelColor: "text-red-800",
    },
  ];

  return (
    <main className="mx-auto w-full max-w-[1600px] min-w-0 space-y-6 pb-6 sm:space-y-8 sm:pb-8">
      {/* Page heading */}
      <header className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9a61bb] sm:text-xs">
            <span className="size-1.5 rounded-full bg-[#a86dcd]" />
            Website administration
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-[#281e30] sm:text-3xl">
            Dashboard
          </h1>

          <p className="mt-1.5 max-w-xl text-xs leading-5 text-[#817487] sm:text-sm sm:leading-6">
            Monitor your content, templates, and video generation activity.
          </p>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          Database connected
        </div>
      </header>

      {/* Statistics */}
      <section aria-labelledby="overview-heading">
        <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
          <h2
            id="overview-heading"
            className="text-sm font-semibold text-[#34283c]"
          >
            Overview
          </h2>

          <span className="text-[10px] text-[#94899c] sm:text-xs">
            Database counts
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </section>

      {/* Aligned dashboard panels */}
      <section
        aria-label="System and video generation"
        className="grid min-w-0 grid-cols-1 items-start gap-4 lg:gap-5 xl:grid-cols-3"
      >
        {/* System overview */}
        <article className="min-w-0 rounded-2xl border border-[#ece5f0] bg-white p-4 shadow-sm shadow-[#281e30]/[0.02] sm:p-5 xl:col-span-1">
          <PanelHeading
            icon={Activity}
            title="System overview"
            description="Current database records"
          />

          <div className="mt-4 divide-y divide-[#f0ebf3]">
            <div className="flex items-center justify-between gap-3 py-3">
              <span className="flex min-w-0 items-center gap-2 text-xs text-[#75697e] sm:text-sm">
                <FolderOpen className="size-4 shrink-0 text-[#a086b1]" />
                Categories
              </span>
              <span className="text-sm font-semibold tabular-nums text-[#34283c]">
                {formatNumber(categoryCount)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 py-3">
              <span className="flex min-w-0 items-center gap-2 text-xs text-[#75697e] sm:text-sm">
                <Music2 className="size-4 shrink-0 text-[#a086b1]" />
                Enabled music
              </span>
              <span className="text-sm font-semibold tabular-nums text-[#34283c]">
                {formatNumber(enabledMusic)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 py-3">
              <span className="flex min-w-0 items-center gap-2 text-xs text-[#75697e] sm:text-sm">
                <ShieldCheck className="size-4 shrink-0 text-[#a086b1]" />
                Active sessions
              </span>
              <span className="text-sm font-semibold tabular-nums text-[#34283c]">
                {formatNumber(activeSessions)}
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-start gap-2 rounded-xl border border-emerald-100/80 bg-emerald-50/70 px-3 py-3 text-xs leading-5 text-emerald-800">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            <span>Dashboard data loaded successfully.</span>
          </div>
        </article>

        {/* Video generation */}
        <article className="min-w-0 overflow-hidden rounded-2xl border border-[#ece5f0] bg-white shadow-sm shadow-[#281e30]/[0.02] xl:col-span-2">
          <div className="border-b border-[#f0ebf3] p-4 sm:p-5">
            <PanelHeading
              icon={Video}
              title="Video generation"
              description="Latest jobs recorded in the database"
              iconClass="bg-indigo-50 text-indigo-700"
            />
          </div>

          {/* Job status summary */}
          <div className="grid grid-cols-2 gap-2.5 p-4 sm:grid-cols-4 sm:gap-3 sm:p-5">
            {jobMetrics.map((metric) => (
              <div
                key={metric.label}
                className={`min-w-0 rounded-xl p-3 sm:p-4 ${metric.color}`}
              >
                <p
                  className={`text-[11px] font-medium sm:text-xs ${metric.labelColor}`}
                >
                  {metric.label}
                </p>
                <p className="mt-1.5 text-xl font-semibold tabular-nums sm:text-2xl">
                  {formatNumber(metric.value)}
                </p>
              </div>
            ))}
          </div>

          {/* Recent jobs */}
          <div className="border-t border-[#f0ebf3]">
            <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
              <h3 className="text-xs font-semibold text-[#34283c] sm:text-sm">
                Recent jobs
              </h3>
              <span className="text-[10px] text-[#94899c] sm:text-xs">
                Latest 5
              </span>
            </div>

            {recentJobs.length === 0 ? (
              <div className="flex min-h-28 flex-col items-center justify-center px-4 py-8 text-center">
                <Video className="size-7 text-[#c2b3cd]" />
                <p className="mt-3 text-sm font-medium text-[#75697e]">
                  No video jobs yet
                </p>
                <p className="mt-1 text-xs text-[#a095a8]">
                  Generated video jobs will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#f3eef5]">
                {recentJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex min-w-0 items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-[#fcfaff] sm:px-5 sm:py-3.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-[#34283c] sm:text-sm">
                        {job.template.title}
                      </p>
                      <p className="mt-1 text-[10px] leading-4 text-[#918598] sm:text-xs">
                        {formatDate(job.createdAt)}
                      </p>
                    </div>

                    <StatusBadge status={job.status} />
                  </div>
                ))}
              </div>
            )}

            {failedJobs > 0 && (
              <div className="mx-4 mb-4 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50/80 p-3 text-xs leading-5 text-red-800 sm:mx-5 sm:mb-5">
                <XCircle className="mt-0.5 size-4 shrink-0" />
                <span>
                  {formatNumber(failedJobs)} video job(s) have failed. Review
                  their stored error details when troubleshooting.
                </span>
              </div>
            )}
          </div>
        </article>
      </section>

      {/* Account security */}
      <section
        aria-labelledby="security-heading"
        className="flex min-w-0 flex-col gap-4 rounded-2xl border border-[#ece5f0] bg-white p-4 shadow-sm shadow-[#281e30]/[0.02] sm:flex-row sm:items-center sm:justify-between sm:p-5"
      >
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#f5eff9] text-[#9257b7]">
            <ShieldCheck className="size-[18px]" aria-hidden="true" />
          </span>

          <div className="min-w-0">
            <h2
              id="security-heading"
              className="text-sm font-semibold text-[#34283c]"
            >
              Account security
            </h2>

            <p className="mt-1 text-xs leading-5 text-[#817487]">
              {formatNumber(activeSessions)} active session(s) for your account.
              Sessions expire after eight hours.
            </p>
          </div>
        </div>

        <div className="w-full shrink-0  sm:w-auto">
          <Logout all />
        </div>
      </section>
    </main>
  );
}
