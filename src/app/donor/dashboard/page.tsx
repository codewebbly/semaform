import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/Button";

// ─── icons ──────────────────────────────────────────────────────────────────

const GridIcon = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="5" height="5" rx="1" />
    <rect x="9" y="2" width="5" height="5" rx="1" />
    <rect x="2" y="9" width="5" height="5" rx="1" />
    <rect x="9" y="9" width="5" height="5" rx="1" />
  </svg>
);
const PlusIcon = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M8 3v10M3 8h10" />
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
    <path d="M1.5 9.5h3.5l1 2h4l1-2h3.5" />
    <rect x="1.5" y="2.5" width="13" height="10" rx="1" />
  </svg>
);

const DONOR_NAV = [
  { href: "/donor/dashboard",   label: "Dashboard",    icon: GridIcon,  exact: true },
  { href: "/donor/rfps/new",    label: "Post RFP",     icon: PlusIcon,  exact: true },
  { href: "/donor/rfps",        label: "My RFPs",      icon: DocIcon,   exact: true },
  { href: "/donor/applications",label: "Applications", icon: InboxIcon               },
];

// ─── status badge ────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  SUBMITTED:    "bg-[#EEF4FF] text-[#1A6BFF]",
  UNDER_REVIEW: "bg-[#FFFBEB] text-[#D97706]",
  SHORTLISTED:  "bg-[#FAF5FF] text-[#7C3AED]",
  APPROVED:     "bg-[#F0FDF4] text-[#16A34A]",
  REJECTED:     "bg-[#FEF2F2] text-[#DC2626]",
  FUNDED:       "bg-[#ECFDF5] text-[#059669]",
};
const STATUS_LABELS: Record<string, string> = {
  SUBMITTED: "Submitted", UNDER_REVIEW: "Under Review",
  SHORTLISTED: "Shortlisted", APPROVED: "Approved",
  REJECTED: "Rejected", FUNDED: "Funded",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex text-[11px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[status] ?? "bg-[#F1F0ED] text-[#6B6A66]"}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

// ─── page ────────────────────────────────────────────────────────────────────

export default async function DonorDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "DONOR") redirect("/auth/login");

  const profile = await prisma.donorProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) redirect("/donor/profile");

  const [rfpCount, applicationCount, matchCount, recentApplications] = await Promise.all([
    prisma.rFP.count({ where: { donorId: profile.id } }),
    prisma.application.count({ where: { rfp: { donorId: profile.id } } }),
    prisma.matchScore.count({ where: { rfp: { donorId: profile.id } } }),
    prisma.application.findMany({
      where: { rfp: { donorId: profile.id } },
      include: {
        rfp:       { select: { title: true } },
        nonprofit: { select: { orgName: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  const stats = [
    { label: "Posted RFPs",        value: rfpCount,         href: "/donor/rfps" },
    { label: "Total Applications",  value: applicationCount, href: "/donor/applications" },
    { label: "Matches Computed",    value: matchCount,       href: "/donor/matches" },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8F8F7]">
      <Sidebar navItems={DONOR_NAV} role="Donor" userEmail={session.user.email!} />

      <div className="flex-1 md:ml-[240px] pt-12 md:pt-0">
        <main className="max-w-5xl mx-auto px-6 py-8">

          {/* Page header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-xl font-semibold text-[#1A1A18]">
                Welcome back, {profile.orgName}
              </h1>
              <p className="text-sm text-[#6B6A66] mt-1">
                Manage your RFPs and review incoming applications.
              </p>
            </div>
            <Link href="/donor/rfps/new">
              <Button size="sm">Post new RFP</Button>
            </Link>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {stats.map((s) => (
              <Link
                key={s.label}
                href={s.href}
                className="group block bg-white rounded-[8px] border border-[#E5E4E0] p-5 hover:border-[#1A6BFF]/40 transition-colors"
              >
                <p className="text-xs font-medium text-[#9B9A96] uppercase tracking-wide">
                  {s.label}
                </p>
                <p className="text-3xl font-semibold text-[#1A1A18] mt-2 tabular-nums">
                  {s.value}
                </p>
                <p className="text-xs text-[#1A6BFF] mt-2 group-hover:underline">
                  View all →
                </p>
              </Link>
            ))}
          </div>

          {/* Recent Applications */}
          <div className="bg-white rounded-[8px] border border-[#E5E4E0]">
            <div className="px-5 py-4 border-b border-[#E5E4E0] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#1A1A18]">Recent Applications</h2>
              <Link
                href="/donor/applications"
                className="text-xs text-[#1A6BFF] hover:underline"
              >
                View all
              </Link>
            </div>

            {recentApplications.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <p className="text-sm text-[#6B6A66]">No applications received yet.</p>
                <Link href="/donor/rfps/new" className="text-sm text-[#1A6BFF] hover:underline mt-1 inline-block">
                  Post your first RFP →
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#F1F0ED]">
                      <th className="px-5 py-3 text-left text-xs font-medium text-[#9B9A96] tracking-wide">Nonprofit</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-[#9B9A96] tracking-wide">RFP</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-[#9B9A96] tracking-wide hidden sm:table-cell">Submitted</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-[#9B9A96] tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F0ED]">
                    {recentApplications.map((app) => (
                      <tr key={app.id} className="hover:bg-[#F8F8F7]/60 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-[#1A1A18]">
                          {app.nonprofit.orgName}
                        </td>
                        <td className="px-5 py-3.5 text-[#6B6A66] max-w-[200px]">
                          <p className="truncate">{app.rfp.title}</p>
                        </td>
                        <td className="px-5 py-3.5 text-[#9B9A96] hidden sm:table-cell">
                          {new Date(app.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={app.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
}
