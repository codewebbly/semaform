import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import { DiscoveryFilters } from "@/components/rfps/DiscoveryFilters";
import { RFPCard } from "@/components/rfps/RFPCard";

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

interface Props {
  searchParams: { search?: string; focusArea?: string; geography?: string };
}

export default async function NonprofitRFPsPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "NONPROFIT") redirect("/auth/login");

  const profile = await prisma.nonprofitProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) redirect("/nonprofit/profile");

  const { search, focusArea, geography } = searchParams;
  const where: Prisma.RFPWhereInput = { published: true };

  if (search?.trim()) {
    const tsQuery = search.trim().split(/\s+/).filter(Boolean).join(" & ");
    where.OR = [
      { title: { search: tsQuery } },
      { description: { search: tsQuery } },
    ];
  }
  if (focusArea?.trim()) where.focusAreas = { hasSome: [focusArea.trim()] };
  if (geography?.trim()) where.geographies = { hasSome: [geography.trim()] };

  const rfps = await prisma.rFP.findMany({
    where,
    include: { donor: { select: { orgName: true } } },
    orderBy: [{ deadline: "asc" }, { createdAt: "desc" }],
  });

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const cachedScores = await prisma.matchScore.findMany({
    where: {
      nonprofitId: profile.id,
      rfpId: { in: rfps.map((r) => r.id) },
      computedAt: { gte: sevenDaysAgo },
    },
    select: { rfpId: true, score: true, justification: true },
  });
  const scoreMap = Object.fromEntries(
    cachedScores.map((s) => [s.rfpId, { score: s.score, justification: s.justification }])
  );

  return (
    <div className="flex min-h-screen bg-[#F8F8F7]">
      <Sidebar navItems={NONPROFIT_NAV} role="Nonprofit" userEmail={session.user.email!} />

      <div className="flex-1 md:ml-[240px] pt-12 md:pt-0">
        <main className="max-w-4xl mx-auto px-6 py-8">

          <div className="mb-6">
            <h1 className="text-xl font-semibold text-[#1A1A18]">Find Funding</h1>
            <p className="text-sm text-[#6B6A66] mt-1">
              AI match scores load automatically — hover the badge for the full reasoning.
            </p>
          </div>

          <DiscoveryFilters
            search={search}
            focusArea={focusArea}
            geography={geography}
            resultCount={rfps.length}
          />

          {rfps.length === 0 ? (
            <div className="bg-white rounded-[8px] border border-dashed border-[#E5E4E0] p-16 text-center">
              <p className="text-sm text-[#6B6A66]">
                No opportunities match your filters. Try broadening your search.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {rfps.map((rfp) => (
                <RFPCard
                  key={rfp.id}
                  rfp={rfp}
                  showMatchScore
                  initialMatchScore={scoreMap[rfp.id]}
                  applyHref={`/nonprofit/rfps/${rfp.id}/apply`}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
