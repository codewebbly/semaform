"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

export interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
}

interface SidebarProps {
  navItems: NavItem[];
  role: string;
  userEmail: string;
}

const ROLE_PILL: Record<string, string> = {
  Donor:     "bg-[#EEF4FF] text-[#1A6BFF]",
  Nonprofit: "bg-[#F0FDF4] text-[#16A34A]",
  Admin:     "bg-[#FAF5FF] text-[#7C3AED]",
};

function BrandMark({ size = "md" }: { size?: "sm" | "md" }) {
  const dim = size === "sm" ? 20 : 24;
  const svg = size === "sm" ? 10 : 12;
  return (
    <div
      style={{ width: dim, height: dim }}
      className="rounded-[5px] bg-[#1A6BFF] flex items-center justify-center shrink-0"
    >
      <svg width={svg} height={svg} viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <circle cx="4" cy="7" r="2" fill="white" />
        <circle cx="10" cy="7" r="2" fill="white" />
        <line x1="6" y1="7" x2="8" y2="7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function SidebarInner({
  navItems,
  role,
  userEmail,
  isActive,
}: {
  navItems: NavItem[];
  role: string;
  userEmail: string;
  isActive: (href: string, exact?: boolean) => boolean;
}) {
  return (
    <>
      {/* Brand */}
      <div className="px-5 pt-5 pb-4 border-b border-[#E5E4E0]">
        <div className="flex items-center gap-2">
          <BrandMark />
          <span className="text-xs font-semibold text-[#1A1A18] tracking-tight leading-snug">
            Handshake Impact Engine
          </span>
        </div>
        <div className="mt-3">
          <span
            className={cn(
              "inline-flex text-[11px] font-medium px-2 py-0.5 rounded-full",
              ROLE_PILL[role] ?? "bg-[#F1F0ED] text-[#6B6A66]"
            )}
          >
            {role}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-sm transition-colors",
              isActive(item.href, item.exact)
                ? "bg-[#F1F0ED] text-[#1A1A18] font-medium"
                : "text-[#6B6A66] hover:bg-[#F8F8F7] hover:text-[#1A1A18]"
            )}
          >
            <span className="shrink-0 opacity-75">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-[#E5E4E0]">
        <p className="text-xs text-[#9B9A96] truncate mb-2.5">{userEmail}</p>
        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="text-xs text-[#6B6A66] hover:text-[#1A1A18] transition-colors"
        >
          Sign out
        </button>
      </div>
    </>
  );
}

export function Sidebar({ navItems, role, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  const innerProps = { navItems, role, userEmail, isActive };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 w-[240px] bg-white border-r border-[#E5E4E0] z-30">
        <SidebarInner {...innerProps} />
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 inset-x-0 h-12 bg-white border-b border-[#E5E4E0] flex items-center px-4 gap-3 z-30">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1 -ml-1 text-[#6B6A66] hover:text-[#1A1A18] transition-colors"
          aria-label="Open navigation"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <path d="M2 4h12M2 8h12M2 12h12" />
          </svg>
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <BrandMark size="sm" />
          <span className="text-xs font-semibold text-[#1A1A18] truncate">
            Handshake Impact Engine
          </span>
        </div>
        <span
          className={cn(
            "text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0",
            ROLE_PILL[role] ?? "bg-[#F1F0ED] text-[#6B6A66]"
          )}
        >
          {role}
        </span>
      </header>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-[240px] bg-white border-r border-[#E5E4E0] flex flex-col">
            <SidebarInner {...innerProps} />
          </aside>
        </div>
      )}
    </>
  );
}
