import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/Button";

const GridIcon = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="5" height="5" rx="1" /><rect x="9" y="2" width="5" height="5" rx="1" />
    <rect x="2" y="9" width="5" height="5" rx="1" /><rect x="9" y="9" width="5" height="5" rx="1" />
  </svg>
);
const SearchIcon = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="7" cy="7" r="4.5" />
    <path d="M10.5 10.5L13.5 13.5" />
  </svg>
);
const InboxIcon = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1.5 9.5h3.5l1 2h4l1-2h3.5" /><rect x="1.5" y="2.5" width="13" height="10" rx="1" />
  </svg>
);

const NONPROFIT_NAV = [
  { href: "/nonprofit/dashboard",    label: "Dashboard",       icon: GridIcon,   exact: true },
  { href: "/nonprofit/rfps",         label: "Find RFPs",       icon: SearchIcon               },
  { href: "/nonprofit/applications", label: "My Applications", icon: InboxIcon                },
];

function scoreBadgeClass(score: number) {
  if (score >= 75) return "bg-[#F0FDF4] text-[#16A34A]";
  if (score >= 50) return "bg-[#FFFBEB] text-[#D97706]";
  return "bg-[#F1F0ED] text-[#6B6A66]";
}

export default async function NonprofitDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "NONPROFIT") redirect("/auth/login");

  const profile = await prisma.nonprofitProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) redirect("/nonprofit/profile");

  const [openRfpCount, applicationCount, matchCount, topMatches] = await Promise.all([
    prisma.rFP.count({ where: { published: true } }),
    prisma.application.count({ where: { nonprofitId: profile.id } }),
    prisma.matchScore.count({ where: { nonprofitId: profile.id } }),
    prisma.matchScore.findMany({
      where: { nonprofitId: profile.id },
      orderBy: { score: "desc" },
      take: 5,
      include: {
        rfp: { select: { id: true, title: true, fundingAmount: true } },
      },
    }),
  ]);

  const stats = [
    { label: "Open RFPs",             value: openRfpCount,     href: "/nonprofit/rfps" },
    { label: "Applications Submitted", value: applicationCount, href: "/nonprofit/applications" },
    { label: "Match Scores",           value: matchCount,       href: "/nonprofit/matches" },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8F8F7]">
      <Sidebar navItems={NONPROFIT_NAV} role="Nonprofit" userEmail={session.user.email!} />

      <div className="flex-1 md:ml-[240px] pt-12 md:pt-0">
        <main className="max-w-5xl mx-auto px-6 py-8">

          {/* Page header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-xl font-semibold text-[#1A1A18]">
                Welcome back, {profile.orgName}
              </h1>
              <p className="text-sm text-[#6B6A66] mt-1">
                Discover funding opportunities matched to your mission.
              </p>
            </div>
            <Link href="/nonprofit/rfps">
              <Button size="sm">Browse RFPs</Button>
            </Link>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {stats.map((s) => (
              <Link
                key={s.label}
                href={s.href}
                className="group block bg-white rounded-[8px] border border-[#E5E4E0] p-5 hover:border-[#16A34A]/40 transition-colors"
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

          {/* Top Matches */}
          <div className="bg-white rounded-[8px] border border-[#E5E4E0]">
            <div className="px-5 py-4 border-b border-[#E5E4E0] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#1A1A18]">Top Matches</h2>
              <Link href="/nonprofit/matches" className="text-xs text-[#1A6BFF] hover:underline">
                View all
              </Link>
            </div>

            {topMatches.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <p className="text-sm text-[#6B6A66]">No match scores yet.</p>
                <Link
                  href="/nonprofit/rfps"
                  className="text-sm text-[#1A6BFF] hover:underline mt-1 inline-block"
                >
                  Browse opportunities to generate scores →
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#F1F0ED]">
                      <th className="px-5 py-3 text-left text-xs font-medium text-[#9B9A96] tracking-wide">RFP</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-[#9B9A96] tracking-wide hidden sm:table-cell">Amount</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-[#9B9A96] tracking-wide">Score</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-[#9B9A96] tracking-wide"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F0ED]">
                    {topMatches.map((m) => (
                      <tr key={m.id} className="hover:bg-[#F8F8F7]/60 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-[#1A1A18] max-w-[220px]">
                          <p className="truncate">{m.rfp.title}</p>
                        </td>
                        <td className="px-5 py-3.5 text-[#6B6A66] hidden sm:table-cell">
                          ${m.rfp.fundingAmount.toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex text-xs font-semibold px-2 py-0.5 rounded-full tabular-nums ${scoreBadgeClass(m.score)}`}>
                            {m.score}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <Link
                            href={`/nonprofit/rfps/${m.rfp.id}/apply`}
                            className="text-xs text-[#1A6BFF] font-medium hover:underline"
                          >
                            Apply →
                          </Link>
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
