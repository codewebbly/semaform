import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/Sidebar";

const GridIcon = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="5" height="5" rx="1" /><rect x="9" y="2" width="5" height="5" rx="1" />
    <rect x="2" y="9" width="5" height="5" rx="1" /><rect x="9" y="9" width="5" height="5" rx="1" />
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
    <path d="M1.5 9.5h3.5l1 2h4l1-2h3.5" /><rect x="1.5" y="2.5" width="13" height="10" rx="1" />
  </svg>
);

const DONOR_NAV = [
  { href: "/donor/dashboard",    label: "Dashboard",    icon: GridIcon,  exact: true },
  { href: "/donor/rfps/new",     label: "Post RFP",     icon: PlusIcon,  exact: true },
  { href: "/donor/rfps",         label: "My RFPs",      icon: DocIcon,   exact: true },
  { href: "/donor/applications", label: "Applications", icon: InboxIcon               },
];

function scoreBadgeClass(score: number) {
  if (score >= 75) return "bg-[#F0FDF4] text-[#16A34A]";
  if (score >= 50) return "bg-[#FFFBEB] text-[#D97706]";
  return "bg-[#F1F0ED] text-[#6B6A66]";
}

export default async function DonorMatchesPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "DONOR") redirect("/auth/login");

  const profile = await prisma.donorProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) redirect("/donor/profile");

  const matches = await prisma.matchScore.findMany({
    where: { rfp: { donorId: profile.id } },
    orderBy: { computedAt: "desc" },
    include: {
      nonprofit: { select: { orgName: true } },
      rfp:       { select: { title: true, fundingAmount: true } },
    },
  });

  return (
    <div className="flex min-h-screen bg-[#F8F8F7]">
      <Sidebar navItems={DONOR_NAV} role="Donor" userEmail={session.user.email!} />

      <div className="flex-1 md:ml-[240px] pt-12 md:pt-0">
        <main className="max-w-5xl mx-auto px-6 py-8">

          <div className="mb-8">
            <h1 className="text-xl font-semibold text-[#1A1A18]">AI Match Scores</h1>
            <p className="text-sm text-[#6B6A66] mt-1">
              {matches.length} match {matches.length === 1 ? "score" : "scores"} computed for your RFPs
            </p>
          </div>

          {matches.length === 0 ? (
            <div className="bg-white rounded-[8px] border border-dashed border-[#E5E4E0] p-16 text-center">
              <p className="text-sm text-[#6B6A66]">
                No match scores yet — generated when nonprofits view your RFPs.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-[8px] border border-[#E5E4E0] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#F1F0ED]">
                      <th className="px-5 py-3 text-left text-xs font-medium text-[#9B9A96] tracking-wide">Nonprofit</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-[#9B9A96] tracking-wide">RFP</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-[#9B9A96] tracking-wide">Score</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-[#9B9A96] tracking-wide hidden md:table-cell">Justification</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-[#9B9A96] tracking-wide hidden sm:table-cell">Computed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F0ED]">
                    {matches.map((m) => (
                      <tr key={m.id} className="hover:bg-[#F8F8F7]/60 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-[#1A1A18]">
                          {m.nonprofit.orgName}
                        </td>
                        <td className="px-5 py-3.5 text-[#6B6A66] max-w-[180px]">
                          <p className="truncate">{m.rfp.title}</p>
                          <p className="text-xs text-[#9B9A96]">
                            ${m.rfp.fundingAmount.toLocaleString()}
                          </p>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex text-xs font-semibold px-2 py-0.5 rounded-full tabular-nums ${scoreBadgeClass(m.score)}`}>
                            {m.score}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-[#6B6A66] hidden md:table-cell max-w-[240px]">
                          <p className="truncate text-xs">{m.justification}</p>
                        </td>
                        <td className="px-5 py-3.5 text-[#9B9A96] hidden sm:table-cell">
                          {new Date(m.computedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
