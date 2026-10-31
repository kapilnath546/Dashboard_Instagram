"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  User,
  ExternalLink,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/profile", label: "Profile & About", icon: User },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  const navContent = (
    <div className="flex flex-col h-full justify-between p-6 bg-[#1A1A1A] text-white select-none">
      <div className="flex flex-col gap-8">
        {/* Brand header */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-2xl font-bold tracking-tight text-white">
              Manish.
            </span>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-neutral-400">
              ADMIN
            </span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-neutral-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex flex-col gap-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-[#2D2D2D] text-white shadow-sm font-semibold"
                    : "text-neutral-400 hover:text-neutral-200 hover:bg-[#242424]",
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-accent" : "text-neutral-400")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom actions */}
      <div className="flex flex-col gap-2 pt-6 border-t border-neutral-800 text-sm">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2.5 px-4 py-2 text-neutral-400 hover:text-white hover:bg-[#242424] rounded-lg transition-colors"
        >
          <ExternalLink className="w-4 h-4 text-neutral-400" />
          View live site
        </Link>
        <button
          onClick={handleSignOut}
          disabled={loggingOut}
          className="flex items-center gap-2.5 px-4 py-2 text-neutral-400 hover:text-red-400 hover:bg-[#242424] rounded-lg transition-colors text-left"
        >
          <LogOut className="w-4 h-4" />
          {loggingOut ? "Signing out..." : "Sign out"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#1A1A1A] text-white border-b border-neutral-800">
        <div className="flex items-baseline gap-2">
          <span className="font-heading text-xl font-bold">Manish.</span>
          <span className="text-[10px] font-semibold uppercase text-neutral-400">ADMIN</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1.5 text-neutral-300 hover:text-white rounded-md bg-[#2D2D2D]"
          aria-label="Toggle admin navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile slide-over drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {navContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 h-screen sticky top-0 shadow-lg border-r border-neutral-900">
        {navContent}
      </aside>
    </>
  );
}
