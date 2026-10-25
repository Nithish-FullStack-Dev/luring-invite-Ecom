"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  ArrowUpRight,
  FileText,
  LayoutDashboard,
  Sparkles,
  UserRound,
  ChevronDown,
  LogOut,
  ShieldCheck,
} from "lucide-react";

import Logout from "../logout";
import SessionLabel from "../session-label";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/component/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/component/ui/dropdown-menu";

interface AdminSidebarProps {
  children: ReactNode;
  adminEmail: string;
}

const navigation = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Website Content",
    href: "/admin/content",
    icon: FileText,
  },
  {
    title: "Customize Templates",
    href: "/admin/customize",
    icon: Sparkles,
  },
];

function AdminSidebarNavigation() {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  const isActive = (href: string) =>
    href === "/admin/dashboard"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  const handleNavigation = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <SidebarContent className="px-2 py-4">
      <SidebarGroup>
        <SidebarGroupLabel className="px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Workspace
        </SidebarGroupLabel>

        <SidebarMenu className="mt-2 gap-1.5">
          {navigation.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  render={<Link href={item.href} onClick={handleNavigation} />}
                  isActive={active}
                  tooltip={item.title}
                  className={`h-11 rounded-xl px-3 transition-all duration-200 ${
                    active
                      ? "!bg-[#A86DCD] !text-white font-semibold shadow-md shadow-[#A86DCD]/25 hover:!bg-[#9657BE] [&_svg]:!text-white"
                      : "text-muted-foreground hover:bg-[#A86DCD]/10 hover:text-[#8F4CB5]"
                  }`}
                >
                  <Icon className="size-[18px] shrink-0" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>

        <SidebarGroupLabel className="mt-7 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Shortcuts
        </SidebarGroupLabel>

        <SidebarMenu className="mt-2">
          <SidebarMenuItem>
            <SidebarMenuButton
              render={
                <Link
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleNavigation}
                />
              }
              tooltip="View website"
              className="h-11 rounded-xl px-3 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <ArrowUpRight className="size-[18px] shrink-0" />
              <span>View website</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
  );
}

function AdminSidebarBrand() {
  return (
    <Link
      href="/admin/dashboard"
      className="flex min-w-0 items-center gap-3 rounded-xl px-2 py-2"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <Sparkles className="size-5" />
      </div>

      <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
        <p className="truncate text-sm font-bold tracking-tight">
          Luring Invite
        </p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          Content Studio
        </p>
      </div>
    </Link>
  );
}

function AdminTopbarAccount({ adminEmail }: { adminEmail: string }) {
  const initials =
    adminEmail
      .split("@")[0]
      .split(/[._-]/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("") || "AD";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label="Open administrator account menu"
            className="group flex items-center gap-2 rounded-xl border border-border/80 bg-background px-2 py-1.5 text-left shadow-sm transition-all hover:bg-accent hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:gap-3 sm:px-3"
          />
        }
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary ring-1 ring-primary/10">
          {initials}
        </div>

        <div className="hidden min-w-0 text-left sm:block">
          <p className="text-xs font-semibold leading-5">Administrator</p>
          <p className="max-w-[180px] truncate text-[11px] leading-4 text-muted-foreground">
            {adminEmail}
          </p>
        </div>

        <ChevronDown className="hidden size-4 text-muted-foreground transition-transform group-data-[popup-open]:rotate-180 sm:block" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="bottom"
        align="end"
        sideOffset={10}
        className="w-72 rounded-xl border-border/80 p-2 shadow-xl"
      >
        <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Administrator</p>
            <p className="truncate text-xs text-muted-foreground">
              {adminEmail}
            </p>
          </div>

          <ShieldCheck className="size-4 shrink-0 text-primary" />
        </div>

        <DropdownMenuSeparator className="my-2" />

        <DropdownMenuItem
          render={<Link href="/admin/dashboard" />}
          className="cursor-pointer rounded-lg py-2.5"
        >
          <LayoutDashboard className="mr-2 size-4" />
          Dashboard
        </DropdownMenuItem>

        <DropdownMenuItem
          onSelect={() => {
            window.open("/", "_blank", "noopener,noreferrer");
          }}
          className="cursor-pointer rounded-lg py-2.5"
        >
          <ArrowUpRight className="mr-2 size-4" />
          View website
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-2" />

        <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted-foreground">
          <UserRound className="size-3.5" />
          Signed in as administrator
        </div>

        <div className="mt-1 flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-destructive/5">
          <LogOut className="size-4 shrink-0 text-destructive" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-destructive">Sign out</p>
          </div>
          <div className="shrink-0">
            <Logout />
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function AdminSidebar({
  children,
  adminEmail,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const pageTitle = pathname.startsWith("/admin/customize")
    ? "Customize Templates"
    : pathname.startsWith("/admin/content")
      ? "Website Content"
      : pathname.startsWith("/admin/dashboard")
        ? "Dashboard"
        : "Admin Workspace";

  const pageDescription = pathname.startsWith("/admin/customize")
    ? "Manage your invitation templates"
    : pathname.startsWith("/admin/content")
      ? "Manage your website content"
      : pathname.startsWith("/admin/dashboard")
        ? "Overview of your workspace"
        : "Manage your workspace";

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" variant="sidebar">
        <SidebarHeader className="border-b border-sidebar-border px-2 py-3">
          <AdminSidebarBrand />
        </SidebarHeader>

        <AdminSidebarNavigation />

        <SidebarFooter className="border-t border-sidebar-border p-3">
          <div className="group-data-[collapsible=icon]:hidden">
            <SessionLabel email={adminEmail} />
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-40 flex h-[68px] shrink-0 items-center gap-3 border-b border-border/70 bg-background/85 px-3 backdrop-blur-xl sm:px-5 md:px-7">
          <SidebarTrigger className="size-9 shrink-0 rounded-xl border border-border/70 bg-background shadow-sm transition-colors hover:bg-accent" />

          <div className="h-7 w-px shrink-0 bg-border/80" />

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-bold tracking-tight">
              {pageTitle}
            </h1>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-border/70 bg-muted/40 px-3 py-1.5 lg:flex">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-muted-foreground">
              Admin workspace
            </span>
          </div>

          <div className="mx-1 hidden h-7 w-px bg-border/80 sm:block" />

          <AdminTopbarAccount adminEmail={adminEmail} />
        </header>

        <main className="min-w-0 flex-1 p-4 sm:p-5 md:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
