"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CalendarPlus, Inbox, LayoutDashboard, ListChecks, LogOut, Users } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const employeeNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/apply", label: "Apply for leave", icon: CalendarPlus },
  { href: "/my-leaves", label: "My requests", icon: ListChecks },
];
const adminNav = [
  { href: "/admin/requests", label: "Leave requests", icon: Inbox },
  { href: "/admin/employees", label: "Employees", icon: Users },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const { session, ready, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const onAdminPath = pathname.startsWith("/admin");

  useEffect(() => {
    if (!ready) return;
    if (!session) router.replace("/login");
    else if (onAdminPath && session.role !== "ADMIN") router.replace("/dashboard");
    else if (!onAdminPath && session.role === "ADMIN") router.replace("/admin/requests");
  }, [ready, session, onAdminPath, router]);

  if (!ready || !session) {
    return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Loading…</div>;
  }

  const nav = session.role === "ADMIN" ? adminNav : employeeNav;
  const signOut = () => {
    logout();
    router.replace("/login");
  };

  return (
    <>
      <aside className="flex flex-col bg-sidebar text-sidebar-foreground md:fixed md:inset-y-0 md:w-60">
        <div className="flex items-center justify-between px-5 py-4 md:py-6">
          <span className="font-heading text-lg font-bold text-white">ELS</span>
          <button onClick={signOut} aria-label="Sign out" className="rounded-md p-2 hover:bg-white/10 md:hidden">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-0">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10",
                  active && "bg-white/15 text-white"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto hidden border-t border-white/10 p-4 md:block">
          <p className="truncate text-sm font-semibold text-white">{session.name}</p>
          <p className="mb-3 text-xs text-sidebar-foreground/70">
            {session.role === "ADMIN" ? "Administrator" : "Employee"}
          </p>
          <button onClick={signOut} className="flex items-center gap-2 text-sm hover:text-white">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>
      <main className="md:pl-60">
        <div className="mx-auto max-w-5xl px-5 py-8">{children}</div>
      </main>
    </>
  );
}
