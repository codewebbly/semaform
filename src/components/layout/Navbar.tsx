"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";

interface NavbarProps {
  userEmail?: string;
  role?: string;
  profileHref?: string;
}

const roleBadgeColor: Record<string, string> = {
  Donor: "bg-sky-100 text-sky-700",
  Nonprofit: "bg-emerald-100 text-emerald-700",
  Admin: "bg-purple-100 text-purple-700",
};

export function Navbar({ userEmail, role, profileHref }: NavbarProps) {
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-lg font-bold text-sky-600 tracking-tight">
              Handshake Impact Engine
            </Link>
            {role && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBadgeColor[role] ?? "bg-gray-100 text-gray-600"}`}>
                {role}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {userEmail && (
              <span className="hidden sm:block text-sm text-gray-500 truncate max-w-[180px]">{userEmail}</span>
            )}
            {profileHref && (
              <Link href={profileHref} className="text-sm text-gray-600 hover:text-gray-900">
                Profile
              </Link>
            )}
            <Button variant="secondary" size="sm" onClick={() => signOut({ callbackUrl: "/auth/login" })}>
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
