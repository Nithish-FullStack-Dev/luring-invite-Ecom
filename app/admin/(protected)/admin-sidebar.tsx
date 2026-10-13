// app\admin\(protected)\admin-sidebar.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  ArrowUpRight,
  FileText,
  LayoutDashboard,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  X,
} from "lucide-react";

import Logout from "../logout";
import SessionLabel from "../session-label";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/component/ui/dropdown-menu";

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

interface AdminSidebarProps {
  children: ReactNode;
  adminEmail: string;
}

export default function AdminSidebar({
  children,
  adminEmail,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const initials =
    adminEmail
      .split("@")[0]
      .split(/[._-]/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("") || "AD";

  const closeMobileMenu = useCallback(() => {
    setMobileOpen(false);
  }, []);

  useEffect(() => {
    closeMobileMenu();
  }, [pathname, closeMobileMenu]);

  useEffect(() => {
    if (!mobileOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMobileMenu();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [mobileOpen, closeMobileMenu]);

  const isActive = (href: string) =>
    href === "/admin/dashboard"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  const SidebarNavigation = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      <div className="px-4 pb-3 pt-7">
        {!collapsed || mobile ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Workspace
          </p>
        ) : (
          <div className="mx-auto h-px w-7 bg-border" />
        )}
      </div>

      <nav aria-label="Admin navigation" className="space-y-1 px-3">
        {navigation.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={!mobile && collapsed ? item.title : undefined}
              aria-current={active ? "page" : undefined}
              onClick={mobile ? closeMobileMenu : undefined}
              className={`group flex h-11 items-center gap-3 rounded-xl px-3 text-sm transition-all duration-200 ${
                active
                  ? "bg-primary font-semibold text-primary-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              } ${collapsed && !mobile ? "justify-center px-0" : ""}`}
            >
              <Icon
                className={`size-[18px] shrink-0 transition-transform duration-200 ${
                  active ? "" : "group-hover:scale-105"
                }`}
                strokeWidth={active ? 2.2 : 1.8}
              />

              {(!collapsed || mobile) && (
                <span className="min-w-0 flex-1 truncate">{item.title}</span>
              )}

              {active && (!collapsed || mobile) && (
                <span
                  aria-hidden="true"
                  className="size-1.5 shrink-0 rounded-full bg-primary-foreground/80"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-3 pb-5">
        <div className="mb-4 px-1 pt-6">
          {!collapsed || mobile ? (
            <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Shortcuts
            </p>
          ) : (
            <div className="mx-auto mb-3 h-px w-7 bg-border" />
          )}

          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title={!mobile && collapsed ? "View website" : undefined}
            onClick={mobile ? closeMobileMenu : undefined}
            className={`flex h-10 items-center gap-3 rounded-xl px-3 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
              collapsed && !mobile ? "justify-center px-0" : ""
            }`}
          >
            <ArrowUpRight className="size-[18px] shrink-0" />
            {(!collapsed || mobile) && <span>View website</span>}
          </Link>
        </div>
      </div>
    </>
  );

  const SidebarBrand = ({ mobile = false }: { mobile?: boolean }) => (
    <Link
      href="/admin/dashboard"
      onClick={mobile ? closeMobileMenu : undefined}
      className={`flex min-w-0 items-center gap-3 ${
        collapsed && !mobile ? "justify-center" : ""
      }`}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <Sparkles className="size-5" />
      </div>

      {(!collapsed || mobile) && (
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold tracking-tight">
            Luring Invite
          </p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            Content Studio
          </p>
        </div>
      )}
    </Link>
  );

  const SidebarAccount = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="border-t border-sidebar-border p-3">
      <DropdownMenu>
        <DropdownMenuContent
          align="end"
          side={mobile ? "bottom" : "top"}
          className="w-64"
        >
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => {
              window.open("/", "_blank", "noopener,noreferrer");
            }}
            className="cursor-pointer"
          >
            <ArrowUpRight className="mr-2 size-4" />
            View website
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => {
              window.location.href = "/admin/dashboard";
            }}
          >
            <LayoutDashboard className="mr-2 size-4" />
            Dashboard
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="mt-2">
        <Logout />
      </div>
    </div>
  );

  return (
    <div className="flex min-h-svh w-full min-w-0 bg-background text-foreground">
      {/* Desktop sidebar: takes up real layout space, never overlaps content. */}
      <aside
        className={`sticky top-0 hidden h-svh shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 md:flex ${
          collapsed ? "w-[76px]" : "w-[280px]"
        }`}
      >
        <div
          className={`flex h-[76px] shrink-0 items-center border-b border-sidebar-border px-4 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <SidebarBrand />
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <SidebarNavigation />
        </div>

        <SidebarAccount />
      </aside>

      {/* Mobile sidebar: overlay drawer, not a permanent column. */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            onClick={closeMobileMenu}
          />

          <aside
            id="mobile-admin-sidebar"
            aria-label="Mobile admin navigation"
            className="absolute inset-y-0 left-0 flex w-[min(300px,85vw)] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-2xl animate-in slide-in-from-left duration-200"
          >
            <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-sidebar-border px-4">
              <SidebarBrand mobile />

              <button
                type="button"
                aria-label="Close menu"
                onClick={closeMobileMenu}
                className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
              <SidebarNavigation mobile />
            </div>

            <SidebarAccount mobile />
          </aside>
        </div>
      )}

      {/* Main content always shrinks to the available width. */}
      <div className="flex min-h-svh min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-border/80 bg-background/90 px-3 backdrop-blur-xl sm:px-5 md:px-6">
          <button
            type="button"
            aria-label="Open navigation"
            aria-controls="mobile-admin-sidebar"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
            className="!flex md:!hidden size-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-accent"
          >
            <Menu className="size-5" />
          </button>
          <div className="hidden md:flex">
            <button
              type="button"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
              onClick={() => setCollapsed((previous) => !previous)}
              className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {collapsed ? (
                <PanelLeftOpen size={20} />
              ) : (
                <PanelLeftClose size={20} />
              )}
            </button>
          </div>
          <div className="h-5 w-px shrink-0 bg-border" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {pathname.startsWith("/admin/content")
                ? "Website Content"
                : "Dashboard"}
            </p>
          </div>
          <div className="hidden min-w-0 sm:block">
            <SessionLabel email={adminEmail} />
          </div>
        </header>

        <main className="min-w-0 flex-1 p-4 sm:p-5 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
