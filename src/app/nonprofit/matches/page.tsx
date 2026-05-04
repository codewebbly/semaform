import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/Sidebar";

const GridIcon = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="5" height="5" rx="1" /><rect x="9" y="2" width="5" height="5" rx="1" />
    <rect x="2" y="9" width="5" height="5" rx="1" /><rect x="9" y="9" width="5" height="5" rx="1" />
  </svg>
);
const SearchIcon = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="7" cy="7" r="4.5" /><path d="M10.5 10.5L13.5 13.5" />
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
function scoreLabel(score: number) {
  if (score >= 75) return "Strong match";
  if (score >= 50) return "Moderate match";
  return "Low match";
}

export default async function NonprofitMatchesPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "NONPROFIT") redirect("/auth/login");

  const profile = await prisma.nonprofitProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) redirect("/nonprofit/profile");

  const matches = await prisma.matchScore.findMany({
    where: { nonprofitId: profile.id },
    orderBy: { score: "desc" },
    include: {
      rfp: {
        select: {
          id: true,
          title: true,
          fundingAmount: true,
          deadline: true,
          donor: { select: { orgName: true } },
        },
      },
    },
  });

  return (
    <div className="flex min-h-screen bg-[#F8F8F7]">
      <Sidebar navItems={NONPROFIT_NAV} role="Nonprofit" userEmail={session.user.email!} />

      <div className="flex-1 md:ml-[240px] pt-12 md:pt-0">
        <main className="max-w-5xl mx-auto px-6 py-8">

          <div className="mb-8">
            <h1 className="text-xl font-semibold text-[#1A1A18]">Match Scores</h1>
            <p className="text-sm text-[#6B6A66] mt-1">
              {matches.length} {matches.length === 1 ? "opportunity" : "opportunities"} scored · sorted by best match
            </p>
          </div>

          {matches.length === 0 ? (
            <div className="bg-white rounded-[8px] border border-dashed border-[#E5E4E0] p-16 text-center">
              <p className="text-sm text-[#6B6A66] mb-3">
                No match scores yet — generated as you browse RFPs.
              </p>
              <Link href="/nonprofit/rfps" className="text-sm text-[#1A6BFF] hover:underline font-medium">
                Browse opportunities →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {matches.map((m) => (
                <div key={m.id} className="bg-white rounded-[8px] border border-[#E5E4E0] p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-[#1A1A18] truncate">{m.rfp.title}</h3>
                      <p className="text-xs text-[#6B6A66] mt-0.5">
                        {m.rfp.donor?.orgName ?? "External Funder"}
                        <span className="mx-1.5 text-[#E5E4E0]">·</span>
                        ${m.rfp.fundingAmount.toLocaleString()}
                      </p>
                      <p className="text-xs text-[#9B9A96] mt-2 leading-relaxed italic">
                        {m.justification}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`inline-flex text-sm font-bold px-3 py-1 rounded-full tabular-nums ${scoreBadgeClass(m.score)}`}>
                        {m.score}
                      </span>
                      <span className={`text-xs font-medium ${scoreBadgeClass(m.score)}`}>
                        {scoreLabel(m.score)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F1F0ED] text-xs text-[#9B9A96]">
                    <span>
                      Due {new Date(m.rfp.deadline).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </span>
                    <Link
                      href={`/nonprofit/rfps/${m.rfp.id}/apply`}
                      className="text-[#1A6BFF] font-semibold hover:underline"
                    >
                      Apply →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
