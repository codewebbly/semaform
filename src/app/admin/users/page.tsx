import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import { SuspendButton } from "@/components/admin/SuspendButton";

const GridIcon = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="5" height="5" rx="1" /><rect x="9" y="2" width="5" height="5" rx="1" />
    <rect x="2" y="9" width="5" height="5" rx="1" /><rect x="9" y="9" width="5" height="5" rx="1" />
  </svg>
);
const UsersIcon = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="5" r="2.5" />
    <path d="M1 13.5a5 5 0 0 1 10 0" />
    <circle cx="12.5" cy="5.5" r="2" />
    <path d="M15 13.5a3 3 0 0 0-5-2.1" />
  </svg>
);
const DocIcon = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 1.5H4.5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V5.5L10 1.5z" />
    <path d="M10 1.5v4h3.5M6 9h4M6 11.5h2.5" />
  </svg>
);
const InboxIcon = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1.5 9.5h3.5l1 2h4l1-2h3.5" /><rect x="1.5" y="2.5" width="13" height="10" rx="1" />
  </svg>
);
const FileIcon = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 1.5H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5.5L9.5 1.5z" />
    <path d="M9.5 1.5V5.5H13.5" />
  </svg>
);
const StarIcon = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 1.5l1.8 3.6 4 .6-2.9 2.8.7 4L8 10.6l-3.6 1.9.7-4-2.9-2.8 4-.6L8 1.5z" />
  </svg>
);

const ADMIN_NAV = [
  { href: "/admin/dashboard",    label: "Dashboard",    icon: GridIcon,  exact: true },
  { href: "/admin/users",        label: "Users",        icon: UsersIcon               },
  { href: "/admin/rfps",         label: "All RFPs",     icon: DocIcon,   exact: true },
  { href: "/admin/rfps/queue",   label: "Import Queue", icon: InboxIcon               },
  { href: "/admin/applications", label: "Applications", icon: FileIcon                },
  { href: "/admin/matches",      label: "Matches",      icon: StarIcon                },
];

const ROLE_STYLE: Record<string, { label: string; cls: string }> = {
  ADMIN:     { label: "Admin",     cls: "bg-[#FAF5FF] text-[#7C3AED]" },
  DONOR:     { label: "Donor",     cls: "bg-[#EEF4FF] text-[#1A6BFF]" },
  NONPROFIT: { label: "Nonprofit", cls: "bg-[#F0FDF4] text-[#16A34A]" },
};

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/auth/login");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      donorProfile:     { select: { orgName: true } },
      nonprofitProfile: { select: { orgName: true } },
    },
  });

  return (
    <div className="flex min-h-screen bg-[#F8F8F7]">
      <Sidebar navItems={ADMIN_NAV} role="Admin" userEmail={session.user.email!} />

      <div className="flex-1 md:ml-[240px] pt-12 md:pt-0">
        <main className="max-w-5xl mx-auto px-6 py-8">

          <div className="flex items-start justify-between mb-6">
            <div>
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center gap-1 text-sm text-[#6B6A66] hover:text-[#1A1A18] transition-colors mb-2"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 3L5 8l5 5" />
                </svg>
                Dashboard
              </Link>
              <h1 className="text-xl font-semibold text-[#1A1A18]">User Management</h1>
              <p className="text-sm text-[#6B6A66] mt-1">
                {users.length} registered {users.length === 1 ? "user" : "users"}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-[8px] border border-[#E5E4E0] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#F1F0ED]">
                    <th className="px-5 py-3 text-left text-xs font-medium text-[#9B9A96] tracking-wide">User</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-[#9B9A96] tracking-wide">Role</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-[#9B9A96] tracking-wide hidden sm:table-cell">Joined</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-[#9B9A96] tracking-wide">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-[#9B9A96] tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F0ED]">
                  {users.map((user) => {
                    const orgName = user.donorProfile?.orgName ?? user.nonprofitProfile?.orgName;
                    const isSelf = user.id === session.user.id;
                    const roleInfo = ROLE_STYLE[user.role] ?? { label: user.role, cls: "bg-[#F1F0ED] text-[#6B6A66]" };
                    return (
                      <tr key={user.id} className="hover:bg-[#F8F8F7]/60 transition-colors">
                        <td className="px-5 py-3.5">
                          <p className="font-medium text-[#1A1A18]">{orgName ?? "—"}</p>
                          <p className="text-xs text-[#9B9A96]">{user.email}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${roleInfo.cls}`}>
                            {roleInfo.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-[#9B9A96] hidden sm:table-cell">
                          {new Date(user.createdAt).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric",
                          })}
                        </td>
                        <td className="px-5 py-3.5">
                          {user.suspended ? (
                            <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#FEF2F2] text-[#DC2626]">
                              Suspended
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F0FDF4] text-[#16A34A]">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          {isSelf ? (
                            <span className="text-xs text-[#9B9A96]">You</span>
                          ) : (
                            <SuspendButton userId={user.id} suspended={user.suspended} />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
