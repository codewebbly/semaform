import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/Sidebar";

// ─── nav ─────────────────────────────────────────────────────────────────────

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

// ─── helpers ─────────────────────────────────────────────────────────────────

function fmt(d: Date | string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/auth/login");

  const [userCount, rfpCount, applicationCount, matchCount, pendingImports] = await Promise.all([
    prisma.user.count(),
    prisma.rFP.count(),
    prisma.application.count(),
    prisma.matchScore.count(),
    prisma.rFP.count({ where: { sourceType: "IMPORTED", published: false } }),
  ]);

  const [recentApplications, recentRFPs] = await Promise.all([
    prisma.application.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        nonprofit: { select: { orgName: true } },
        rfp:       { select: { title: true } },
      },
    }),
    prisma.rFP.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { donor: { select: { orgName: true } } },
    }),
  ]);

  type ActivityItem = { date: Date; label: string; sub: string; type: "app" | "rfp" };
  const activity: ActivityItem[] = [
    ...recentApplications.map((a) => ({
      date:  a.createdAt,
      label: `${a.nonprofit.orgName} applied to "${a.rfp.title}"`,
      sub:   fmt(a.createdAt),
      type:  "app" as const,
    })),
    ...recentRFPs.map((r) => ({
      date:  r.createdAt,
      label: `${r.sourceType === "IMPORTED" ? "Admin imported" : (r.donor?.orgName ?? "Donor") + " posted"} "${r.title}"`,
      sub:   fmt(r.createdAt),
      type:  "rfp" as const,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 10);

  const stats = [
    { label: "Total Users",        value: userCount,        href: "/admin/users",        color: "#1A6BFF", bg: "#EEF4FF" },
    { label: "Total RFPs",         value: rfpCount,         href: "/admin/rfps",         color: "#7C3AED", bg: "#FAF5FF" },
    { label: "Applications",       value: applicationCount, href: "/admin/applications", color: "#D97706", bg: "#FFFBEB" },
    { label: "Matches Computed",   value: matchCount,       href: "/admin/matches",      color: "#16A34A", bg: "#F0FDF4" },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8F8F7]">
      <Sidebar navItems={ADMIN_NAV} role="Admin" userEmail={session.user.email!} />

      <div className="flex-1 md:ml-[240px] pt-12 md:pt-0">
        <main className="max-w-5xl mx-auto px-6 py-8">

          <div className="mb-6">
            <h1 className="text-xl font-semibold text-[#1A1A18]">Admin Dashboard</h1>
            <p className="text-sm text-[#6B6A66] mt-1">Platform overview for Handshake Impact Engine.</p>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((s) => (
              <Link
                key={s.label}
                href={s.href}
                className="bg-white rounded-[8px] border border-[#E5E4E0] p-5 hover:border-[#1A6BFF]/30 transition-colors"
              >
                <p className="text-xs font-medium text-[#9B9A96]">{s.label}</p>
                <p
                  className="text-[28px] font-semibold tabular-nums leading-none mt-2"
                  style={{ color: s.color }}
                >
                  {s.value}
                </p>
                <p className="text-xs mt-2" style={{ color: s.color }}>
                  View all →
                </p>
              </Link>
            ))}
          </div>

          {/* Two-column lower grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">

            {/* Quick actions */}
            <div className="bg-white rounded-[8px] border border-[#E5E4E0] p-5">
              <p className="text-[11px] font-semibold text-[#9B9A96] uppercase tracking-wider mb-4">
                Admin actions
              </p>
              <nav className="space-y-0.5">
                <Link
                  href="/admin/users"
                  className="flex items-center justify-between px-3 py-2.5 rounded-[6px] text-sm text-[#6B6A66] hover:bg-[#F8F8F7] hover:text-[#1A1A18] transition-colors"
                >
                  <span>User management</span>
                  <span className="text-[#9B9A96]">→</span>
                </Link>
                <Link
                  href="/admin/rfps/queue"
                  className="flex items-center justify-between px-3 py-2.5 rounded-[6px] text-sm text-[#6B6A66] hover:bg-[#F8F8F7] hover:text-[#1A1A18] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    Import queue
                    {pendingImports > 0 && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#FFFBEB] text-[#D97706]">
                        {pendingImports}
                      </span>
                    )}
                  </span>
                  <span className="text-[#9B9A96]">→</span>
                </Link>
              </nav>
            </div>

            {/* Activity log */}
            <div className="bg-white rounded-[8px] border border-[#E5E4E0] p-5">
              <p className="text-[11px] font-semibold text-[#9B9A96] uppercase tracking-wider mb-4">
                Recent activity
              </p>
              {activity.length === 0 ? (
                <p className="text-sm text-[#9B9A96]">No activity yet.</p>
              ) : (
                <ul className="space-y-3">
                  {activity.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span
                        className="mt-1.5 flex-shrink-0 h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: item.type === "app" ? "#1A6BFF" : "#7C3AED" }}
                      />
                      <div className="min-w-0">
                        <p className="text-[#1A1A18] truncate">{item.label}</p>
                        <p className="text-xs text-[#9B9A96]">{item.sub}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
